/* eslint-disable @typescript-eslint/no-empty-function */
import React, { Fragment, useMemo, useState } from "react";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import BoxTable from "components/boxTable/boxTable";
import Icon from "components/icon";
import Checkbox from "components/checkbox/checkbox";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction } from "model/OtherModel";
import Button from "components/button/button";
import SelectCustom from "components/selectCustom/selectCustom";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IFieldCustomize } from "model/FormModel";
import "./ShiftConfig.scss";
import ShiftRulesNotifyTab from "./partials/ShiftRulesNotify/ShiftRulesNotifyTab";

type TabKey = "shift_config" | "staff_assign" | "rules_notify";

type ShiftConfigModel = {
  id: number;
  shiftName: string;
  startTime: string;
  endTime: string;
  posDevice: string;
  defaultCash: number;
  minStaff: number;
  color?: string;
};

type RulesSettings = {
  warningDiff: number;
  requireReason: boolean;
  allowDenomination: boolean;
  maxOpenHours: number;
  blockIfMissingStaff: boolean;
  managerConfirmClose: boolean;
  sendCloseReport: boolean;
  sendDiffWarning: boolean;
  remindOpenShift: boolean;
  shiftOverRule: boolean;
  receiver: string;
  channel: string;
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
      color: "#3b82f6",
    },
    {
      id: 2,
      shiftName: "Ca 2: Chiều",
      startTime: "15:00 02/03/2026",
      endTime: "22:00 02/03/2026",
      posDevice: "pos1",
      defaultCash: 1000000,
      minStaff: 1,
      color: "#8b5cf6",
    },
  ]);

  const [savedShiftConfigs, setSavedShiftConfigs] = useState<ShiftConfigModel[]>(shiftConfigs);

  const [listIdCheckedShift, setListIdCheckedShift] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const posOptions = useMemo(
    () => [
      { label: "POS Main Counter", value: "pos1" },
      { label: "POS Quầy 2", value: "pos2" },
    ],
    []
  );

  const shiftInlineFields: IFieldCustomize[] = useMemo(
    () => [
      { label: "Tiền lẻ đầu ca", name: "defaultCash", type: "number", placeholder: "0", fill: true },
      { label: "NV tối thiểu", name: "minStaff", type: "number", placeholder: "0", fill: true },
    ],
    []
  );

  const colorList = useMemo(() => ["#f59e0b", "#3b82f6", "#8b5cf6", "#22c55e", "#ef4444", "#06b6d4"], []);

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

  const updateShift = (id: number, patch: Partial<ShiftConfigModel>) => {
    setShiftConfigs((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const addNewShift = () => {
    const newId = Math.max(0, ...shiftConfigs.map((s) => s.id)) + 1;
    const nextColor = colorList[(newId - 1) % colorList.length];
    setShiftConfigs((prev) => [
      ...prev,
      {
        id: newId,
        shiftName: `Ca ${newId}`,
        startTime: "",
        endTime: "",
        posDevice: "pos1",
        defaultCash: 0,
        minStaff: 1,
        color: nextColor,
      },
    ]);
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

  const [savedStaffAssignment, setSavedStaffAssignment] = useState<any[]>(staffAssignment);

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

  const [rulesSettings, setRulesSettings] = useState<RulesSettings>({
    warningDiff: 50,
    requireReason: true,
    allowDenomination: true,
    maxOpenHours: 9,
    blockIfMissingStaff: false,
    managerConfirmClose: false,
    sendCloseReport: true,
    sendDiffWarning: true,
    remindOpenShift: false,
    shiftOverRule: true,
    receiver: "all_manager",
    channel: "zalo_email",
  });

  const [savedRulesSettings, setSavedRulesSettings] = useState<RulesSettings>(rulesSettings);

  const titleActions: ITitleActions = useMemo(() => {
    return {
      actions: [],
    };
  }, [tab]);

  const onCancelSettings = () => {
    if (tab === "shift_config") {
      setShiftConfigs(savedShiftConfigs);
      setListIdCheckedShift([]);
      return;
    }
    if (tab === "staff_assign") {
      setStaffAssignment(savedStaffAssignment);
      setListIdCheckedStaff([]);
      return;
    }
    setRulesSettings(savedRulesSettings);
  };

  const onSaveSettings = () => {
    if (tab === "shift_config") {
      setSavedShiftConfigs(shiftConfigs);
      console.log("Save shift configs", shiftConfigs);
      return;
    }
    if (tab === "staff_assign") {
      setSavedStaffAssignment(staffAssignment);
      console.log("Save staff assignment", staffAssignment);
      return;
    }
    setSavedRulesSettings(rulesSettings);
    console.log("Save rules settings", rulesSettings);
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
                Quy tắc &amp; Thông báo
              </li>
            </ul>
          </div>
        </div>

        <div className="p-24">
          {tab === "shift_config" ? (
            <div className="shift-card-grid shift-card-grid--editable">
              {shiftConfigs.map((item) => (
                <div key={item.id} className="shift-card-editable">
                  <div className="shift-card-editable__top" style={{ borderTopColor: item.color || "#3b82f6" }}>
                    <div className="left">
                      <span className="dot" style={{ background: item.color || "#3b82f6" }} />
                      <input
                        className="name-input"
                        value={item.shiftName}
                        onChange={(e) => updateShift(item.id, { shiftName: e.target.value })}
                        placeholder="Tên ca"
                      />
                    </div>

                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() => {
                        showDialogConfirmDeleteShift(item);
                      }}
                    >
                      Xóa
                    </button>
                  </div>

                  <div className="shift-card-editable__body">
                    <div className="block">
                      <div className="block-label">Màu</div>
                      <div className="color-row">
                        {colorList.map((c) => (
                          <button
                            type="button"
                            key={c}
                            className={`color-dot${(item.color || "") === c ? " active" : ""}`}
                            style={{ background: c }}
                            onClick={() => updateShift(item.id, { color: c })}
                            aria-label={`Chọn màu ${c}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="time-grid">
                      <div className="inline-field">
                        <label>Bắt đầu</label>
                        <div className="input-with-icon">
                          <input
                            value={item.startTime ?? ""}
                            placeholder="08:00 02/03/2026"
                            onChange={(e) => updateShift(item.id, { startTime: e.target.value })}
                          />
                          <span className="ic">
                            <Icon name="Clock" />
                          </span>
                        </div>
                      </div>

                      <div className="inline-field">
                        <label>Kết thúc</label>
                        <div className="input-with-icon">
                          <input
                            value={item.endTime ?? ""}
                            placeholder="15:00 02/03/2026"
                            onChange={(e) => updateShift(item.id, { endTime: e.target.value })}
                          />
                          <span className="ic">
                            <Icon name="Clock" />
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="block">
                      <SelectCustom
                        label="Thiết bị POS"
                        options={posOptions}
                        value={item.posDevice}
                        onChange={(e: any) => updateShift(item.id, { posDevice: e?.value })}
                        placeholder="Chọn thiết bị..."
                        fill
                        required
                      />
                    </div>

                    <div className="grid-2">
                      <div className="block">
                        <FieldCustomize
                          field={shiftInlineFields[0]}
                          formData={{ values: { defaultCash: item.defaultCash } } as any}
                          handleUpdate={(value) => updateShift(item.id, { defaultCash: Number(value?.defaultCash ?? value ?? 0) })}
                        />
                        <div className="hint">Mặc định khi mở ca</div>
                      </div>

                      <div className="block">
                        <FieldCustomize
                          field={shiftInlineFields[1]}
                          formData={{ values: { minStaff: item.minStaff } } as any}
                          handleUpdate={(value) => updateShift(item.id, { minStaff: Number(value?.minStaff ?? value ?? 0) })}
                        />
                        <div className="hint">Cảnh báo nếu thiếu</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="shift-card-add" onClick={addNewShift} role="button" tabIndex={0}>
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
            <ShiftRulesNotifyTab value={rulesSettings} onChange={setRulesSettings} />
          )}

          <div className="settings-footer">
            <div className="left-note">
              <span className="dot" />
              <span>Thay đổi áp dụng từ ca tiếp theo</span>
            </div>

            <div className="right-actions">
              <Button color="secondary" variant="outline" onClick={onCancelSettings}>
                Hủy
              </Button>
              <Button color="primary" onClick={onSaveSettings}>
                <Icon name="Check" className="mr-8" />
                Lưu cài đặt
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
