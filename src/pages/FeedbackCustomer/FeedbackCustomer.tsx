import React, { Fragment, useState, useEffect, useRef, useMemo } from "react";
import _ from "lodash";
import moment from "moment";
import { useSearchParams } from "react-router-dom";
import Loading from "components/loading";
import Badge from "components/badge/badge";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
import { handDownloadFileOrigin, showToast } from "utils/common";
import ImageExcel from "assets/images/img-excel.png";
import ImageWord from "assets/images/img-word.png";
import ImagePowerPoint from "assets/images/img-powerpoint.png";
import ImagePdf from "assets/images/img-pdf.png";
import FeedbackService from "services/FeedbackService";
import { getPageOffset, isDifferenceObj } from "reborn-util";
import Icon from "components/icon";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Fancybox from "components/fancybox/fancybox";
import Image from "components/image";
import "./FeedbackCustomer.scss";

export default function FeedbackCustomer() {
  document.title = "Góp ý cải tiến";

  const isMounted = useRef(false);

  const [listFeedbackCustomer, setListFeedbackCustomer] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [params, setParams] = useState({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách góp ý cải tiến",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Góp ý cải tiến",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const customerFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "status",
        name: "Trạng thái xử lý",
        type: "select",
        is_featured: true,
        list: [
          {
            value: "0",
            label: "Tất cả",
          },
          {
            value: "1",
            label: "Đang xử lý",
          },
          {
            value: "2",
            label: "Đã xử lý",
          },
        ],
        value: searchParams.get("status") ?? "",
      },
    ],
    [searchParams]
  );

  const getListFeedbackCustomer = async (paramsSearch) => {
    setIsLoading(true);

    const response = await FeedbackService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setListFeedbackCustomer(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && +result.page === 1) {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);
    searchParams.forEach(async (key, value) => {
      paramsTemp[value] = key;
    });
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true) {
      getListFeedbackCustomer(params);
      const paramsTemp: any = _.cloneDeep(params);
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
  }, [params]);

  const titles = ["STT", "Nội dung góp ý cải tiến", "Đơn vị đóng góp", "Người góp ý", "Trạng thái", "Thời gian"];

  const dataFormat = ["text-center", "", "", "", "text-center", "text-center"];

  const viewMediaFeedback = (data) => {
    return (
      <div className="view__media--feedback">
        <div style={{ marginBottom: "0.5rem" }}>{data.content}</div>
        {data.medias.map((item, idx) => {
          return (
            <div key={idx} className="item__media">
              {item.type == "image" ? (
                <Fancybox>
                  <a key={item.id} data-fancybox="gallery" href={item.url}>
                    <Image src={item.url} alt={item.name} width={"50rem"} />
                  </a>
                </Fancybox>
              ) : item.type == "video" ? (
                <video controls>
                  <source src={item.url} />
                </video>
              ) : (
                <div className="img-document">
                  <div className="info-document">
                    <div className="__avatar--doc">
                      <img
                        src={item.type == "pdf" ? ImagePdf : item.type == "xlsx" ? ImageExcel : item.type == "docx" ? ImageWord : ImagePowerPoint}
                        alt={item.content}
                      />
                    </div>
                    <div className="__detail">
                      <span className="name-document">{item.fileName}</span>
                      <span className="size-document">
                        {item.fileSize > 1048576 ? `${(item.fileSize / 1048576).toFixed(2)} MB` : `${(item.fileSize / 1024).toFixed(1)} KB`}
                      </span>
                    </div>
                  </div>

                  <div className="action-download" onClick={() => handDownloadFileOrigin(item.url, item.fileName)}>
                    <span className="__name--download">
                      <Icon name="Download" />
                      Tải xuống
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const dataMappingArray = (item, index: number) => [
    getPageOffset(params) + index + 1,
    item.medias && item.medias.length > 0 ? viewMediaFeedback(item) : item.content,
    item.beautySalonName,
    item.employeeName,
    <Badge key={item.id} text={item.status == 2 ? "Đã xử lý" : "Đang xử lý"} variant={item.status == 2 ? "success" : "warning"} />,
    item.createdTime ? moment(item.createdTime).format("HH:mm DD/MM/YYYY") : "",
  ];

  const actionsTable = (item): IAction[] => {
    return [
      {
        title: item.status == 2 ? "Đã xử lý" : "Đang xử lý",
        icon: item.status == 2 ? <Icon name="CheckedCircle" className="icon-success" /> : <Icon name="WarningCircle" className="icon-warning" />,
        callback: () => {
          showDialogConfirmStatus(item);
        },
      },
    ];
  };

  const handleConfirm = async (id: number, status) => {
    if (!id) return;

    const body = {
      id: id,
      status: status == 2 ? 1 : 2,
    };

    const response = await FeedbackService.changeStatus(body);

    if (response.code === 0) {
      showToast(`Chuyển trạng thái thành công`, "success");
      getListFeedbackCustomer(params);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setShowDialog(false);
  };

  const showDialogConfirmStatus = (item) => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-warning",
      isCentered: true,
      isLoading: true,
      title: `${item.status ? "Đang xử lý" : "Đã xử lý"}`,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn chuyển sang trạng thái <strong>{item.status ? "Đang xử lý" : "Đã xử lý"}</strong>? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => handleConfirm(item.id, item.status),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  return (
    <div className={`page-content page__feedback--customer${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Góp ý cải tiến" />

      <div className="card-box d-flex flex-column">
        <SearchBox
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          isFilter={true}
          listFilterItem={customerFilterList}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listFeedbackCustomer && listFeedbackCustomer.length > 0 ? (
          <BoxTable
            name="Góp ý cải tiến"
            titles={titles}
            items={listFeedbackCustomer}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            striped={true}
            actions={actionsTable}
            actionType="inline"
          />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Fragment>
            {isNoItem ? (
              <SystemNotification
                description={
                  <span>
                    Hiện tại chưa có góp ý khách hàng nào. <br />
                    Hãy thêm mới góp ý khách hàng đầu tiên nhé!
                  </span>
                }
                type="no-item"
              />
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
      <Dialog isOpen={showDialog} content={contentDialog} />
    </div>
  );
}
