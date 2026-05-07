import { v4 as uuid } from "uuid";
import { db } from "../db/store.js";
import type { ReferralLink, ReferralAttribution, ReferralStatus, CommissionRule } from "../db/types.js";

/**
 * Referral / affiliate engine.
 *
 * Lifecycle: click → signed_up → converted → paid_out.
 * State transitions:
 *   - trackClick(code) → tạo attribution status='click' (mỗi click 1 row, sau dedupe theo cookieId nếu có)
 *   - linkSignup(attributionId, refereeMentorId) → status='signed_up'
 *   - markConverted(attributionId, plan, amountVND) → compute commission + status='converted'
 *   - markPaidOut(attributionId, payoutInvoiceId) → status='paid_out'
 *
 * Commission: lookup CommissionRule(platform/tenant) → ratesByPlan[plan] / 100 * amountVND
 */

export function createLink(input: {
  ownerMentorId: string;
  tenantId: string;
  code?: string;
  campaign?: string;
}): ReferralLink {
  const code = (input.code ?? generateCode(input.ownerMentorId)).toUpperCase();
  if (db.referralCodeIndex.has(code)) {
    const err = new Error(`[referral] code "${code}" đã tồn tại`);
    (err as Error & { code?: number }).code = 409;
    throw err;
  }
  const id = "RL-" + uuid().slice(0, 8);
  const link: ReferralLink = {
    id,
    ownerMentorId: input.ownerMentorId,
    tenantId: input.tenantId,
    code,
    campaign: input.campaign,
    active: true,
    createdAt: new Date().toISOString(),
  };
  db.referralLinks.set(id, link);
  db.referralCodeIndex.set(code, id);
  return link;
}

export function listLinks(ownerMentorId: string): ReferralLink[] {
  return Array.from(db.referralLinks.values()).filter((l) => l.ownerMentorId === ownerMentorId);
}

export function deactivateLink(id: string): boolean {
  const l = db.referralLinks.get(id);
  if (!l) return false;
  l.active = false;
  return true;
}

export function trackClick(code: string): ReferralAttribution | null {
  const linkId = db.referralCodeIndex.get(code.toUpperCase());
  if (!linkId) return null;
  const link = db.referralLinks.get(linkId);
  if (!link?.active) return null;
  const attr: ReferralAttribution = {
    id: "RA-" + uuid().slice(0, 8),
    linkId,
    status: "click",
    clickedAt: new Date().toISOString(),
  };
  db.referralAttributions.set(attr.id, attr);
  return attr;
}

export function linkSignup(attributionId: string, refereeMentorId: string, refereeTenantId: string): ReferralAttribution {
  const attr = db.referralAttributions.get(attributionId);
  if (!attr) throw new Error(`[referral] attribution ${attributionId} not found`);
  if (attr.status !== "click") throw new Error(`[referral] đã ${attr.status}, không thể signed_up lại`);
  attr.refereeMentorId = refereeMentorId;
  attr.refereeTenantId = refereeTenantId;
  attr.signedUpAt = new Date().toISOString();
  attr.status = "signed_up";
  return attr;
}

export interface MarkConvertedInput {
  attributionId: string;
  plan: string;            // 'starter' | 'pro' | 'master' | 'academy'
  amountVND: number;
}

export function markConverted(input: MarkConvertedInput): ReferralAttribution & { commissionVND: number } {
  const attr = db.referralAttributions.get(input.attributionId);
  if (!attr) throw new Error(`[referral] attribution ${input.attributionId} not found`);
  if (attr.status !== "signed_up") throw new Error(`[referral] phải signed_up trước khi convert (hiện ${attr.status})`);

  const commission = computeCommission(attr.refereeTenantId ?? "PLATFORM", input.plan, input.amountVND);
  attr.convertedToPlan = input.plan;
  attr.conversionAmountVND = input.amountVND;
  attr.commissionVND = commission;
  attr.convertedAt = new Date().toISOString();
  attr.status = "converted";
  return { ...attr, commissionVND: commission };
}

export function markPaidOut(attributionId: string, payoutInvoiceId: string): ReferralAttribution {
  const attr = db.referralAttributions.get(attributionId);
  if (!attr) throw new Error(`[referral] attribution ${attributionId} not found`);
  if (attr.status !== "converted") throw new Error(`[referral] phải converted trước (hiện ${attr.status})`);
  attr.paidOutAt = new Date().toISOString();
  attr.payoutInvoiceId = payoutInvoiceId;
  attr.status = "paid_out";
  return attr;
}

export function computeCommission(tenantId: string, plan: string, amountVND: number): number {
  const rule = db.commissionRules.get(tenantId) ?? db.commissionRules.get("PLATFORM");
  if (!rule) return 0;
  const pct = rule.ratesByPlan[plan] ?? 0;
  return Math.round((amountVND * pct) / 100);
}

export interface ReferralStats {
  ownerMentorId: string;
  totalClicks: number;
  totalSignups: number;
  totalConversions: number;
  totalCommissionEarnedVND: number;
  totalPaidOutVND: number;
  pendingPayoutVND: number;
}

export function statsFor(ownerMentorId: string): ReferralStats {
  const links = listLinks(ownerMentorId);
  const linkIds = new Set(links.map((l) => l.id));
  const attrs = Array.from(db.referralAttributions.values()).filter((a) => linkIds.has(a.linkId));

  const totalCommissionEarnedVND = attrs.reduce((s, a) => s + (a.commissionVND ?? 0), 0);
  const totalPaidOutVND = attrs.filter((a) => a.status === "paid_out").reduce((s, a) => s + (a.commissionVND ?? 0), 0);

  return {
    ownerMentorId,
    totalClicks: attrs.length,
    totalSignups: attrs.filter((a) => ["signed_up", "converted", "paid_out"].includes(a.status)).length,
    totalConversions: attrs.filter((a) => ["converted", "paid_out"].includes(a.status)).length,
    totalCommissionEarnedVND,
    totalPaidOutVND,
    pendingPayoutVND: totalCommissionEarnedVND - totalPaidOutVND,
  };
}

export function getCommissionRule(tenantId: string): CommissionRule | undefined {
  return db.commissionRules.get(tenantId) ?? db.commissionRules.get("PLATFORM");
}

export function setCommissionRule(tenantId: string, patch: Partial<CommissionRule>): CommissionRule {
  let rule = db.commissionRules.get(tenantId);
  if (!rule) {
    rule = {
      tenantId,
      ratesByPlan: {},
      recurring: false,
      maxRecurringMonths: 0,
      minPayoutVND: 0,
      updatedAt: new Date().toISOString(),
    };
    db.commissionRules.set(tenantId, rule);
  }
  Object.assign(rule, patch, { tenantId, updatedAt: new Date().toISOString() });
  return rule;
}

function generateCode(mentorId: string): string {
  const prefix = mentorId.replace(/[^A-Z0-9]/gi, "").slice(0, 4).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}${rand}`;
}

/** Lookup link by code — public, không expose sensitive */
export function lookupCode(code: string): { linkId: string; ownerMentorId: string; campaign?: string } | null {
  const linkId = db.referralCodeIndex.get(code.toUpperCase());
  if (!linkId) return null;
  const link = db.referralLinks.get(linkId);
  if (!link?.active) return null;
  return { linkId, ownerMentorId: link.ownerMentorId, campaign: link.campaign };
}
