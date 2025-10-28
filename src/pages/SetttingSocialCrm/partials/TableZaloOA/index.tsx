import React, { Fragment, useState, useEffect, useRef } from "react";
import { IAction } from "model/OtherModel";
import { ITableZaloOAProps } from "model/zaloOA/PropsModel";
import { IZaloOAResponse } from "model/zaloOA/ZaloOAResponse";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Icon from "components/icon";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import ZaloOAService from "services/ZaloOAService";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import ZnsTemplateModal from "./partials/ZnsTemplateModal";
import { IZnsTemplateFilterRequest } from "model/znsTemplate/ZnsTemplateRequestModel";
import ZnsTemplateService from "services/ZnsTemplateService";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { IZnsTemplateResponse } from "model/znsTemplate/ZnsTemplateResponseModel";
import _ from "lodash";
import "./index.scss";

export default function TableZaloOA(props: ITableZaloOAProps) {
  const { listZaloOA, isLoading, dataPagination, callback, isPermissionsZalo } = props;

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [permissions, setPermissions] = useState(getPermissions());
  const isMounted = useRef(false);
  const [zaloOa, setZaloOa] = useState(null);
  const [showModalZaloTemplate, setShowModalZaloTemplate] = useState<boolean>(false);
  const [isLoadingZNS, setIsLoadingZNS] = useState<boolean>(true);
  const [listZnsTemplate, setListZnsTemplate] = useState<IZnsTemplateResponse[]>([]);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [params, setParams] = useState<IZnsTemplateFilterRequest>({
    name: "",
    limit: 10,
  });

  const titles = ["STT", "Ảnh đại diện", "Tên Zalo OA", "Mẫu ZNS", "Mô tả"];

  const dataFormat = ["text-center", "text-center", "", "", ""];

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "loại hợp đồng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();
  const getListZnsTemplate = async (paramsSearch: IZnsTemplateFilterRequest) => {
    setIsLoadingZNS(true);

    const response = await ZnsTemplateService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListZnsTemplate(result);

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
    } else if (response.code == 400) {
      setIsPermissions(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoadingZNS(false);
  };

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true) {
      getListZnsTemplate(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
    }

    return () => {
      abortController.abort();
    };
  }, [params]);

  const dataMappingArray = (item: IZaloOAResponse, index: number) => [
    index + 1,
    item.avatar ? <img src={item.avatar} alt="avatar" /> : <Icon name="NoImage" />,
    item.name,
    <a
      key={item.id}
      onClick={(e) => {
        e && e.preventDefault();
        setZaloOa({ oaId: item.oaId, name: item.name });
        setShowModalZaloTemplate(true);
      }}
    >
      Xem thêm
    </a>,
    item.description,
  ];

  const actionsTable = (item: IZaloOAResponse): IAction[] => {
    return [
      permissions["ZALO_OA_DELETE"] == 1 && {
        title: "Gỡ Zalo Official Account",
        icon: <Icon name="UnConnect" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDelete = async (id: string) => {
    const response = await ZaloOAService.delete(id);
    if (response.code === 0) {
      showToast("Gỡ Zalo Offical Account thành công", "success");
      callback();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IZaloOAResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Gỡ...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn gỡ Zalo Offical Account
          {item ? <strong> {item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => onDelete(item.oaId),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  return (
    <Fragment>
      {!isLoading && listZaloOA && listZaloOA.length > 0 ? (
        <BoxTable
          name="Danh sách Zalo Offical Account"
          titles={titles}
          items={listZaloOA}
          dataMappingArray={(item, index) => dataMappingArray(item, index)}
          dataFormat={dataFormat}
          striped={true}
          isPagination={false}
          dataPagination={dataPagination}
          actions={actionsTable}
          actionType="inline"
          className="table__zalo"
        />
      ) : isLoading ? (
        <Loading />
      ) : isPermissionsZalo ? (
        <SystemNotification type="no-permission" />
      ) : (
        <SystemNotification description={<span>Hiện tại bạn chưa có Zalo Offical Account nào.</span>} type="no-item" />
      )}

      <ZnsTemplateModal
        zaloOa={zaloOa}
        onShow={showModalZaloTemplate}
        onHide={(reload) => {
          if (reload) {
            getListZnsTemplate(params);
          }

          setShowModalZaloTemplate(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
