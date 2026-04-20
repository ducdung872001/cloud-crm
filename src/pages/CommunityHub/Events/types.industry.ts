// ĐẶC THÙ: Types riêng cho vertical fitness/spa/community hub.
// Để port sang ngành khác, thay file này + storage.industry.ts.
// Xoá file này → module Sự kiện chung vẫn compile và chạy.

import type { IServiceItem, ServiceCategory } from "mocks/community-hub/service-catalog";
import type { EventAddOnItem } from "./types";

// ── Map service catalog item → event add-on ───────────────────────────────
export interface ServiceAddOnMapping {
  serviceId: string; // IServiceItem.id
  overridePrice?: number; // giá riêng cho event (null → dùng giá catalog)
  overrideMaxQty?: number;
}

// ── Service usage — tracking dịch vụ khách dùng trong event ───────────────
export interface ServiceUsageRecord {
  id: string;
  registrationId: string;
  serviceId: string; // IServiceItem.id
  serviceName: string; // denormalized để hiển thị
  qty: number;
  unitPrice: number;
  recordedAt: string; // ISO
  recordedBy?: string; // tên admin
}

// ── Industry extension cho EventEntity ────────────────────────────────────
export interface IndustryEventExtension {
  serviceCatalogAddOns?: ServiceAddOnMapping[];
  allowedServiceCategories?: ServiceCategory[];
}

// ── Helper: convert IServiceItem + mapping → generic EventAddOnItem ───────
export function serviceToAddOnItem(
  svc: IServiceItem,
  mapping?: ServiceAddOnMapping,
): EventAddOnItem {
  return {
    id: `svc-${svc.id}`,
    name: svc.name,
    description: svc.description,
    unitPrice: mapping?.overridePrice ?? svc.price,
    unit: svc.unit,
    maxQty: mapping?.overrideMaxQty,
  };
}
