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
import HistoryModal from "pages/CallCenter/partials/HistoryModal/HistoryModal";
import CustomerService from "services/CustomerService";

export default function ModalCallCustomer(props: any) {
  const { onShow, customerId, onHide } = props;

  const [dataEmployee, setDataEmployee] = useState(null);
  const [isCheckCall, setIsCheckCall] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [dataCustomer, setDataCustomer] = useState(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);

  const getDetailCustomer = async (customerId) => {
    setIsLoadingCustomer(true);

    const response = await CustomerService.detail(customerId);

    if (response.code === 0) {
      const result = response.result;
      setDataCustomer(result);
    }

    setIsLoadingCustomer(false);
  };
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

  const dataInfoBasicCustomer = [
    {
      title: "Khách hàng",
      name: dataCustomer?.name,
      className: "outstanding-name",
    },
    {
      title: "Giới tính",
      name: dataCustomer?.gender == 1 ? "Nữ" : "Nam",
    },
    {
      title: "Điện thoại",
      name: dataCustomer?.phoneMasked,
    },
    {
      title: "Địa chỉ",
      name: dataCustomer?.address,
    },
    {
      title: "Người phụ trách",
      name: dataCustomer?.employeeName,
    },
    {
      title: "Chuyển cuộc gọi",
      type: true,
    },
  ];

  const getPhoneCallCustomer = async (id: number) => {
    const response = await CallCenterService.makeCall(id);

    if (response.code !== 0) {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (onShow && customerId) {
      getPhoneCallCustomer(customerId);
      getDetailCustomer(customerId);
    }
  }, [onShow, customerId]);

  const handDisconnect = async (id: number) => {
    onHide();
    const response = await CallCenterService.hangupCall(id);

    if (response.code == 0) {
      showToast("Ngắt kết nối thành công", "success");
      // onHide();
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  // chuyển hướng cuộc gọi
  const handTransferCall = async (idCustomer, sipEmployee) => {
    if (!idCustomer && !sipEmployee) return;

    const body: ITransferCallModel = {
      customerId: idCustomer,
      sib2: sipEmployee,
    };

    const response = await CallCenterService.transferCall(body);

    if (response.code === 0) {
      showToast("Chuyển cuộc gọi thành công", "success");
      onHide();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: isCheckCall
          ? [
              {
                title: "Chuyển cuộc gọi",
                type: "button",
                color: "primary",
                callback: () => {
                  dataCustomer?.id && dataEmployee?.sip && handTransferCall(dataCustomer?.id, dataEmployee?.sip);
                },
              },
              {
                title: "Nghe máy",
                type: "button",
                color: "success",
                callback: () => {
                  // bh có dữ liệu thì xử lý logic
                },
              },
              {
                title: "Từ chối",
                type: "button",
                color: "destroy",
                callback: () => {
                  dataCustomer?.id && handDisconnect(dataCustomer?.id);
                },
              },
            ]
          : [
              {
                title: "Lịch sử giao dịch",
                type: "button",
                color: "primary",
                callback: () => {
                  setShowHistoryModal(true);
                },
              },
              {
                title: "Chuyển cuộc gọi",
                type: "button",
                color: "primary",
                callback: () => {
                  dataCustomer?.id && dataEmployee?.sip && handTransferCall(dataCustomer?.id, dataEmployee?.sip);
                },
              },
              {
                title: "Ngắt kết nối",
                type: "button",
                color: "destroy",
                callback: () => {
                  dataCustomer?.id && handDisconnect(dataCustomer?.id);
                },
              },
            ],
      },
    }),
    [dataCustomer, isCheckCall, dataEmployee]
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
    if (dataCustomer && onShow) {
      dragElement(document.getElementById("mydiv"));
    }
  }, [dataCustomer, onShow]);

  return (
    dataCustomer &&
    onShow && (
      <div id="mydiv" className={`${onShow ? "custom__modal--phone" : "hide__modal--phone"}`} style={!onShow ? { top: "0px", left: "0px" } : {}}>
        <div className="form__info--customer">
          <ModalHeader custom={true} id="mydivheader">
            <div className="info__header">
              <div className="info__header--left">
                <div className="avatar">
                  <img src={dataCustomer?.avatar ? dataCustomer.avatar : dataCustomer?.gender == 1 ? Female : Male} alt={dataCustomer?.name} />
                </div>
                <div className="info__customer">
                  <h4 className="name">{dataCustomer?.name}</h4>
                  <h4 className="phone">{dataCustomer?.phoneMasked}</h4>
                </div>
              </div>

              <div className="info__header--right">
                <Icon name="CallPhone" />
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="info__basic--customer">
              {dataInfoBasicCustomer.map((item, idx) => {
                return (
                  <div key={idx} className="box-item">
                    <div className="item-title">
                      <h4>{item.title}</h4>
                    </div>
                    <div className="vertical-tiles" />
                    {item.name && (
                      <div className="item-name">
                        <h4 className={item.className}>{item.name}</h4>
                      </div>
                    )}
                    {item.type && (
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
                          placeholder="Chọn nhân viên"
                          additional={{
                            page: 1,
                          }}
                          loadOptionsPaginate={loadedOptionEmployee}
                          formatOptionLabel={formatOptionLabelEmployee}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
          <HistoryModal
            onShow={showHistoryModal}
            dataCustomer={dataCustomer}
            onHide={(reload) => {
              if (reload) {
                // setReload(reload)
              }
              setShowHistoryModal(false)
            }}
          />
        </div>
      </div>
    )
  );
}
