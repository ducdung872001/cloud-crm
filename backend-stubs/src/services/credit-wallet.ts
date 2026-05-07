import { v4 as uuid } from "uuid";
import { db } from "../db/store.js";
import type { CreditTransaction, CreditTxnType, CreditWallet, CreditRule } from "../db/types.js";

/**
 * Credit wallet service — atomic balance change + audit transaction log.
 *
 * Mọi mutation balance đi qua `applyTxn` để đảm bảo:
 *   1. Đồng bộ balance + transaction log
 *   2. Reject spend khi insufficient
 *   3. Cache earnedThisPeriod / spentThisPeriod
 *
 * Production: dùng SELECT FOR UPDATE / row lock thay vì JS Map.
 */

export class InsufficientCreditError extends Error {
  code = 402;
  constructor(public required: number, public balance: number) {
    super(`[credit] insufficient: need ${required}, have ${balance}`);
  }
}

export interface ApplyTxnInput {
  tenantId: string;
  type: CreditTxnType;
  /** Positive cho grant/earn/refund. Negative cho spend/swap-out. Adjust có thể ±. */
  amount: number;
  reason: string;
  sessionId?: string;
  bookingId?: string;
  createdBy: string;
}

export function ensureWallet(tenantId: string): CreditWallet {
  let wallet = db.creditWallets.get(tenantId);
  if (!wallet) {
    const rules = db.creditRules.get(tenantId);
    wallet = {
      tenantId,
      balance: 0,
      earnedThisPeriod: 0,
      spentThisPeriod: 0,
      rules: rules ? {
        monthlyGrant: rules.monthlyGrant,
        swapRatePct: rules.swapRatePct,
        rolloverEnabled: rules.rolloverEnabled,
        rolloverCap: rules.rolloverCap,
      } : { monthlyGrant: 0, swapRatePct: 0, rolloverEnabled: false, rolloverCap: 0 },
      updatedAt: new Date().toISOString(),
    };
    db.creditWallets.set(tenantId, wallet);
  }
  return wallet;
}

export function getBalance(tenantId: string): CreditWallet {
  return ensureWallet(tenantId);
}

export function applyTxn(input: ApplyTxnInput): CreditTransaction {
  const wallet = ensureWallet(input.tenantId);

  // Validate spend
  if (input.amount < 0 && wallet.balance + input.amount < 0) {
    throw new InsufficientCreditError(-input.amount, wallet.balance);
  }

  wallet.balance += input.amount;
  if (input.type === "grant" || input.type === "earn" || (input.type === "adjust" && input.amount > 0) || input.type === "refund") {
    wallet.earnedThisPeriod += Math.abs(input.amount);
  }
  if (input.type === "spend" || (input.type === "adjust" && input.amount < 0) || input.type === "swap") {
    wallet.spentThisPeriod += Math.abs(input.amount);
  }
  wallet.updatedAt = new Date().toISOString();

  const txn: CreditTransaction = {
    id: "CTX-" + uuid().slice(0, 8),
    tenantId: input.tenantId,
    type: input.type,
    amount: input.amount,
    balanceAfter: wallet.balance,
    reason: input.reason,
    sessionId: input.sessionId,
    bookingId: input.bookingId,
    createdBy: input.createdBy,
    createdAt: new Date().toISOString(),
  };
  db.creditTransactions.push(txn);
  return txn;
}

export function listTransactions(
  tenantId: string,
  opts?: { since?: Date; until?: Date; type?: CreditTxnType; limit?: number },
): CreditTransaction[] {
  const limit = opts?.limit ?? 100;
  const all = db.creditTransactions
    .filter((t) => t.tenantId === tenantId)
    .filter((t) => !opts?.type || t.type === opts.type)
    .filter((t) => !opts?.since || new Date(t.createdAt) >= opts.since)
    .filter((t) => !opts?.until || new Date(t.createdAt) < opts.until)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return all.slice(0, limit);
}

/**
 * Cron-callable: cấp credit hàng tháng cho mọi tenant theo rule.
 * Chạy vào ngày 1 mỗi tháng (production cron). Gọi nhiều lần idempotent qua
 * `earnedThisPeriod` reset + check tag `monthly_grant_YYYY-MM`.
 */
export function runMonthlyGrant(now = new Date()): { granted: number } {
  const periodTag = `monthly_grant_${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  let granted = 0;

  for (const wallet of db.creditWallets.values()) {
    const rules = db.creditRules.get(wallet.tenantId);
    if (!rules || rules.monthlyGrant <= 0) continue;

    // Idempotency: skip nếu đã grant trong period này
    const already = db.creditTransactions.some((t) =>
      t.tenantId === wallet.tenantId && t.type === "grant" && t.reason === periodTag,
    );
    if (already) continue;

    // Apply rollover policy: nếu không rollover → reset balance trước khi grant
    if (!rules.rolloverEnabled && wallet.balance > 0) {
      applyTxn({
        tenantId: wallet.tenantId,
        type: "adjust",
        amount: -wallet.balance,
        reason: `period_reset_${periodTag}`,
        createdBy: "system",
      });
    } else if (rules.rolloverEnabled && rules.rolloverCap > 0 && wallet.balance > rules.rolloverCap) {
      // Cap rollover
      applyTxn({
        tenantId: wallet.tenantId,
        type: "adjust",
        amount: -(wallet.balance - rules.rolloverCap),
        reason: `rollover_cap_${periodTag}`,
        createdBy: "system",
      });
    }

    applyTxn({
      tenantId: wallet.tenantId,
      type: "grant",
      amount: rules.monthlyGrant,
      reason: periodTag,
      createdBy: "system",
    });

    // Reset period counters
    wallet.earnedThisPeriod = rules.monthlyGrant;
    wallet.spentThisPeriod = 0;
    granted++;
  }

  return { granted };
}

/**
 * Tính cost thực tế cho 1 booking sau khi apply tier discount.
 * Master/Academy có discount → nominal × (1 - tierDiscountPct/100).
 */
export function computeBookingCost(tenantId: string, nominalCredits: number): number {
  const rules = db.creditRules.get(tenantId);
  const pct = rules?.tierDiscountPct ?? 0;
  return Math.round(nominalCredits * (1 - pct / 100));
}

export function getRules(tenantId: string): CreditRule | undefined {
  return db.creditRules.get(tenantId);
}

export function setRules(tenantId: string, patch: Partial<CreditRule>, updatedBy: string): CreditRule {
  let rules = db.creditRules.get(tenantId);
  if (!rules) {
    rules = {
      tenantId,
      monthlyGrant: 0,
      swapRatePct: 0,
      rolloverEnabled: false,
      rolloverCap: 0,
      earnRules: [],
      tierDiscountPct: 0,
      updatedAt: new Date().toISOString(),
      updatedBy,
    };
    db.creditRules.set(tenantId, rules);
  }
  Object.assign(rules, patch, { tenantId, updatedAt: new Date().toISOString(), updatedBy });
  // Sync wallet rules cache
  const wallet = ensureWallet(tenantId);
  wallet.rules = {
    monthlyGrant: rules.monthlyGrant,
    swapRatePct: rules.swapRatePct,
    rolloverEnabled: rules.rolloverEnabled,
    rolloverCap: rules.rolloverCap,
  };
  return rules;
}
