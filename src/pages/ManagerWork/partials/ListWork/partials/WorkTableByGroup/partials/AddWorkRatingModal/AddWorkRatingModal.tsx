import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import { IAddWorkRatingModalProps } from "model/workOrder/PropsModel";
import { IUpdateRatingRequestModal } from "model/workOrder/WorkOrderRequestModel";
import Icon from "components/icon";
import TextArea from "components/textarea/textarea";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import WorkOrderService from "services/WorkOrderService";
import "./AddWorkRatingModal.scss";

export default function AddWorkRatingModal(props: IAddWorkRatingModalProps) {
  const { onShow, onHide, idWork, numberRating, disabledRating, data } = props;

  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [validateContent, setValidateContent] = useState<boolean>(false);

  const [formData, setFormData] = useState<IUpdateRatingRequestModal>({
    worId: 0,
    mark: rating,
    content: "",
  });

  useEffect(() => {
    if (numberRating && onShow) {
      setRating(numberRating);
      setHover(numberRating);
    }
  }, [numberRating, onShow]);

  useEffect(() => {
    if (idWork && onShow) {
      setFormData({ ...formData, worId: idWork });
    }
  }, [idWork, onShow]);

  useEffect(() => {
    if (rating) {
      setFormData({ ...formData, mark: rating });
    }
  }, [rating]);

  const handChangeContent = (e) => {
    const value = e.target.value;

    oninput = () => {
      setValidateContent(false);
    };

    setFormData({ ...formData, content: value });
  };

  const handBlurContent = (e) => {
    const value = e.target.value;

    if (value == "") {
      setValidateContent(true);
    }
  };

  const handSubmitForm = async () => {
    if (formData.content == "") {
      setValidateContent(true);
      return;
    }

    setIsSubmit(true);

    const body: IUpdateRatingRequestModal = {
      ...(formData as IUpdateRatingRequestModal),
    };

    const response = await WorkOrderService.updateRating(body);

    if (response.code === 0) {
      showToast("Đánh giá thành công", "success");
      setFormData({
        worId: 0,
        mark: rating,
        content: "",
      });
      onHide(true);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }

    setIsSubmit(false);
  };

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác cập nhật đánh giá`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        onHide(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              rating <= 0 ? onHide(false) : showDialogConfirmCancel();
            },
          },
          {
            title: "Cập nhật",
            type: "button",
            color: "primary",
            disabled: rating === 0 || validateContent,
            is_loading: isSubmit,
            callback: () => {
              handSubmitForm();
            },
          },
        ],
      },
    }),
    [rating, isSubmit, validateContent, formData]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-rating"
      >
        <div className="form-rating-group">
          <ModalHeader title={`${disabledRating ? "Lịch sử" : "Cập nhật"} đánh giá công việc`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="box__rating">
              {disabledRating ? (
                <div className="history__rating">
                  {data?.reviews &&
                    JSON.parse(data.reviews || "[]").map((item, idx) => {
                      return (
                        <div key={idx} className="item-history">
                          <div className="view-rating">
                            <div className="key">Đánh giá</div>
                            <div className="value">
                              {[...Array(item.mark)].map((el, index) => {
                                return (
                                  <span key={index} className="number-rating">
                                    <Icon name="Star" />
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          <div className="note">
                            <div className="key">Ghi chú</div>
                            <div className="value">{item.content}</div>
                          </div>
                          <div className="person-rating">
                            <div className="key">Người đánh giá</div>
                            <div className="value">{item.employeeId === data?.employeeId ? data?.employeeName : data?.managerName}</div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <Fragment>
                  <div className="list-form-group">
                    <div className="form-group box-rating">
                      <label className="title">Đánh giá</label>
                      <div className="star-rating">
                        {[...Array(5)].map((item, idx) => {
                          return (
                            <div
                              key={idx + 1}
                              className={idx + 1 <= ((rating && hover) || hover) ? "on" : "off"}
                              onClick={() => setRating(idx + 1)}
                              onMouseEnter={() => setHover(idx + 1)}
                              onMouseLeave={() => setHover(rating)}
                              onDoubleClick={() => {
                                setRating(0);
                                setHover(0);
                              }}
                            >
                              <span className="star">
                                <Icon name="Star" />
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="form-group">
                      <TextArea
                        id="content"
                        name="content"
                        label="Nội dung đánh giá"
                        required={true}
                        fill={true}
                        value={formData.content}
                        onChange={(e) => handChangeContent(e)}
                        onBlur={(e) => handBlurContent(e)}
                        placeholder="Nhập nội dung đánh giá"
                        error={validateContent}
                        message="Nội dung đánh giá không được để trống"
                      />
                    </div>
                  </div>

                  {data?.reviews && data?.reviews?.length > 0 && (
                    <div className="lst__rating">
                      <div className="title">Chi tiết đánh giá công việc</div>

                      <div className="history__rating">
                        {data?.reviews &&
                          JSON.parse(data.reviews || "[]").map((item, idx) => {
                            return (
                              <div key={idx} className="item-history">
                                <div className="view-rating">
                                  <div className="key">Đánh giá</div>
                                  <div className="value">
                                    {[...Array(item.mark)].map((el, index) => {
                                      return (
                                        <span key={index} className="number-rating">
                                          <Icon name="Star" />
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="note">
                                  <div className="key">Ghi chú</div>
                                  <div className="value">{item.content}</div>
                                </div>
                                <div className="person-rating">
                                  <div className="key">Người đánh giá</div>
                                  <div className="value">{item.employeeId === data?.employeeId ? data?.employeeName : data?.managerName}</div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </Fragment>
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
