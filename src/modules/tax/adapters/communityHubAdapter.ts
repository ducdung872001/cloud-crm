// Community Hub adapter — map từ nhánh community-hub sang shape chuẩn.
//
// Nguồn dữ liệu: checkin, service booking, event ticket, membership subscription.
// Tất cả đều là "dịch vụ" theo TT40 → nhóm service_no_material (GTGT 5% + TNCN 2% = 7%).
// Riêng bán hàng mang về / bán sản phẩm phụ trợ có thể là distribution (1.5%) —
// khi đó tag vào serviceName và adapter sẽ phân loại.

import type { DataSourceAdapter } from "./types";
import type { RevenueRecord, IndustryGroup } from "../domain/types";
import { mockAdapter } from "./mockAdapter";

type CHTransaction = {
  id: string;
  occurredAt: string;
  amount: number;
  kind: "checkin" | "service" | "event" | "subscription" | "product";
  name?: string;
  status?: string;
};

let _provider: (() => Promise<CHTransaction[]>) | null = null;

export function setCommunityHubProvider(
  provider: () => Promise<CHTransaction[]>
): void {
  _provider = provider;
}

function classify(kind: CHTransaction["kind"]): IndustryGroup {
  // "product" → phân phối hàng hoá (1.5%). Còn lại → dịch vụ (7%).
  if (kind === "product") return "distribution";
  return "service_no_material";
}

function mapToRevenue(tx: CHTransaction): RevenueRecord {
  return {
    id: `community-${tx.id}`,
    occurredAt: tx.occurredAt,
    amount: tx.amount,
    industryGroup: classify(tx.kind),
    description: tx.name ?? `Community Hub — ${tx.kind}`,
    sourceModule: `community.${tx.kind}`,
    sourceRefId: tx.id,
    isTaxable: tx.status !== "cancelled" && tx.status !== "refunded",
  };
}

export const communityHubAdapter: DataSourceAdapter = {
  name: "community",
  displayName: "Reborn Community Hub",

  async getRevenueRecords({ startDate, endDate }) {
    if (!_provider) {
      return mockAdapter.getRevenueRecords({ startDate, endDate });
    }
    const txs = await _provider();
    return txs
      .map(mapToRevenue)
      .filter((r) => r.occurredAt >= startDate && r.occurredAt <= endDate);
  },

  async getExpenseRecords({ startDate, endDate }) {
    return mockAdapter.getExpenseRecords!({ startDate, endDate });
  },

  async getInventorySnapshot() {
    // Community Hub thiên về dịch vụ, tồn kho không đáng kể — trả null
    return null;
  },
};
