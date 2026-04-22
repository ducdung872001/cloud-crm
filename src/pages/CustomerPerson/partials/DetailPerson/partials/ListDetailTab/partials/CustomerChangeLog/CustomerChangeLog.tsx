import React, { useEffect, useState } from "react";
import { formatDateTime } from "utils/dateUtils";
import Icon from "components/icon";
import Loading from "components/loading";
import CustomerService from "services/CustomerService";
import { showToast } from "utils/common";
import "./CustomerChangeLog.scss";

interface IChangeLogItem {
  id: number;
  field: string;
  fieldLabel?: string;
  oldValue: string | null;
  newValue: string | null;
  updatedBy: string;
  updatedByAvatar?: string;
  updatedAt: string;
  source?: string;
}

const FIELD_LABEL_MAP: Record<string, string> = {
  name: "Họ tên",
  phone: "Số điện thoại",
  email: "Email",
  address: "Địa chỉ",
  gender: "Giới tính",
  dateOfBirth: "Ngày sinh",
  primaryBranchId: "Siêu thị đăng ký",
  branchId: "Chi nhánh",
  identityCardNumber: "CCCD/CMND",
  employeeId: "NV phụ trách",
  customerGroup: "Nhóm KH",
  customerSource: "Nguồn KH",
  note: "Ghi chú",
};

const SOURCE_LABEL: Record<string, { label: string; color: string }> = {
  self:   { label: "KH tự cập nhật",   color: "#0EA5E9" },
  staff:  { label: "Nhân viên",        color: "#7C3AED" },
  import: { label: "Import hàng loạt", color: "#F59E0B" },
  api:    { label: "API",              color: "#10B981" },
  system: { label: "Hệ thống",         color: "#6B7280" },
};

function labelOfField(key: string): string {
  return FIELD_LABEL_MAP[key] ?? key;
}

function renderValue(v: string | null): string {
  if (v === null || v === undefined || v === "") return "—";
  return v;
}

export default function CustomerChangeLog(props: { idCustomer: number }) {
  const { idCustomer } = props;

  const [lst, setLst] = useState<IChangeLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      setIsLoading(true);
      const res = await CustomerService.changeLog(
        { customerId: idCustomer, page, limit: 20 },
        controller.signal,
      );

      if (cancelled) return;

      if (res?.code === 0) {
        const items: IChangeLogItem[] = res.result?.items ?? [];
        const totalItem: number = res.result?.total ?? 0;
        setTotal(totalItem);
        setHasMore(page * 20 < totalItem);
        setLst(prev => (page === 1 ? items : [...prev, ...items]));
      } else if (res && res.code !== undefined) {
        showToast(res.message ?? "Không tải được lịch sử chỉnh sửa", "error");
      }
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [idCustomer, page]);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const bottom = el.scrollHeight - Math.round(el.scrollTop) <= el.clientHeight + 10;
    if (bottom && hasMore && !isLoading) {
      setPage(p => p + 1);
    }
  };

  return (
    <div className="wrapper__changelog--customer" onScroll={onScroll}>
      {lst.length > 0 && (
        <div className="changelog__head">
          <span className="changelog__total">Tổng {total} lần chỉnh sửa</span>
        </div>
      )}

      {lst.length > 0 && (
        <div className="changelog__list">
          {lst.map(item => {
            const srcCfg = SOURCE_LABEL[item.source ?? "staff"] ?? SOURCE_LABEL.staff;
            return (
              <div key={item.id} className="changelog__item">
                <div className="changelog__item--icon">
                  <Icon name="History" />
                </div>
                <div className="changelog__item--body">
                  <div className="changelog__item--field">
                    <span className="label">{item.fieldLabel ?? labelOfField(item.field)}</span>
                    <span
                      className="source-badge"
                      style={{ color: srcCfg.color, borderColor: srcCfg.color }}
                    >
                      {srcCfg.label}
                    </span>
                  </div>
                  <div className="changelog__item--values">
                    <span className="old">{renderValue(item.oldValue)}</span>
                    <Icon name="ArrowRight" />
                    <span className="new">{renderValue(item.newValue)}</span>
                  </div>
                  <div className="changelog__item--meta">
                    <span className="by">{item.updatedBy}</span>
                    <span className="time">{formatDateTime(item.updatedAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isLoading && <Loading />}

      {!isLoading && lst.length === 0 && (
        <div className="changelog__empty">
          <h2>Chưa có lịch sử chỉnh sửa nào</h2>
          <p>Khi hồ sơ khách hàng được chỉnh sửa, các thay đổi sẽ hiển thị tại đây.</p>
        </div>
      )}
    </div>
  );
}
