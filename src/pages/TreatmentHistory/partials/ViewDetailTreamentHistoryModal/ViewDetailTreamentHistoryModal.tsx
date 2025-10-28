import React, { Fragment, useMemo } from "react";
import moment from "moment";
import { IActionModal } from "model/OtherModel";
import { IViewDetailTreamentHistoryModalProps } from "model/treatmentHistory/PropsModel";
import Icon from "components/icon";
import Input from "components/input/input";
import TextArea from "components/textarea/textarea";
import CustomScrollbar from "components/customScrollbar";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import "./ViewDetailTreamentHistoryModal.scss";

export default function ViewDetailTreamentHistoryModal(props: IViewDetailTreamentHistoryModalProps) {
  const { onShow, onHide, data } = props;

  const listField = [
    {
      type: "input",
      name: "FieldCustomerId",
      required: true,
      label: "Khách hàng",
      value: data?.customerName,
    },
    {
      type: "input",
      name: "FieldCustomerPhone",
      required: true,
      label: "Số điện thoại khách hàng",
      value: data?.customerPhone,
    },
    {
      type: "input",
      name: "FieldServiceId",
      required: true,
      label: "Dịch vụ",
      value: data?.serviceName,
    },
    {
      type: "input",
      name: "FieldTreatmentTh",
      required: true,
      label: "Buổi điều trị",
      value: data?.treatmentTh?.toString(),
    },
    {
      type: "input",
      name: "FieldTreatmentStart",
      required: true,
      label: "Bắt đầu",
      value: moment(data?.treatmentStart).format("DD/MM/YYYY HH:mm"),
      icon: <Icon name="Calendar" />,
      iconPosition: "left",
    },
    {
      type: "input",
      name: "FieldTreatmentEnd",
      required: true,
      label: "Kết thúc",
      value: moment(data?.treatmentEnd).format("DD/MM/YYYY HH:mm"),
      icon: <Icon name="Calendar" />,
      iconPosition: "left",
    },
    {
      type: "textArea",
      name: "FieldProcDesc",
      label: "Nội dung thực hiện",
      value: data?.procDesc,
    },
    {
      type: "custom",
      name: "FieldUploadImage",
      value: "showImg",
    },
    {
      type: "input",
      name: "FieldEmployeeId",
      required: true,
      label: "Nhân viên",
      value: data?.employeeName,
    },
    {
      type: "input",
      name: "FieldNote",
      label: "Lưu ý thêm",
      value: data?.note,
    },
    {
      type: "input",
      name: "FieldScheduleNext",
      label: "Thời gian thực hiện tiếp theo",
      value: data?.scheduleNext ? moment(data?.scheduleNext).format("DD/MM/YYYY HH:mm") : "",
      icon: <Icon name="Calendar" />,
      iconPosition: "left",
    },
  ];

  const calculatorHeight = listField.filter((item) => item.value).length;

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => {
              onHide();
            },
          },
        ],
      },
    }),
    []
  );

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide()} className="modal-view-treament-history">
        <div className="wrapper-treament-history-group">
          <ModalHeader title="Xem chi tiết lịch điều trị" toggle={() => onHide()} />
          <ModalBody>
            <CustomScrollbar width="100%" height={`${calculatorHeight * 5}rem`}>
              <div className="list-form-group">
                {listField.map((item, idx) => {
                  return (
                    item.value && (
                      <div key={idx} id={item.name} className="form-group">
                        {item.type == "input" ? (
                          <Input
                            label={item.label}
                            value={item.value || ""}
                            icon={item.icon}
                            fill={true}
                            disabled={true}
                            required={item.required ? item.required : false}
                            iconPosition={item.iconPosition ? "left" : null}
                          />
                        ) : item.type == "custom" ? (
                          <Fragment>
                            <div className="info-avatar">
                              <span className="title-avatar">Ảnh trước thực hiện</span>
                              <div className="avatar-item">{data?.prevProof ? <img src={data?.prevProof} alt="" /> : <Icon name="NoImage" />}</div>
                            </div>
                            <div className="info-avatar">
                              <span className="title-avatar">Ảnh sau thực hiện</span>
                              <div className="avatar-item">{data?.afterProof ? <img src={data?.afterProof} alt="" /> : <Icon name="NoImage" />}</div>
                            </div>
                          </Fragment>
                        ) : (
                          <TextArea
                            label={item.label}
                            value={item.value}
                            fill={true}
                            disabled={true}
                            required={item.required ? item.required : false}
                          />
                        )}
                      </div>
                    )
                  );
                })}
              </div>
            </CustomScrollbar>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
    </Fragment>
  );
}
