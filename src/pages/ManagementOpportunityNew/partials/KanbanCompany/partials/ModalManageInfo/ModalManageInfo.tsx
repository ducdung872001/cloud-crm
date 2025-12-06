import React, { Fragment, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import "./ModalManageInfo.scss";
import { convertToId } from "reborn-util";
import { handDownloadFileOrigin, showToast } from "utils/common";
import { removeVietnameseTones } from "configs/convertVietnamese";
import CampaignService from "services/CampaignService";
import { uploadDocumentFormData } from "utils/document";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";

export default function ModalManageInfo(props: any) {
  const { onShow, onHide, dataCampaign } = props;

  const [tab, setTab] = useState(1);

  const dataTab = [
    {
      value: 1,
      label: "Tương tác",
    },
    {
      value: 2,
      label: "Kết quả",
    },
    {
      value: 3,
      label: "Khách hàng",
    },
  ];

  //Tương tác
  const [urlAction, setUrlAction] = useState(null);
  const [isLoadingUrlAction, setIsLoadingUrlAction] = useState(false);

  const reportAction = async (dataCampaign) => {
    setIsLoadingUrlAction(true);
    const params = {
      name: "",
      campaignId: dataCampaign?.campaignId,
      approachId: -1,
      fromTime: dataCampaign?.fromTime,
      toTime: dataCampaign?.toTime,
    };
    const campaignNameConvert = removeVietnameseTones(dataCampaign?.campaignName);

    const response = await CampaignService.exportAction(params);

    if (response) {
      const blob = new Blob([response], {
        type: "application/json",
      });

      let file = new File([blob], `${campaignNameConvert}_Tuongtac.xlsx`, {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const onSuccess = (data) => {
        if (data) {
          //
          setUrlAction([{ uri: data?.fileUrl, fileType: "xlsx" }]);
          setTimeout(() => {
            setIsLoadingUrlAction(false);
          }, 500);
        }
      };
      const onError = (message) => {};
      uploadDocumentFormData(file, onSuccess, onError);
    } else {
      setIsLoadingUrlAction(false);
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  //Kết quả
  const [urlResult, setUrlResult] = useState(null);
  const [isLoadingUrlResult, setIsLoadingUrlResult] = useState(false);

  const reportResult = async (dataCampaign) => {
    setIsLoadingUrlResult(true);
    const params = {
      name: "",
      campaignId: dataCampaign?.campaignId,
      approachId: -1,
      fromTime: dataCampaign?.fromTime,
      toTime: dataCampaign?.toTime,
    };
    const campaignNameConvert = removeVietnameseTones(dataCampaign?.campaignName);

    const response = await CampaignService.exportResult(params);

    if (response) {
      const blob = new Blob([response], {
        type: "application/json",
      });

      let file = new File([blob], `${campaignNameConvert}_Ketqua.xlsx`, {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const onSuccess = (data) => {
        if (data) {
          //
          setUrlResult([{ uri: data?.fileUrl, fileType: "xlsx" }]);
          setTimeout(() => {
            setIsLoadingUrlResult(false);
          }, 500);
        }
      };
      const onError = (message) => {};
      uploadDocumentFormData(file, onSuccess, onError);
    } else {
      setIsLoadingUrlResult(false);
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  //khách hàng
  const [urlCustomer, setUrlCustomer] = useState(null);
  const [isLoadingUrlCustomer, setIsLoadingUrlCustomer] = useState(false);

  const reportCustomer = async (dataCampaign) => {
    setIsLoadingUrlCustomer(true);
    const params = {
      name: "",
      campaignId: dataCampaign?.campaignId,
      approachId: -1,
      fromTime: dataCampaign?.fromTime,
      toTime: dataCampaign?.toTime,
    };
    const campaignNameConvert = removeVietnameseTones(dataCampaign?.campaignName);

    const response = await CampaignService.exportCustomer(params);

    if (response) {
      const blob = new Blob([response], {
        type: "application/json",
      });

      let file = new File([blob], `${campaignNameConvert}_Khachhang.xlsx`, {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const onSuccess = (data) => {
        if (data) {
          //
          setUrlCustomer([{ uri: data?.fileUrl, fileType: "xlsx" }]);
          setTimeout(() => {
            setIsLoadingUrlCustomer(false);
          }, 500);
        }
      };
      const onError = (message) => {};
      uploadDocumentFormData(file, onSuccess, onError);
    } else {
      setIsLoadingUrlCustomer(false);
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (dataCampaign) {
      reportAction(dataCampaign);
      reportResult(dataCampaign);
      reportCustomer(dataCampaign);
    }
  }, [dataCampaign]);

  const handleClearForm = (acc) => {
    onHide(acc);
    setTab(1);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            // disabled: isSubmit,
            callback: () => {
              handleClearForm(false);
            },
          },

          {
            title: "Tải xuống",
            type: "submit",
            color: "primary",
            disabled: false,
            // is_loading: isSubmit,
            callback: () => {
              let fieldName = convertToId(dataCampaign?.campaignName) || "";
              fieldName = fieldName.replace(new RegExp(`[^A-Za-z0-9]`, "g"), "");

              let name = "";
              if (tab === 1) {
                name = `${fieldName}_Tuongtac.xlsx`;
              } else if (tab === 2) {
                name = `${fieldName}_Ketqua.xlsx`;
              } else {
                name = `${fieldName}_Khachhang.xlsx`;
              }

              const urlDownload = tab === 1 ? urlAction[0].uri : tab === 2 ? urlResult[0].uri : urlCustomer[0].uri;

              handDownloadFileOrigin(urlDownload, name);
            },
          },
        ],
      },
    }),
    [tab, urlAction, urlResult, urlCustomer]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => handleClearForm(false)}
        className="modal-manage-info"
        size="xl"
      >
        <div className="form-manage-info">
          <ModalHeader title={`Báo cáo chiến dịch`} toggle={() => handleClearForm(false)} />
          <ModalBody>
            <div className="box-manage-info">
              <div className="view--manage-info">
                <div className="content__left">
                  {dataTab.map((item, idx) => {
                    return (
                      <div key={idx} className={`item--tab ${item.value === tab ? "active__item--tab" : ""}`} onClick={() => setTab(item.value)}>
                        {item.label}
                      </div>
                    );
                  })}
                </div>
                <div className="content__right">
                  {tab === 1 ? (
                    <div>
                      {isLoadingUrlAction ? (
                        <Loading />
                      ) : !urlAction ? (
                        <SystemNotification
                          description={
                            <span>
                              Chưa có dữ liệu.
                              <br />
                            </span>
                          }
                          type="no-item"
                        />
                      ) : (
                        <DocViewer
                          pluginRenderers={DocViewerRenderers}
                          documents={urlAction}
                          config={{
                            header: {
                              disableHeader: true,
                              disableFileName: false,
                              retainURLParams: false,
                            },
                          }}
                          style={{ height: "46rem" }}
                        />
                      )}
                    </div>
                  ) : tab === 2 ? (
                    <div>
                      {isLoadingUrlResult ? (
                        <Loading />
                      ) : !urlResult ? (
                        <SystemNotification
                          description={
                            <span>
                              Chưa có dữ liệu.
                              <br />
                            </span>
                          }
                          type="no-item"
                        />
                      ) : (
                        <DocViewer
                          pluginRenderers={DocViewerRenderers}
                          documents={urlResult}
                          config={{
                            header: {
                              disableHeader: true,
                              disableFileName: false,
                              retainURLParams: false,
                            },
                          }}
                          style={{ height: "46rem" }}
                        />
                      )}
                    </div>
                  ) : (
                    <div>
                      {isLoadingUrlCustomer ? (
                        <Loading />
                      ) : !urlCustomer ? (
                        <SystemNotification
                          description={
                            <span>
                              Chưa có dữ liệu.
                              <br />
                            </span>
                          }
                          type="no-item"
                        />
                      ) : (
                        <DocViewer
                          pluginRenderers={DocViewerRenderers}
                          documents={urlCustomer}
                          config={{
                            header: {
                              disableHeader: true,
                              disableFileName: false,
                              retainURLParams: false,
                            },
                          }}
                          style={{ height: "46rem" }}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
    </Fragment>
  );
}
