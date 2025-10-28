import React, { Fragment, useState, useEffect, useRef, useMemo } from "react";
import _ from "lodash";
import Tippy from "@tippyjs/react";
import { useSearchParams } from "react-router-dom";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import CustomScrollbar from "components/customScrollbar";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Modal, { ModalBody, ModalHeader } from "components/modal/modal";
import { IChooseTemplateSMSModelProps } from "model/customer/PropsModel";
import { ITemplateSMSResponse } from "model/templateSMS/TemplateSMSResponse";
import { ITemplateSMSFilterRequest } from "model/templateSMS/TemplateSMSRequest";
import { IFilterItem } from "model/OtherModel";
import TemplateSMSService from "services/TemplateSMSService";
import { showToast } from "utils/common";
import { trimContent, isDifferenceObj } from "reborn-util";
import "tippy.js/animations/scale.css";
import "./ChooseTemplateSMSModal.scss";

export default function ChooseTemplateSMSList(props: IChooseTemplateSMSModelProps) {
  const { onShow, onHide, callBack, idBrandname, firstIdBrandname } = props;

  const isMounted = useRef(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [listCategorySMS, setListCategorySMS] = useState<ITemplateSMSResponse[]>([]);

  const [params, setParams] = useState<ITemplateSMSFilterRequest>({
    limit: 100,
    brandnameId: idBrandname ? idBrandname : firstIdBrandname,
  });

  useEffect(() => {
    setParams({ ...params, brandnameId: idBrandname ? idBrandname : firstIdBrandname });
  }, [idBrandname, firstIdBrandname]);

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

  const getListTemplateSMS = async (paramsSearch: ITemplateSMSFilterRequest) => {
    setIsLoading(true);

    const response = await TemplateSMSService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result.items;
      setListCategorySMS(result);

      if (+result.total === 0 && +result.page === 1) {
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
      getListTemplateSMS(params);
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
        setSearchParams(paramsTemp as Record<string, string | string[]>);
      }
    }
  }, [params, onShow]);

  const deleteParamUrl = () => {
    const deepParam = _.cloneDeep(params);
    delete deepParam["brandnameId"];
    delete deepParam["tcyId"];
    delete deepParam["page"];
    delete deepParam["limit"];

    setSearchParams(deepParam as Record<string, string | string[]>);
  };

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide()} className="modal-option">
        <div className="wrapper-option">
          <ModalHeader title="Chọn mẫu" toggle={() => onHide()} />
          <ModalBody>
            <div className="search-option">
              <SearchBox params={params} isFilter={true} listFilterItem={customerFilterList} updateParams={(paramsNew) => setParams(paramsNew)} />
            </div>
            <CustomScrollbar width="100%" height="42rem">
              <div className="list-option">
                {!isLoading && listCategorySMS && listCategorySMS.length > 0 ? (
                  listCategorySMS.map((item, idx) => {
                    return (
                      <div key={idx} className="item-option">
                        <h3 className="title">{item.title}</h3>
                        <Tippy content={item.content} delay={[120, 100]} animation="scale">
                          <p className="content">{trimContent(item.content, 120, true, true)}</p>
                        </Tippy>

                        <div
                          className="action-option"
                          onClick={() => {
                            onHide();
                            callBack(item);
                            deleteParamUrl();
                          }}
                        >
                          <span>Chọn</span>
                        </div>
                      </div>
                    );
                  })
                ) : isLoading ? (
                  <Loading />
                ) : (
                  <Fragment>
                    {isNoItem ? (
                      <SystemNotification description={<span>Hiện tại bạn chưa có mẫu tin nhắn nào.</span>} type="no-result" />
                    ) : (
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
            </CustomScrollbar>
          </ModalBody>
        </div>
      </Modal>
    </Fragment>
  );
}
