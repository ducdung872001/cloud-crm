// FitPro adapter — map dữ liệu từ nhánh reborn-fitpro sang shape chuẩn của tax module.
//
// Nhánh FitPro có ServiceBooking (khách đặt buổi tập) + các giao dịch thẻ.
// Tất cả được coi là doanh thu nhóm "service_no_material" (dịch vụ, 7%).
// Khi port sang nhánh khác: copy file này, đổi import nguồn + mapping group.

import type { DataSourceAdapter } from "./types";
import type { RevenueRecord, ExpenseRecord, IndustryGroup } from "../domain/types";
import { mockAdapter } from "./mockAdapter";

// Cho phép UI inject dữ liệu thật lúc runtime (khi đã có BE). Hiện tại fallback sang mock.
type FitProBooking = {
  id: string;
  bookedAt: string;
  totalAmount: number;
  stationType?: "home" | "coworking";
  serviceName?: string;
  status?: string;
};

let _bookingsProvider: (() => Promise<FitProBooking[]>) | null = null;

export function setFitProBookingsProvider(
  provider: () => Promise<FitProBooking[]>
): void {
  _bookingsProvider = provider;
}

function mapBookingToRevenue(b: FitProBooking): RevenueRecord {
  const group: IndustryGroup = "service_no_material"; // FitPro = dịch vụ phòng tập
  return {
    id: `fitpro-${b.id}`,
    occurredAt: b.bookedAt,
    amount: b.totalAmount,
    industryGroup: group,
    description: b.serviceName ?? `Dịch vụ FitPro ${b.stationType ?? ""}`.trim(),
    sourceModule: "fitpro.booking",
    sourceRefId: b.id,
    isTaxable: b.status !== "cancelled" && b.status !== "refunded",
  };
}

export const fitproAdapter: DataSourceAdapter = {
  name: "fitpro",
  displayName: "Reborn FitPro",

  async getRevenueRecords({ startDate, endDate }) {
    // Nếu chưa có provider thật, fallback sang mock để UI demo được ngay
    if (!_bookingsProvider) {
      return mockAdapter.getRevenueRecords({ startDate, endDate });
    }
    const bookings = await _bookingsProvider();
    return bookings
      .map(mapBookingToRevenue)
      .filter(
        (r) => r.occurredAt >= startDate && r.occurredAt <= endDate
      );
  },

  async getExpenseRecords({ startDate, endDate }) {
    // FitPro hiện chưa có module expense riêng — dùng mock làm gợi ý
    return mockAdapter.getExpenseRecords!({ startDate, endDate });
  },

  async getInventorySnapshot({ startDate, endDate }) {
    // FitPro là dịch vụ thuần, không có tồn kho → trả null
    return null;
  },
};
