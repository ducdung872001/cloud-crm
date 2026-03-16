/* eslint-disable @typescript-eslint/no-empty-function */
import React, { Fragment, useMemo, useState } from "react";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import BoxTable from "components/boxTable/boxTable";
import Icon from "components/icon";
import Checkbox from "components/checkbox/checkbox";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction } from "model/OtherModel";
import "./ShiftConfig.scss";
import ShiftConfigModal from "./partials/ModalShiftConfig";
import ShiftRulesNotifyTab from "./partials/ShiftRulesNotify/ShiftRulesNotifyTab";

type TabKey = "shift_config" | "staff_assign" | "rules_notify";

type ShiftConfigModel = {
  id: number;
  shiftName: string;
  startTime: any;
  endTime: any;
  posDevice: string;
  defaultCash: number;
  minStaff: number;
};

export default function ShiftConfigTabs() {
  document.title = "Thiết lập Ca Vận hành";

  const [tab, setTab] = useState<TabKey>("shift_config");
  const [shiftConfigs, setShiftConfigs] = useState<ShiftConfigModel[]>([
    {
      id: 1,
      shiftName: "Ca 1: Sáng",
      startTime: "08:00 02/03/2026",
      endTime: "15:00 02/03/2026",
      posDevice: "pos1",
      defaultCash: 1000000,
      minStaff: 1,
    },
    {
      id: 2,
      shiftName: "Ca 2: Chiều",
      startTime: "15:00 02/03/2026",
      endTime: "22:00 02/03/2026",
      posDevice: "pos1",
      defaultCash: 1000000,
      minStaff: 1,
    },
  ]);

  const [listIdCheckedShift, setListIdCheckedShift] = useState<number[]>([]);
  const [showModalShift, setShowModalShift] = useState<boolean>(false);
  const [selectedShift, setSelectedShift] = useState<ShiftConfigModel | null>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const showDialogConfirmDeleteShift = (item?: ShiftConfigModel) => {
    const dialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa cấu hình ca</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa{" "}
          {item ? (
            <Fragment>
              ca <strong>{item.shiftName}</strong>
            </Fragment>
          ) : (
            <strong>{listIdCheckedShift.length} ca đã chọn</strong>
          )}
          ? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => {
        if (item?.id) {
          setShiftConfigs((prev) => prev.filter((s) => s.id !== item.id));
          setListIdCheckedShift((prev) => prev.filter((id) => id !== item.id));
        } else if (listIdCheckedShift.length > 0) {
          setShiftConfigs((prev) => prev.filter((s) => !listIdCheckedShift.includes(s.id)));
          setListIdCheckedShift([]);
        }
        setShowDialog(false);
        setContentDialog(null);
      },
    };

    setContentDialog(dialog);
    setShowDialog(true);
  };

  const bulkActionShiftItems: BulkActionItemModel[] = useMemo(
    () => [
      {
        title: "Xóa cấu hình ca",
        callback: () => showDialogConfirmDeleteShift(),
      },
    ],
    [listIdCheckedShift]
  );

  const [pageShift, setPageShift] = useState(1);
  const [sizeLimitShift, setSizeLimitShift] = useState(5);

  const totalItemShift = shiftConfigs.length;
  const totalPageShift = Math.ceil(totalItemShift / sizeLimitShift);
  const startShift = (pageShift - 1) * sizeLimitShift;
  const endShift = startShift + sizeLimitShift;
  const shiftPage = shiftConfigs.slice(startShift, endShift);

  const dataPaginationShift = {
    name: "ca làm việc",
    page: pageShift,
    setPage: setPageShift,
    sizeLimit: sizeLimitShift,
    totalItem: totalItemShift,
    totalPage: totalPageShift,
    displayNumber: 5,
    isChooseSizeLimit: true,
    chooseSizeLimit: (limit: number) => {
      setSizeLimitShift(limit);
      setPageShift(1);
    },
  };

  const shiftTitles = ["Tên ca", "Giờ bắt đầu", "Giờ kết thúc", "Thiết bị POS", "Tiền lẻ mặc định", "NV tối thiểu"];

  const shiftDataMappingArray = (item: ShiftConfigModel) => [
    item.shiftName,
    item.startTime,
    item.endTime,
    item.posDevice,
    `${Number(item.defaultCash || 0).toLocaleString()} VNĐ`,
    item.minStaff,
  ];

  const shiftRowActions = (item: ShiftConfigModel): IAction[] => {
    const isCheckedItem = listIdCheckedShift?.length > 0;
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""} />,
        disabled: isCheckedItem,
        // callback: () => {
        //   if (!isCheckedItem) {
        //     setSelectedShift(item);
        //     setShowModalShift(true);
        //   }
        // },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className={isCheckedItem ? "icon-disabled" : "icon-error"} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) showDialogConfirmDeleteShift(item);
        },
      },
    ];
  };

  const handleSubmitShiftConfig = async (body: any) => {
    if (body?.id) {
      setShiftConfigs((prev) => prev.map((s) => (s.id === body.id ? { ...s, ...body } : s)));
      return true;
    }
    const newId = Math.max(0, ...shiftConfigs.map((s) => s.id)) + 1;
    setShiftConfigs((prev) => [{ ...body, id: newId }, ...prev]);
    return true;
  };

  const [staffAssignment, setStaffAssignment] = useState([
    { id: 1, name: "Nguyễn Hân", role: "Thu ngân", ca1: true, ca2: false },
    { id: 2, name: "Nguyễn Dinh", role: "Thu ngân", ca1: true, ca2: true },
    { id: 3, name: "Nguyễn Thông", role: "Thu ngân", ca1: false, ca2: true },
    { id: 4, name: "Nguyễn Phom", role: "Thu ngân", ca1: false, ca2: false },
    { id: 5, name: "Nguyễn Phương", role: "Thu ngân", ca1: false, ca2: false },
    { id: 6, name: "Nguyễn Hòa", role: "Thu ngân", ca1: false, ca2: false },
    { id: 7, name: "Nguyễn Long", role: "Thu ngân", ca1: false, ca2: false },
  ]);

  const [listIdCheckedStaff, setListIdCheckedStaff] = useState<number[]>([]);

  const bulkActionStaffItems: BulkActionItemModel[] = useMemo(
    () => [
      {
        title: "Gán Ca 1",
        callback: () => {
          const newData = staffAssignment.map((item) => (listIdCheckedStaff.includes(item.id) ? { ...item, ca1: true } : item));
          setStaffAssignment(newData);
          setListIdCheckedStaff([]);
        },
      },
      {
        title: "Gán Ca 2",
        callback: () => {
          const newData = staffAssignment.map((item) => (listIdCheckedStaff.includes(item.id) ? { ...item, ca2: true } : item));
          setStaffAssignment(newData);
          setListIdCheckedStaff([]);
        },
      },
      {
        title: "Bỏ phân ca",
        callback: () => {
          const newData = staffAssignment.map((item) => (listIdCheckedStaff.includes(item.id) ? { ...item, ca1: false, ca2: false } : item));
          setStaffAssignment(newData);
          setListIdCheckedStaff([]);
        },
      },
    ],
    [staffAssignment, listIdCheckedStaff]
  );

  const [pageStaff, setPageStaff] = useState(1);
  const [sizeLimitStaff, setSizeLimitStaff] = useState(5);

  const totalItemStaff = staffAssignment.length;
  const totalPageStaff = Math.ceil(totalItemStaff / sizeLimitStaff);
  const startStaff = (pageStaff - 1) * sizeLimitStaff;
  const endStaff = startStaff + sizeLimitStaff;
  const staffPage = staffAssignment.slice(startStaff, endStaff);

  const dataPaginationStaff = {
    name: "nhân viên",
    page: pageStaff,
    setPage: setPageStaff,
    sizeLimit: sizeLimitStaff,
    totalItem: totalItemStaff,
    totalPage: totalPageStaff,
    displayNumber: 5,
    isChooseSizeLimit: true,
    chooseSizeLimit: (limit: number) => {
      setSizeLimitStaff(limit);
      setPageStaff(1);
    },
  };

  const staffTitles = ["Nhân viên", "Vai trò", "Ca 1 (08-15)", "Ca 2 (15-22)"];

  const handleToggle = (id: number, field: "ca1" | "ca2") => {
    setStaffAssignment((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: !item[field] } : item)));
  };

  const staffDataMappingArray = (item: any) => [
    <div className="staff-info-cell" key={`staff-${item.id}`}>
      <div className="text-wrapper">
        <span className="name">{item.name}</span>
      </div>
    </div>,
    <div key={`role-${item.id}`}>
      <span className="role text-center">{item.role}</span>
    </div>,
    <Checkbox key={`c1-${item.id}`} checked={item.ca1} onChange={() => handleToggle(item.id, "ca1")} />,
    <Checkbox key={`c2-${item.id}`} checked={item.ca2} onChange={() => handleToggle(item.id, "ca2")} />,
  ];

  const titleActions: ITitleActions = useMemo(() => {
    if (tab === "shift_config") {
      return {
        actions: [
          {
            title: "Thêm mới",
            callback: () => {
              setSelectedShift(null);
              setShowModalShift(true);
            },
          },
        ],
      };
    }

    return {
      actions: [
        {
          title: "Thêm mới",
          callback: () => {
            // TODO
            console.log("Thêm mới phân công nhân viên");
          },
        },
      ],
    };
  }, [tab]);

  const getPosLabel = (posDevice: string) => {
    if (posDevice === "pos1") return "POS Main Counter";
    if (posDevice === "pos2") return "POS Quầy 2";
    return posDevice || "";
  };

  return (
    <div className="page-content page-shift-config">
      <TitleAction title="Thiết lập Ca Vận hành" titleActions={titleActions} />

      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              <li className={tab === "shift_config" ? "active" : ""} onClick={() => setTab("shift_config")}>
                Cấu hình ca
              </li>
              <li className={tab === "staff_assign" ? "active" : ""} onClick={() => setTab("staff_assign")}>
                Phân công nhân viên
              </li>
              <li className={tab === "rules_notify" ? "active" : ""} onClick={() => setTab("rules_notify")}>
                Quy tắc & Thông báo
              </li>
            </ul>
          </div>
        </div>

        <div className="p-24">
          {/* {tab === "shift_config" ? (
            <BoxTable
              name="ca"
              titles={shiftTitles}
              items={shiftPage}
              dataMappingArray={(item) => shiftDataMappingArray(item)}
              isBulkAction={true}
              bulkActionItems={bulkActionShiftItems}
              listIdChecked={listIdCheckedShift}
              setListIdChecked={setListIdCheckedShift}
              actions={(item) => shiftRowActions(item)}
              actionType="inline"
              isPagination={true}
              dataPagination={dataPaginationShift}
              striped={true}
            />
          ) : ( */}
          {tab === "shift_config" ? (
            <div className="shift-card-grid">
              {shiftConfigs.map((item) => (
                <div
                  key={item.id}
                  className={`shift-card accent-${item.id % 6}`}
                  onClick={() => {
                    setSelectedShift(item);
                    setShowModalShift(true);
                  }}
                >
                  <div className="shift-card__header">
                    <div className="title">
                      <span className="dot" />
                      <span>{item.shiftName}</span>
                    </div>

                    <button
                      type="button"
                      className="btn-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        showDialogConfirmDeleteShift(item);
                      }}
                    >
                      Xóa
                    </button>
                  </div>

                  <div className="shift-card__row">
                    <div className="label">Bắt đầu</div>
                    <div className="value">{item.startTime}</div>
                    <div className="arrow">→</div>
                    <div className="label">Kết thúc</div>
                    <div className="value">{item.endTime}</div>
                  </div>

                  <div className="shift-card__block">
                    <div className="block-label">Thiết bị POS</div>
                    <div className="block-value">{getPosLabel(item.posDevice)}</div>
                  </div>

                  <div className="shift-card__grid2">
                    <div className="shift-card__block">
                      <div className="block-label">Tiền lẻ đầu ca</div>
                      <div className="block-value">{Number(item.defaultCash || 0).toLocaleString()} đ</div>
                      <div className="block-sub">Mặc định khi mở ca</div>
                    </div>

                    <div className="shift-card__block">
                      <div className="block-label">NV tối thiểu</div>
                      <div className="block-value">{item.minStaff}</div>
                      <div className="block-sub">Cảnh báo nếu thiếu</div>
                    </div>
                  </div>
                </div>
              ))}

              <div
                className="shift-card shift-card--add"
                onClick={() => {
                  setSelectedShift(null);
                  setShowModalShift(true);
                }}
              >
                <div className="add-inner">
                  <div className="plus">+</div>
                  <div className="add-text">Thêm ca mới</div>
                </div>
              </div>
            </div>
          ) : tab === "staff_assign" ? (
            <BoxTable
              name="nhân viên"
              titles={staffTitles}
              items={staffPage}
              dataMappingArray={(item) => staffDataMappingArray(item)}
              isBulkAction={true}
              bulkActionItems={bulkActionStaffItems}
              listIdChecked={listIdCheckedStaff}
              setListIdChecked={setListIdCheckedStaff}
              isPagination={true}
              dataPagination={dataPaginationStaff}
              striped={true}
            />
          ) : (
            <ShiftRulesNotifyTab />
          )}
          {/* )} */}
        </div>
      </div>

      <ShiftConfigModal
        onShow={showModalShift}
        data={selectedShift}
        onSubmit={handleSubmitShiftConfig}
        onHide={() => {
          setShowModalShift(false);
          setSelectedShift(null);
        }}
      />

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
