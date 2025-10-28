/* eslint-disable prefer-const */
import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import _ from "lodash";
import moment from "moment";
import { useSearchParams } from "react-router-dom";
import { IActionModal, IFilterItem } from "model/OtherModel";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import CustomScrollbar from "components/customScrollbar";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IAddCustomerEmailModelProps } from "model/customerEmail/PropsModel";
import { ICustomerSendEmailRequestModel } from "model/customer/CustomerRequestModel";
import { ITemplateEmailResponseModel } from "model/templateEmail/TemplateEmailResponseModel";
import { ITemplateEmailFilterRequest } from "model/templateEmail/TemplateEmailRequestModel";
import TemplateEmailService from "services/TemplateEmailService";
import CustomerService from "services/CustomerService";
import { showToast } from "utils/common";
import { trimContent, isDifferenceObj, isObjEmpty } from "reborn-util";
import parser from "html-react-parser";
import "./AddCustomerEmailModal.scss";

export default function AddCustomerEmailModal(props: IAddCustomerEmailModelProps) {
  const { onShow, dataCustomer, onHide, callback } = props;  
  
  const isMounted = useRef(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const [listCategoryEmail, setListCategoryEmail] = useState<ITemplateEmailResponseModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [idCategoryEmail, setIdCategoryEmail] = useState<number>(null);
  const [isDetailTemplate, setIsDetailTemplate] = useState<boolean>(false);
  const [detailTemplate, setDetailTemplate] = useState<ITemplateEmailResponseModel>(null);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);

  const [params, setParams] = useState<ITemplateEmailFilterRequest>({
    name: "",
    limit: 10000,
  });

  useEffect(() => {
    setIdCategoryEmail(null);
  }, [params]);

  const [body, setBody] = useState<ICustomerSendEmailRequestModel>({
    templateId: 0,
    customerId: dataCustomer?.id,
  });

  const customerFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "tcyId",
        name: "Chủ đề email",
        type: "select",
        is_featured: true,
        value: searchParams.get("tcyId") ?? "",
      },
    ],
    [searchParams]
  );

  useEffect(() => {
    setBody({ ...body, templateId: idCategoryEmail, customerId: dataCustomer?.id });
  }, [dataCustomer?.id, idCategoryEmail]);

  const getListCategoryTemplateEmail = async (paramsSearch: ITemplateEmailFilterRequest) => {
    setIsLoading(true);

    const response = await TemplateEmailService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setListCategoryEmail(result?.items);

      if (+result.total === 0) {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true && onShow) {
      getListCategoryTemplateEmail(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
      if (isDifferenceObj(searchParams, paramsTemp)) {
        if (paramsTemp.page === 1) {
          delete paramsTemp["page"];
        }
        setSearchParams(paramsTemp as unknown as Record<string, string | string[]>);
      }
    }
  }, [params, onShow]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmit(true);

    //Kiểm tra đã setup mẫu placeholder chưa
    const response = await CustomerService.parserEmail(idCategoryEmail);
    if (response.code === 0) {
      //Thực hiện gửi email thực sự
      if (!response.result) {
        notiError("");
      } else if (isObjEmpty(response.result)) {
        //Gửi trực tiếp email
        sendEmail();
      } else {
        let codes = Object.keys(response.result).map((item) => item.replace("{{", "").replace("}}", ""));

        //Đóng và bật cửa sổ tiếp theo lên
        setIsSubmit(false);
        onHide(true);
        callback({ codes: codes, templateId: idCategoryEmail, customerId: dataCustomer?.id });
      }
    } else {
      setIsSubmit(false);
      notiError(response.result.message);
    }
  };

  /**
   * Gửi email đi luôn mà không bật popup nếu
   */
  const sendEmail = async () => {
    const body: ICustomerSendEmailRequestModel = {
      templateId: idCategoryEmail,
      customerId: dataCustomer?.id,
    };

    const response = await CustomerService.customerSendEmail(body);
    if (response.code === 0 && response.status !== 2) {
      showToast("Gửi email thành công", "success");
      setIdCategoryEmail(null);
      setListCategoryEmail([]);
      onHide(true);
      setIsSubmit(false);
    } else {
      // console.log(response);
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const notiError = (message) => {
    showToast(message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    setIsSubmit(false);
    setIdCategoryEmail(null);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: `${isDetailTemplate ? "Quay lại" : "Hủy"}`,
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              isDetailTemplate ? setIsDetailTemplate(!isDetailTemplate) : onHide(false);
            },
          },
          {
            title: "Xác nhận",
            type: "submit",
            color: "primary",
            disabled: isSubmit || idCategoryEmail === null,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, idCategoryEmail, isDetailTemplate]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-send-email"
      >
        <form className="form-send-email" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${isDetailTemplate ? "Chi tiết mẫu email" : "Chọn mẫu email"}`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className={`${isDetailTemplate ? "d-none" : "search-option"}`}>
              <SearchBox params={params} isFilter={true} listFilterItem={customerFilterList} updateParams={(paramsNew) => setParams(paramsNew)} />
            </div>
            <CustomScrollbar width="100%" height="42rem">
              <Fragment>
                <div className={`${isDetailTemplate ? "d-none" : "view-template-email"}`}>
                  <div className="box__template--email">
                    <div className="list-template-email">
                      {listCategoryEmail &&
                        listCategoryEmail.length > 0 &&
                        listCategoryEmail.map((item, idx) => {
                          return (
                            <div key={idx} className={`${idCategoryEmail === item.id ? "active-template-email" : "item-template-email"}`}>
                              {idCategoryEmail === item.id ? (
                                <span className="iconCheck">
                                  <Icon name="CheckedCircle" />
                                </span>
                              ) : (
                                ""
                              )}
                              <div className="info-template-email">
                                <h3
                                  className="title"
                                  onClick={() => {
                                    setDetailTemplate(item);
                                    setIsDetailTemplate(true);
                                    setIdCategoryEmail(item.id);

                                    if (item.id === idCategoryEmail) {
                                      setDetailTemplate(null);
                                      setIdCategoryEmail(null);
                                      setIsDetailTemplate(false);
                                    }
                                  }}
                                  title="Xem chi tiết"
                                >
                                  {item.title}
                                </h3>
                                <p className="content">{trimContent(item.content, 100, true, true)}</p>
                              </div>
                              <div
                                className="icon-action"
                                onClick={() => {
                                  setIdCategoryEmail(item.id);

                                  if (item.id === idCategoryEmail) {
                                    setIdCategoryEmail(null);
                                  }
                                }}
                              >
                                <div className="action-left">
                                  <Icon name="Mail" />
                                  <h4 className="action-item">Chọn Email</h4>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                      {isLoading && <Loading />}

                      {!isLoading && listCategoryEmail.length === 0 && (
                        <Fragment>
                          {isNoItem && (
                            <SystemNotification
                              description={
                                <span>
                                  Không có dữ liệu trùng khớp.
                                  <br />
                                  Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                                </span>
                              }
                              type="no-result"
                            />
                          )}
                        </Fragment>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`${isDetailTemplate ? "detail-template" : "d-none"}`}>
                  <h3 className="title-detail">{detailTemplate?.title}</h3>
                  <p className="content-detail">{parser(detailTemplate?.content || "")}</p>
                  <div className="detail-info">
                    <div className="date-created">
                      <h4 className="item-title">Ngày tạo</h4>
                      <h4 className="item-name">{moment(new Date()).format("DD/MM/YYYY")}</h4>
                    </div>
                    <div className="customer">
                      <h4 className="item-title">Khách hàng</h4>
                      <h4 className="item-name">{dataCustomer?.name}</h4>
                    </div>
                    <div className="recipient">
                      <h4 className="item-title">Người nhận</h4>
                      <h4 className="item-name">{dataCustomer?.name}</h4>
                    </div>
                  </div>
                </div>
              </Fragment>
            </CustomScrollbar>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
    </Fragment>
  );
}
