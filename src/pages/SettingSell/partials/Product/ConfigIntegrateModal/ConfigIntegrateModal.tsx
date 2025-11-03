import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Icon from "components/icon";
import Loading from "components/loading";
import QuoteService from "services/QuoteService";
import FSQuoteService from "services/FSQuoteService";
import SheetQuoteFormService from "services/SheetQuoteFormService";
import { showToast } from "utils/common";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import LogoApphub from "assets/images/logo_apphub.png";

import "./ConfigIntegrateModal.scss";
import Input from "components/input/input";
import IntegrationPartnerService from "services/IntegrationPartnerService";
import Tippy from "@tippyjs/react";

export default function ConfigIntegrateModal(props: any) {
  const { onShow, onHide, type } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (type) {
      setParams({ ...params, type: type })
    }
  }, [type])

  const [params, setParams] = useState({
    type: '',
    limit: 10,
    page: 1
  })

  const [dataApphub, setDataApphub] = useState({
    clientId: '',
    clientKey: '',
    checkClientIdApphub: false,
    checkClientKeyApphub: false
  })


  const [lstApp, setLstApp] = useState([]);
  console.log('lstApp', lstApp);

  const [dataApp, setDataApp] = useState(null);

  const handleLstApp = async (params) => {

    const response = await IntegrationPartnerService.list(params);

    if (response.code === 0) {
      const result = response.result;
      setLstApp(result.items);
    } else {
      showToast(response.message || "Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }
  };

  useEffect(() => {
    if (onShow && params) {
      handleLstApp(params);
    }
  }, [onShow, params]);



  const handleChooseApp = async () => {
    setIsSubmit(true);

    setStep(2);

    // const body = {
    //   id: data.id,
    //   name: data.name,
    //   fsId: data.fsId,
    //   quoteDate: data?.quoteDate,
    //   expiredDate: data?.expiredDate,
    // };


    // const  response = await FSQuoteService.update(body);

    // if (response.code === 0) {
    //   const result = response.result;
    //   // handleClearForm(true);
    //   // showToast(`Chọn mẫu ${type === "fs" ? "fs" : "báo giá"} thành công`, "success");
    // } else {
    //   showToast(response.message || "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    // }

    setIsSubmit(false);
  };

  const connectApp = async (data) => {
    setIsSubmit(true);

    const config = {
      clientId: dataApphub.clientId,
      clientKey: dataApphub.clientKey
    }

    const body = {
      partnerId: data.id,
      config: JSON.stringify(config)
    }

    const response = await IntegrationPartnerService.update(body);

    if (response.code === 0) {
      showToast(`Tích hợp ứng dụng thành công`, "success");
      handleClearForm(true);
    } else {
      showToast(response.message || "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }

    setIsSubmit(false);
  }

  const onDeleteApp = async (id: number) => {
    const response = await IntegrationPartnerService.delete(id);

    if (response.code === 0) {
      showToast("Bỏ tích hợp thành công", "success");
      handleLstApp(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác tích hợp ứng dụng`}</Fragment>,
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

  const [showDeleteApp, setShowDeleteApp] = useState<boolean>(false);
  const [contentDeleteApp, setContentDeleteApp] = useState<IContentDialog>(null);

  const showConfirmDeleteApp = (data) => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Bỏ tích hợp ứng dụng`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn bỏ tích hợp ứng dụng {<span style={{ fontWeight: '600' }}>{data?.name}</span>}?</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDeleteApp(false);
        setContentDeleteApp(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        onDeleteApp(data?.icgId)
        setShowDeleteApp(false);
        setContentDeleteApp(null);
      },
    };
    setContentDeleteApp(contentDialog);
    setShowDeleteApp(true);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          ...(step === 2 ? [
            ({
              title: "Quay lại",
              color: "primary",
              variant: "outline",
              disabled: isSubmit,
              callback: () => {
                setStep(1);
                if (dataApp.id === 'apphub') {
                  setDataApphub({
                    clientId: '',
                    clientKey: '',
                    checkClientIdApphub: false,
                    checkClientKeyApphub: false
                  })
                }
              },
            } as any),
          ] : []),

          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !dataApp ? handleClearForm(false) : showDialogConfirmCancel();
            },
          },
          {
            title: step === 1 ? "Tích hợp" : "Xác nhận",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !dataApp,
            is_loading: isSubmit,
            callback: () => {
              if (step === 1) {
                handleChooseApp();
              } else {
                if (dataApp.code === 'APPHUB') {
                  connectApp(dataApp);
                }
              }
            },
          },
        ],
      },
    }),
    [dataApp, isSubmit, step, dataApphub]
  );

  const handleClearForm = (acc) => {
    onHide(acc);
    setLstApp([]);
    setDataApp(null);
    setStep(1);
    setDataApphub({
      clientId: '',
      clientKey: '',
      checkClientIdApphub: false,
      checkClientKeyApphub: false
    })
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        size="lg"
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-config-integrate"
      >
        <div className="form-add-config-integrate">
          <ModalHeader title={`Chọn ứng dụng`} toggle={() => !isSubmit && handleClearForm(false)} />
          <ModalBody>
            {step === 1 ?
              <div className="wrapper__template">
                {lstApp && lstApp.length > 0 ? (
                  <div className="lst-template">
                    {lstApp.map((item, idx) => {
                      const condition = item.config ? true : (dataApp && item.id === dataApp.id);
                      return (
                        <div
                          key={idx}
                          className={`item-template ${(condition && !item.config) ? "item-template-active" : ""}`}
                          onClick={() => {
                            if (!item.config) {
                              if (condition) {
                                setDataApp(null);
                              } else {
                                setDataApp(item);
                              }
                            }

                          }}
                        >
                          <div className="header-item">
                            <img
                              src={item.avatar}
                              alt=""
                            />

                            {condition && (
                              <div style={{ display: 'flex', gap: '0 0.5rem' }}>
                                <div className="check-item">
                                  <Icon name="Checked" />
                                </div>
                                {item.config ?
                                  <Tippy content='Bỏ tích hợp'>
                                    <div
                                      className="delete-item"
                                      onClick={() => {
                                        showConfirmDeleteApp(item);
                                      }}
                                    >
                                      <Icon name="UnConnect" />
                                    </div>
                                  </Tippy>
                                  : null}
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
              : null}

            {step === 2 ?
              (dataApp?.code === 'APPHUB' ?
                <div className="apphub">
                  <div className="item-apphub">
                    <Input
                      type="text"
                      label={'ID ứng dụng'}
                      value={dataApphub.clientId}
                      fill={true}
                      required={true}
                      placeholder="Nhập ID ứng dụng"
                      error={dataApphub.checkClientIdApphub}
                      message="ID ứng dụng không được để trống"
                      onChange={(e) => {
                        const value = e.target.value;
                        setDataApphub({ ...dataApphub, clientId: value });
                      }}
                    />
                  </div>

                  <div className="item-apphub">
                    <Input
                      type="text"
                      label={'Khoá bí mật của ứng dụng'}
                      value={dataApphub.clientKey}
                      fill={true}
                      required={true}
                      placeholder="Nhập khoá bí mật của ứng dụng"
                      error={dataApphub.checkClientKeyApphub}
                      message="Khoá bí mật của ứng dụng không được để trống"
                      onChange={(e) => {
                        const value = e.target.value;
                        setDataApphub({ ...dataApphub, clientKey: value });
                      }}
                    />
                  </div>
                </div>
                : null
              )
              : null}
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
      <Dialog content={contentDeleteApp} isOpen={showDeleteApp} />
    </Fragment>
  );
}
