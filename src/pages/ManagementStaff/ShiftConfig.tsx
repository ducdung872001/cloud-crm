/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import BoxTable from "components/boxTable/boxTable";
import Badge from "components/badge/badge";
import Button from "components/button/button";
import Icon from "components/icon";
import Checkbox from "components/checkbox/checkbox";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import "./ShiftConfig.scss";

export default function ShiftConfig() {
  document.title = "Thiết lập Ca Vận hành";

  const [staffAssignment, setStaffAssignment] = useState([
    { id: 1, name: "Nguyễn Hân", role: "Thu ngân", ca1: true, ca2: false },
    { id: 2, name: "Nguyễn Dinh", role: "Thu ngân", ca1: true, ca2: true },
    { id: 3, name: "Nguyễn Thông", role: "Thu ngân", ca1: false, ca2: true },
    { id: 4, name: "Nguyễn Phom", role: "Thu ngân", ca1: false, ca2: false },
  ]);

  const titles = ["Nhân viên", "Vai trò", "Ca 1 (08-15)", "Ca 2 (15-22)"];

  const handleToggle = (id: number, field: "ca1" | "ca2") => {
    const newStaffAssignment = staffAssignment.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: !item[field] };
      }
      return item;
    });
    setStaffAssignment(newStaffAssignment);
  };

  const dataMappingArray = (item: any) => [
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

  return (
    <div className="page-content page-shift-config">
      <TitleAction title="Thiết lập Ca Vận hành" />

      <div className="dashboard-body page-content page-overview">
        <div className="shift-time-grid">
          <div className="card-box p-24">
            <div className="d-flex justify-content-between mb-16">
              <h4 className="fw-700">Ca 1: Sáng</h4>
            </div>
            <div className="time-picker-group">
              <DatePickerCustom label="Giờ bắt đầu" value="08:00 02/03/2026" hasSelectTime={true} icon={<Icon name="Clock" />} onChange={() => {}} />
              <Icon name="ArrowRight" className="separator" />
              <DatePickerCustom label="Giờ kết thúc" value="15:00 02/03/2026" hasSelectTime={true} icon={<Icon name="Clock" />} onChange={() => {}} />
            </div>
            <div className="device-select mt-16">
              <label className="fw-700 mb-8 d-block">Thiết bị POS</label>
              <select className="base-select">
                <option>POS Main Counter</option>
              </select>
            </div>
          </div>

          <div className="card-box p-24">
            <div className="d-flex justify-content-between mb-16">
              <h4 className="fw-700">Ca 2: Chiều</h4>
            </div>
            <div className="time-picker-group">
              <DatePickerCustom label="Giờ bắt đầu" value="15:00 02/03/2026" hasSelectTime={true} icon={<Icon name="Clock" />} onChange={() => {}} />
              <Icon name="ArrowRight" className="separator" />
              <DatePickerCustom label="Giờ kết thúc" value="22:00 02/03/2026" hasSelectTime={true} icon={<Icon name="Clock" />} onChange={() => {}} />
            </div>
            <div className="device-select mt-16">
              <label className="fw-700 mb-8 d-block">Thiết bị POS</label>
              <select className="base-select">
                <option>POS Quầy 2</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card-box mt-24">
          <div className="action-header">
            <div className="title__actions">
              <ul className="menu-list">
                <li className="active">Gán nhân viên vào Ca</li>
              </ul>
            </div>
          </div>
          <div className="p-24">
            <BoxTable titles={titles} items={staffAssignment} dataMappingArray={dataMappingArray} />
            <div className="d-flex justify-content-end mt-24">
              <Button color="primary" onClick={() => console.log("Lưu cấu hình", staffAssignment)}>
                <Icon name="Save" className="mr-8" /> Lưu cấu hình
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
