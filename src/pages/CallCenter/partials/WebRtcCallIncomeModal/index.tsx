import React, { useEffect, useMemo, useState } from "react";
import { IActionModal } from "model/OtherModel";
import { IAddPhoneModalProps } from "model/callCenter/PropsModel";
import { ITransferCallModel } from "model/callCenter/CallCenterRequestModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import Icon from "components/icon";
import SelectCustom from "components/selectCustom/selectCustom";
import { ModalHeader, ModalBody, ModalFooter } from "components/modal/modal";
import { showToast } from "utils/common";
import Female from "assets/images/avatar-female.jpg";
import Male from "assets/images/avatar-male.jpg";
import ImageThirdGender from "assets/images/third-gender.png";
import EmployeeService from "services/EmployeeService";
import CallCenterService from "services/CallCenterService";
import "./index.scss";
import HistoryModal from "../HistoryModal/HistoryModal";
import { useSTWebRTC } from "webrtc/useSTWebRTC";

// "config": {
//     "key": "d9cf985baac44238b3d930ae569d9f0912",
//     "extension": "470",
//     "pbx_customer_code": "C1216"
// }

// "config": {
//     "key": "d9cf985baac44238b3d930ae569d9f0912",
//     "extension": "471",
//     "pbx_customer_code": "C1216"
// }

const pbxCustomerCode = "d9cf985baac44238b3d930ae569d9f0912";

const employeeSip470 = "470";

const employeeSip471 = "471";

export default function WebRtcCallIncomeModal(props: any) {
  const { onShow, onHide, makeCall, hangup, answer, transfer, incomingNumber, callState } = props;

  const [dataEmployee, setDataEmployee] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  //! đoạn này xử lý vấn đề lấy ra danh sách nhân viên
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      hasShip: 1,
      page: page,
      limit: 10,
    };

    const response = await EmployeeService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  avatar: item.avatar,
                  sip: item.sip,
                };
              })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  //! đoạn này xử lý vấn đề hiển thị hình ảnh nhân viên
  const formatOptionLabelEmployee = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  //! đoạn này xử lý vấn đề thay đổi nhân viên
  const handleChangeValueEmployee = (e) => {
    setDataEmployee(e);
  };

  // const getPhoneCallCustomer = async (id: number) => {
  //   const response = await CallCenterService.makeCall(id);

  //   if (response.code !== 0) {
  //     showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
  //   }
  // };

  useEffect(() => {
    if (onShow) {
      // getPhoneCallCustomer(dataCustomer?.id);
      //   console.log("makeCal>>", dataCustomer);
      //   makeCall("0862999272");
    }
  }, [onShow]);

  const handDisconnect = async () => {
    onHide();
    hangup();
  };

  // chuyển hướng cuộc gọi
  const handTransferCall = async (extId) => {
    transfer(extId);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Từ chối",
            type: "button",
            color: "destroy",
            callback: () => {
              handDisconnect();
            },
          },
          {
            title: "Chuyển cuộc gọi",
            type: "button",
            color: "primary",
            callback: () => {
              handTransferCall(employeeSip471);
            },
          },
          {
            title: "Nghe máy",
            type: "button",
            color: "success",
            callback: () => {
              answer();
              // bh có dữ liệu thì xử lý logic
            },
          },
        ],
      },
    }),
    [dataEmployee]
  );

  //! đoạn này xử lý kéo thả Element sau này nhiều chỗ dùng có thể tách thành 1 component
  function dragElement(elmnt) {
    if (!elmnt) return;
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;

    if (document.getElementById(elmnt.id + "header")) {
      /* if present, the header is where you move the DIV from */
      document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
      /* otherwise, move the DIV from anywhere inside the DIV */
      elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;

      // set the element's new position:
      elmnt.style.top = `${elmnt.offsetTop - pos2}px`;
      elmnt.style.left = `${elmnt.offsetLeft - pos1}px`;
    }

    function closeDragElement() {
      /* stop moving when mouse button is released */
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  useEffect(() => {
    if (onShow) {
      dragElement(document.getElementById("phonediv"));
    }
  }, [onShow]);

  return (
    onShow && (
      <div
        id="phonediv"
        className={`${onShow ? "custom__modal--phone_income" : "hide__modal--phone_income"}`}
        style={!onShow ? { top: "0px", left: "0px" } : {}}
      >
        <div className="form__info--phone_income">
          <ModalHeader custom={true} id="phonedivheader">
            <div className="info__header">
              <div className="info__header--left">Cuộc gọi đến</div>

              {/* <div className="info__header--right">
                <Icon name="CallPhone" />
              </div> */}
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="icon--phone_income">
              <span>{incomingNumber || "No incoming number"}</span>
              <div className="border">
                <Icon name="CallPhone" />
              </div>
              <div className="option__employee">
                <SelectCustom
                  id="employeeId"
                  name="employeeId"
                  options={[]}
                  fill={true}
                  value={dataEmployee}
                  onChange={(e) => handleChangeValueEmployee(e)}
                  isAsyncPaginate={true}
                  isFormatOptionLabel={true}
                  placeholder="Chọn nhân viên nhận cuộc gọi"
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionEmployee}
                  formatOptionLabel={formatOptionLabelEmployee}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </div>
    )
  );
}
