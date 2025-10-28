import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Icon from "components/icon";
import Loading from "components/loading";
import Input from "components/input/input";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import QuoteService from "services/QuoteService";
import FSQuoteService from "services/FSQuoteService";
import SheetQuoteFormService from "services/SheetQuoteFormService";
import SheetFieldQuoteFormService from "services/SheetFieldQuoteFormService";
import { showToast } from "utils/common";
import Dialog, { IContentDialog } from "components/dialog/dialog";

import "./index.scss";

interface IAddTemplateFSQuoteProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  callBack: (data: any) => void;
  data: any;
  type: "fs" | "quote";
}

export default function AddTemplateFSQuote(props: IAddTemplateFSQuoteProps) {
  const { onShow, onHide, data, type, callBack } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [lstTemplate, setLstTemplate] = useState([]);
  const [dataTemplate, setDataTemplate] = useState(null);
  const [hasViewDetail, setHasViewDetail] = useState<boolean>(false);
  const [dataViewDetail, setDataViewDetail] = useState(null);

  const handleLstTemplate = async () => {
    const params = {
      limit: 20,
    };

    const response = await SheetQuoteFormService.lst(params);

    if (response.code === 0) {
      const result = response.result;
      setLstTemplate(result.items);
    } else {
      showToast(response.message || "Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }
  };

  useEffect(() => {
    if (onShow) {
      handleLstTemplate();
    }
  }, [onShow]);

  const handleViewTemplate = async (idSheet: number) => {
    if (!idSheet) return;

    const params = {
      sheetId: idSheet,
    };

    const response = await SheetFieldQuoteFormService.lst(params);

    if (response.code === 0) {
      const result = [...response.result.items];

      const changeResult = result.map((item) => {
        const newItem: any = {
          [item.code]: "",
          type: item.type,
          placeholder: item.name.toLowerCase(),
          formula: item.formula,
        };

        if (item.type === "select") {
          newItem.options = item.options;
        }

        return newItem;
      });

      const resultTitle = result.map((item) => item.name);

      setDataViewDetail({ lstData: changeResult, lstTitle: resultTitle });
    }
  };

  const handleClearForm = (acc) => {
    onHide(acc);
    setDataTemplate(null);
  };

  const handleChooseTemplate = async () => {
    setIsSubmit(true);

    const body = {
      id: data.id,
      name: data.name,
      fsId: data.fsId,
      quoteDate: data?.quoteDate,
      expiredDate: data?.expiredDate,
      sheetId: dataTemplate.id,
    };

    let response = null;

    if (type === "fs") {
      response = await FSQuoteService.update(body);
    } else {
      response = await QuoteService.update(body);
    }

    if (response.code === 0) {
      const result = response.result;
      callBack(result);
      handleClearForm(true);
      showToast(`Chọn mẫu ${type === "fs" ? "fs" : "báo giá"} thành công`, "success");
    } else {
      showToast(response.message || "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }

    setIsSubmit(false);
  };

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác chọn mẫu`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        handleClearForm(false);
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
            title: hasViewDetail ? "Quay lại" : "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              hasViewDetail ? setHasViewDetail(false) : !dataTemplate ? handleClearForm(false) : showDialogConfirmCancel();
            },
          },
          {
            title: "Xác nhận",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !dataTemplate,
            is_loading: isSubmit,
            callback: () => {
              handleChooseTemplate();
            },
          },
        ],
      },
    }),
    [dataTemplate, isSubmit, hasViewDetail]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        size="lg"
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-add-template"
      >
        <div className="form-add-template">
          <ModalHeader title={`Chọn mẫu ${type === "fs" ? "FS" : "báo giá"}`} toggle={() => !isSubmit && handleClearForm(false)} />
          <ModalBody>
            {hasViewDetail ? (
              <div className="view__detail--template">
                {dataViewDetail ? (
                  <div className="box__view">
                    <h2 className="title-form">{data?.name}</h2>

                    <table className="table__template">
                      <thead>
                        <tr>
                          {dataViewDetail.lstTitle.map((title, idx) => {
                            return <th key={idx}>{title}</th>;
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {dataViewDetail.lstData.map((item, idx) => {
                            return (
                              <td key={idx}>
                                {item.type === "text" ? (
                                  <Input
                                    name={Object.keys(item)[0]}
                                    fill={true}
                                    value={Object.values(item)[0] as string}
                                    placeholder={`Nhập ${item.placeholder}`}
                                    disabled={true}
                                  />
                                ) : item.type === "number" ? (
                                  <NummericInput
                                    name={Object.keys(item)[0]}
                                    fill={true}
                                    value={Object.values(item)[0] as number}
                                    thousandSeparator={true}
                                    placeholder={`Nhập ${item.placeholder}`}
                                    disabled={true}
                                  />
                                ) : (
                                  <SelectCustom
                                    name={Object.keys(item)[0]}
                                    fill={true}
                                    options={item.lstOption || []}
                                    value={Object.values(item)[0]}
                                    placeholder={`Chọn ${item.placeholder}`}
                                    disabled={true}
                                  />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Loading />
                )}
              </div>
            ) : (
              <div className="wrapper__template">
                {lstTemplate && lstTemplate.length > 0 ? (
                  <div className="lst-template">
                    {lstTemplate.map((item, idx) => {
                      const condition = dataTemplate && item.id === dataTemplate.id;
                      return (
                        <div key={idx} className={`item-template ${condition ? "item-template-active" : ""}`} onClick={() => setDataTemplate(item)}>
                          <div className="header-item">
                            <div
                              className="view-item"
                              onClick={() => {
                                setHasViewDetail(true);
                                handleViewTemplate(item.id);
                              }}
                            >
                              Xem trước <Icon name="Eye" />
                            </div>

                            {condition && (
                              <div className="check-item">
                                <Icon name="Checked" />
                              </div>
                            )}
                          </div>

                          <div className="body-item">
                            <span className="name-item">{item.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Loading />
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
