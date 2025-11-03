import React, { Fragment, useState, useEffect, useMemo, useRef, useContext } from "react";
import { IAction, IActionModal } from "model/OtherModel";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj, convertToId, convertToFileName, trimContent } from "reborn-util";
import "./ModalEvaluateBidding.scss";
import { formatFileSize, handDownloadFileOrigin, showToast } from "utils/common";
import Button from "components/button/button";
import { useNavigate } from "react-router-dom";
import { ContextType, UserContext } from "contexts/userContext";
import SelectCustom from "components/selectCustom/selectCustom";
import TextArea from "components/textarea/textarea";
import { uploadDocumentFormData } from "utils/document";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import moment from "moment";
import Tippy from "@tippyjs/react";
import Loading from "components/loading";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import Badge from "components/badge/badge";
import BoxTable from "components/boxTable/boxTable";
import TenderPackageService from "services/TenderPackageService";
import ModalConfirm from "components/ModalConfirm/ModalConfirm";
import ButtonComponent from "components/ButtonComponent/ButtonComponent";

export default function ModalEvaluateBidding({ onShow, onHide, data }) {
  // console.log('data', data);

  const navigation = useNavigate();
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [listBidding, setListBidding] = useState([]);
  const [showModalBiddingProfile, setShowModalBiddingProfile] = useState(false);
  const [dataBidding, setDataBidding] = useState(null);
  const [isModalConfirm, setIsModalConfirm] = useState(false);
  //hồ sơ kỹ thuật technical, hồ sơ tài chính finance
  const [evaluationType, setEvaluationType] = useState("technical");
  const [totalBidEvaluated, setTotalBidEvaluated] = useState(null);

  const [params, setParams] = useState<any>({
    name: "",
    limit: 10,
    page: 1,
    packageId: null,
    status: 3,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "nhà thầu",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const getListTenderPackage = async (paramsSearch: any, disableLoading?: boolean) => {
    if (!disableLoading) {
      setIsLoading(true);
    }

    const response = await TenderPackageService.listContractor(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setListBidding(result);

      const totalBidEvaluated = result.filter((item) => item.isEvaluated === 1).length;
      setTotalBidEvaluated({
        totalBidEvaluated: totalBidEvaluated,
        total: result.length,
      });

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  const titles = [
    "Nhà thầu",
    ...(evaluationType === "technical" ? ["Hồ sơ đạt"] : ["Thứ tự đánh giá"]),
    // "Hồ sơ đạt",
    "Trạng thái",
    "Hồ sơ dự thầu",
  ];

  const dataFormat = ["", "", "text-center", "text-center"];

  const dataMappingArray = (item: any, index: number, type?: string) => [
    // getPageOffset(params) + index + 1,
    <div
      className="title-name"
      onClick={() => {
        //   setDataBidding(item);
        //   setShowDetailBidding(true);
      }}
      style={{ cursor: "pointer" }}
    >
      {item.organizationName}
    </div>,
    item.canUpdate === 1 ? (
      <div>
        <SelectCustom
          id=""
          name=""
          fill={true}
          required={true}
          special={true}
          options={[
            {
              value: 1,
              label: "Số 1",
            },
            {
              value: 2,
              label: "Số 2",
            },
          ]}
          value={{ value: 1, label: "Số 1" }}
          onChange={(e) => {}}
          isAsyncPaginate={false}
          placeholder=""
          // additional={{
          //   page: 1,
          // }}
          // loadOptionsPaginate={loadOptionBranch}
        />
      </div>
    ) : (
      <div className="box-loading-success-profile">
        {Array.from({ length: item.totalDocument }).map((_, i) => (
          <div
            key={i}
            className={i === 0 ? "cell-first" : i === item.totalDocument - 1 ? "cell-last" : "cell-center"}
            style={{ width: `${100 / item.totalDocument}%`, backgroundColor: i < item.quantityReached ? "#ED1B34" : "" }}
          ></div>
        ))}
      </div>
    ),
    <div className="box-status">
      <Badge
        key={item.id}
        text={item.isEvaluated === 0 || item.isEvaluated === null ? "Chờ đánh giá" : item.isEvaluated === 1 ? "Đã đánh giá" : ""}
        variant={item.isEvaluated === 0 || item.isEvaluated === null ? "primary" : item.isEvaluated === 1 ? "done" : "done"}
      />
    </div>,

    item.submittedCount ? (
      <div className="bidding-profile">
        <div className="count-profile">
          <span style={{ fontSize: 12, fontWeight: "400", color: "#FFFFFF" }}>{item.submittedCount}</span>
        </div>
        <div
          style={{ cursor: "pointer" }}
          onClick={() => {
            setDataBidding(item);
            setShowModalBiddingProfile(true);
          }}
        >
          <Icon name="FolderRox" />
        </div>
      </div>
    ) : (
      ""
    ),
    "",
  ];

  const actionsTable = (item: any): IAction[] => {
    return [].filter((action) => action);
  };

  useEffect(() => {
    if (onShow && data) {
      setParams({ ...params, packageId: data?.clarificationDetailId });
    }
  }, [onShow, data]);

  useEffect(() => {
    if (params?.packageId) {
      getListTenderPackage(params);
    } else {
      setIsLoading(false);
    }
  }, [params]);

  const onSubmit = async (e) => {
    // e.preventDefault();
    setIsSubmit(true);

    const body = listBidding.map((item) => {
      return {
        packageId: item.packageId,
        organizationId: item.organizationId,
      };
    });

    console.log("body", body);

    const response = await TenderPackageService.submitReview(body);

    if (response.code === 0) {
      showToast(`Gửi đánh giá thành công`, "success");
      setIsModalConfirm(false);
      handleClear(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          //   ...(dataAsked?.status === 3 ? [] : [
          //     {
          //       title: "Lưu",
          //       type: "submit",
          //       color: "primary",
          //       disabled: isSubmit,
          //       // || !isDifferenceObj(formData, values),
          //       is_loading: isSubmit,
          //       // callback: () => {}
          //     },
          //   ] as any),
          // {
          //   title: "Đóng",
          //   color: "primary",
          //   variant: "outline",
          //   disabled: isSubmit,
          //   callback: () => {
          //       handleClear(false);
          //   },
          // },
        ],
      },
    }),
    [isSubmit, data]
  );

  const handleClear = (acc) => {
    onHide(acc);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="xxl"
        toggle={() => !isSubmit && handleClear(false)}
        className="modal-evalute-bidding"
      >
        <form className="form-evalute-bidding" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Đánh giá nhà thầu`} toggle={() => !isSubmit && handleClear(false)} />
          <ModalBody>
            <div className="container-evalute-bidding-modal">
              <div
                className="table-tender-invitation-list"
                style={!isLoading && listBidding && listBidding.length === 0 ? { backgroundColor: "#FFFFFF" } : {}}
              >
                {!isLoading && listBidding && listBidding.length > 0 ? (
                  <BoxTable
                    name="gói thầu"
                    titles={titles}
                    items={listBidding}
                    isPagination={false}
                    dataPagination={pagination}
                    dataMappingArray={(item, index) => dataMappingArray(item, index)}
                    dataFormat={dataFormat}
                    listIdChecked={[]}
                    isBulkAction={false}
                    // bulkActionItems={bulkActionList}
                    striped={true}
                    setListIdChecked={(listId) => {}}
                    actions={actionsTable}
                    actionType="inline"
                  />
                ) : isLoading ? (
                  <Loading />
                ) : (
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <span>Chưa có nhà thầu nào</span>
                  </div>
                )}
              </div>

              {/* <div className="container-footer">
                  {totalBidEvaluated ? 
                    <div>
                      <div style={{marginTop: '1.2rem'}}>
                        <span style={{fontSize: 14, fontWeight: '500', color: '#939394'}}>{`${totalBidEvaluated.totalBidEvaluated}/${totalBidEvaluated.total} nhà thầu đã được đánh giá`}</span>
                      </div>
                      <div className="container-loading-bidding">
                        <div className="line-loading" style={{width: `${(totalBidEvaluated.totalBidEvaluated/totalBidEvaluated.total) * 100}%`}}></div>
                      </div>
                    </div>
                  : null}

                  <div className="button">
                    <ButtonComponent 
                      name='Gửi đánh giá' 
                      callback={() => {
                        setIsModalConfirm(true);
                      }}
                    />
                  </div>
                </div> */}
            </div>
            <div style={{ borderTop: "1px solid #EEEEEF", marginTop: "1.2rem" }} />

            {!isLoading ? (
              <div className="container-footer">
                {totalBidEvaluated ? (
                  <div>
                    <div>
                      <span
                        style={{ fontSize: 14, fontWeight: "500", color: "#939394" }}
                      >{`${totalBidEvaluated.totalBidEvaluated}/${totalBidEvaluated.total} nhà thầu đã được đánh giá`}</span>
                    </div>
                    <div className="container-loading-bidding">
                      <div
                        className="line-loading"
                        style={{ width: `${(totalBidEvaluated.totalBidEvaluated / totalBidEvaluated.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ) : null}

                {data?.status === 2 ? null : (
                  <div className="button">
                    <ButtonComponent
                      disabled={totalBidEvaluated && totalBidEvaluated.totalBidEvaluated === totalBidEvaluated.total ? false : true}
                      name="Gửi đánh giá"
                      callback={() => {
                        setIsModalConfirm(true);
                      }}
                    />
                  </div>
                )}
              </div>
            ) : null}
          </ModalBody>
          {/* <ModalFooter actions={actions} /> */}
        </form>
      </Modal>

      {/* <ModalBiddingProfile
        data={dataBidding}
        dataWork={data}
        disabled={false}
        evaluationType={evaluationType}
        onShow={showModalBiddingProfile}
        onHide={(reload) => {
          if(reload){
            getListTenderPackage(params);
          }
          setShowModalBiddingProfile(false);
        }}
      /> */}

      <ModalConfirm
        onShow={isModalConfirm}
        title={"gửi đánh giá"}
        content="gửi đánh giá hồ sơ"
        isSubmit={isSubmit}
        onSubmit={onSubmit}
        onHide={(reload) => {
          if (reload) {
            // handGetDetailWork(dataAsked?.id);
          }
          setIsModalConfirm(false);
        }}
      />

      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
