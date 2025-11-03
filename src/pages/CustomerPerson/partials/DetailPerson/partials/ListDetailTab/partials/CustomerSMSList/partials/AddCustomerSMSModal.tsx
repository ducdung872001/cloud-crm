/* eslint-disable prefer-const */
import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import _ from "lodash";
import Tippy from "@tippyjs/react";
import { useSearchParams } from "react-router-dom";
import { IActionModal, IFilterItem } from "model/OtherModel";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import CustomScrollbar from "components/customScrollbar";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IAddCustomerSMSModelProps } from "model/customerSMS/PropsModel";
import { ICustomerSendSMSRequestModel } from "model/customer/CustomerRequestModel";
import { ITemplateSMSResponse } from "model/templateSMS/TemplateSMSResponse";
import { ITemplateSMSFilterRequest } from "model/templateSMS/TemplateSMSRequest";
import TemplateSMSService from "services/TemplateSMSService";
import CustomerService from "services/CustomerService";
import { showToast } from "utils/common";
import { trimContent, isDifferenceObj, isObjEmpty } from "reborn-util";
import "tippy.js/animations/scale.css";
import "./AddCustomerSMSModal.scss";

export default function AddCustomerSMSModal(props: IAddCustomerSMSModelProps) {
  const { onShow, idCustomer, onHide, callback } = props;

  const isMounted = useRef(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const [listCategorySMS, setListCategorySMS] = useState<ITemplateSMSResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [idCategorySMS, setIdCategorySMS] = useState<number>(null);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const [params, setParams] = useState<ITemplateSMSFilterRequest>({
    name: "",
    page: page,
  });

  useEffect(() => {
    setParams({ ...params, page: page });
  }, [page]);

  useEffect(() => {
    setIdCategorySMS(null);
  }, [params]);

  const [body, setBody] = useState<ICustomerSendSMSRequestModel>({
    templateId: 0,
    customerId: idCustomer,
  });

  const customerFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "brandnameId",
        name: "Đầu số tin nhắn",
        type: "select",
        is_featured: true,
        value: searchParams.get("brandnameId") ?? "",
      },
      {
        key: "tcyId",
        name: "Chủ đề tin nhắn",
        type: "select",
        is_featured: true,
        value: searchParams.get("tcyId") ?? "",
      },
    ],
    [searchParams]
  );

  useEffect(() => {
    setBody({ ...body, templateId: idCategorySMS, customerId: idCustomer });
  }, [idCustomer, idCategorySMS]);

  const getListCategoryTemplateSMS = async (paramsSearch: ITemplateSMSFilterRequest) => {
    setIsLoading(true);

    const response = await TemplateSMSService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setHasMore(result.loadMoreAble);

      const newData = page == 1 ? [] : listCategorySMS;

      (result.items || []).map((item) => {
        newData.push(item);
      });

      setListCategorySMS(newData);

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
      getListCategoryTemplateSMS(params);
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
    const response = await CustomerService.parserSms(idCategorySMS);
    if (response.code === 0) {
      //Thực hiện gửi sms thực sự
      if (!response.result) {
        notiError("");
      } else if (isObjEmpty(response.result)) {
        //Gửi trực tiếp mà không bật popup tùy chỉnh placeholder
        sendSms();
      } else {
        let codes = Object.keys(response.result).map((item) => item.replace("{{", "").replace("}}", ""));

        //Đóng và bật cửa sổ tiếp theo lên
        setIsSubmit(false);
        onHide(true);
        callback({ codes: codes, templateId: idCategorySMS, customerId: idCustomer });
      }
    } else {
      notiError(response.result.message);
      setIsSubmit(false);
    }
  };

  /**
   * Gửi sms đi luôn mà không bật popup nếu không có custom placeholder nào
   */
  const sendSms = async () => {
    const body: ICustomerSendSMSRequestModel = {
      templateId: idCategorySMS,
      customerId: idCustomer,
    };

    const response = await CustomerService.customerSendSMS(body);

    if (response.code === 0 && response.result.status !== 2) {
      showToast("Gửi tin nhắn thành công", "success");
      setIdCategorySMS(null);
      setListCategorySMS([]);
      onHide(true);
      setIsSubmit(false);
    } else {
      showToast(response.result.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
      setIdCategorySMS(null);
    }
  };

  const notiError = (message) => {
    showToast(message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    setIsSubmit(false);
    setIdCategorySMS(null);
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
              onHide(false);
            },
          },
          {
            title: "Xác nhận",
            type: "submit",
            color: "primary",
            disabled: isSubmit || idCategorySMS === null,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, idCategorySMS]
  );

  const handleScroll = (e) => {
    if (isLoading) {
      return;
    }

    const result = e.target.scrollHeight - Math.round(e.target.scrollTop) === e.target.clientHeight;
    if (result && hasMore) {
      setPage((prevState) => prevState + 1);
    }
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-send-sms"
      >
        <form className="form-send-sms" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title="Chọn mẫu gửi SMS" toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="search-option">
              <SearchBox params={params} isFilter={true} listFilterItem={customerFilterList} updateParams={(paramsNew) => setParams(paramsNew)} />
            </div>
            <CustomScrollbar width="100%" height="42rem" handleScroll={handleScroll}>
              <div className="box__template--sms">
                <div className="list-template-sms">
                  {listCategorySMS &&
                    listCategorySMS.length > 0 &&
                    listCategorySMS.map((item, idx) => {
                      return (
                        <div key={idx} className={`${idCategorySMS === item.id ? "active-template-sms" : "item-template-sms"}`}>
                          {idCategorySMS === item.id ? (
                            <span className="iconCheck">
                              <Icon name="CheckedCircle" />
                            </span>
                          ) : (
                            ""
                          )}
                          <div className="info-template-sms">
                            <h3 className="title">{item.title}</h3>
                            <Tippy content={item.content} delay={[120, 100]} animation="scale">
                              <p className="content">{trimContent(item.content, 100, true, true)}</p>
                            </Tippy>
                          </div>
                          <div
                            className="icon-action"
                            onClick={() => {
                              setIdCategorySMS(item.id);

                              if (item.id === idCategorySMS) {
                                setIdCategorySMS(null);
                              }
                            }}
                          >
                            <div className="action-left">
                              <Icon name="Mail" />
                              <h4 className="action-item">Gửi SMS</h4>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {isLoading && <Loading />}

                  {!isLoading && listCategorySMS.length === 0 && (
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
            </CustomScrollbar>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
    </Fragment>
  );
}
