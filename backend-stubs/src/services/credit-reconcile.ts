import { db } from "../db/store.js";

/**
 * Credit reconciliation report — invariant check.
 *
 * Invariant: với mỗi tenant, balance hiện tại = sum(transactions.amount) trong
 * toàn lifetime. Period reconcile: sum(grant + earn + refund) - sum(spend + swap) = balance change.
 *
 * Discrepancy thường do bug code (forgot to log txn) hoặc data drift. Report
 * này flag tenant nào lệch để admin manual fix.
 */

export interface TenantReconcile {
  tenantId: string;
  /** Balance hiện tại trong wallet */
  walletBalance: number;
  /** Tổng từ transaction log */
  txnSum: number;
  /** discrepancy = walletBalance - txnSum. Nếu != 0 → bug. */
  discrepancy: number;
  /** Period stats nếu period filter */
  periodGranted: number;
  periodEarned: number;
  periodSpent: number;
  periodRefunded: number;
  txnCount: number;
}

export interface ReconcileReport {
  period?: string;
  generatedAt: string;
  totals: {
    walletsAudited: number;
    healthyCount: number;
    discrepancyCount: number;
    totalGranted: number;
    totalEarned: number;
    totalSpent: number;
    totalRefunded: number;
    totalNetIssued: number;     // granted + earned - spent - swap (net credit còn nằm trong system)
  };
  perTenant: TenantReconcile[];
}

export function reconcile(period?: string): ReconcileReport {
  const periodStart = period ? new Date(`${period}-01T00:00:00Z`) : null;
  const periodEnd = period ? new Date(periodStart!) : null;
  if (periodEnd) periodEnd.setMonth(periodEnd.getMonth() + 1);

  const perTenant: TenantReconcile[] = [];
  let healthyCount = 0;
  let discrepancyCount = 0;
  let totalGranted = 0;
  let totalEarned = 0;
  let totalSpent = 0;
  let totalRefunded = 0;

  for (const wallet of db.creditWallets.values()) {
    const allTxns = db.creditTransactions.filter((t) => t.tenantId === wallet.tenantId);
    const txnSum = allTxns.reduce((s, t) => s + t.amount, 0);
    const discrepancy = wallet.balance - txnSum;

    const periodTxns = period
      ? allTxns.filter((t) => new Date(t.createdAt) >= periodStart! && new Date(t.createdAt) < periodEnd!)
      : allTxns;
    const periodGranted = periodTxns.filter((t) => t.type === "grant").reduce((s, t) => s + t.amount, 0);
    const periodEarned = periodTxns.filter((t) => t.type === "earn").reduce((s, t) => s + t.amount, 0);
    const periodSpent = -periodTxns.filter((t) => t.type === "spend" || t.type === "swap").reduce((s, t) => s + t.amount, 0);
    const periodRefunded = periodTxns.filter((t) => t.type === "refund").reduce((s, t) => s + t.amount, 0);

    perTenant.push({
      tenantId: wallet.tenantId,
      walletBalance: wallet.balance,
      txnSum,
      discrepancy,
      periodGranted,
      periodEarned,
      periodSpent,
      periodRefunded,
      txnCount: periodTxns.length,
    });

    if (discrepancy === 0) healthyCount++; else discrepancyCount++;
    totalGranted += periodGranted;
    totalEarned += periodEarned;
    totalSpent += periodSpent;
    totalRefunded += periodRefunded;
  }

  return {
    period,
    generatedAt: new Date().toISOString(),
    totals: {
      walletsAudited: perTenant.length,
      healthyCount,
      discrepancyCount,
      totalGranted,
      totalEarned,
      totalSpent,
      totalRefunded,
      totalNetIssued: totalGranted + totalEarned + totalRefunded - totalSpent,
    },
    perTenant: perTenant.sort((a, b) => Math.abs(b.discrepancy) - Math.abs(a.discrepancy)),
  };
}
