import React, { Fragment, useState, useEffect, useRef, useMemo } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IAction, ISaveSearch, IFilterItem } from "model/OtherModel";
import { IContractAttributeResponse } from "model/contractAttribute/ContractAttributeResponse";
import { IContractAttributeFilterRequest } from "model/contractAttribute/ContractAttributeRequest";
import { IContractAttributeListProps } from "model/contractAttribute/PropsModel";
import ContractAttributeService from "services/ContractAttributeService";
import { showToast } from "utils/common";
import { getPermissions } from "utils/common";
import AddContractAttributeModal from "./partials/AddContractAtributeModal";
import { getPageOffset } from 'reborn-util';
import { useSearchParams } from "react-router-dom";

import "./ContractAttributeList.scss";

export default function ContractAttributeList(props: IContractAttributeListProps) {
  document.title = "Định nghĩa trường thông tin bổ sung hợp đồng";

  const { onBackProps } = props;

  const isMounted = useRef(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [listContractAttribute, setListContractAttribute] = useState<IContractAttributeResponse[]>([]);
  const [dataContractAttribute, setDataContractAttribute] = useState<IContractAttributeResponse>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());
  const [params, setParams] = useState<IContractAttributeFilterRequest>({
    name: "",
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách trường thông tin bổ sung",
      is_active: true,
    },
  ]);

  const contractAttributeFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "datatype", 
        name: "Kiểu dữ liệu",
        type: "select",
        is_featured: true,
        value: searchParams.get("datatype") ?? "",
      },
    ],
    [searchParams]
  );

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Trường thông tin hợp đồng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListContractAttribute = async (paramsSearch: IContractAttributeFilterRequest) => {
    setIsLoading(true);

    const response = await ContractAttributeService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListContractAttribute(result?.items);

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
    setIsLoading(false);
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
      getListContractAttribute(params);
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

  const titleActions: ITitleActions = {
    actions: [
      permissions["CONTRACT_ADD"] == 1 && {
        title: "Thêm mới",
        callback: () => {
          setDataContractAttribute(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên trường thông tin", "Kiểu dữ liệu", "Thứ tự hiển thị", "Thuộc nhóm"];

  const dataFormat = ["text-center", "", "", "text-center", ""];

  const dataMappingArray = (item: IContractAttributeResponse, index: number) => [
    getPageOffset(params) + index + 1, 
    item.name, 
    item.datatype || 'text',
    item.position, 
    item.parentName
  ];

  const actionsTable = (item: IContractAttributeResponse): IAction[] => {
    return [
      permissions["CONTRACT_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataContractAttribute(item);
          setShowModalAdd(true);
        },
      },
      permissions["CONTRACT_DELETE"] == 1 && {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ].filter((action) => action);
  };

  const onDelete = async (id: number) => {
    const response = await ContractAttributeService.delete(id);

    if (response.code === 0) {
      showToast("Xóa trường thông tin hợp đồng thành công", "success");
      getListContractAttribute(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IContractAttributeResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "trường thông tin hợp đồng " : `${listIdChecked.length} trường thông tin hợp đồng đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => onDelete(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    permissions["CONTRACT_DELETE"] == 1 && {
      title: "Xóa trường thông tin hợp đồng",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-contract-contract-attribute${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Cài đặt hợp đồng
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1 className="title-last">Danh sách trường thông tin bổ sung hợp đồng</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>
      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên trường thông tin"
          params={params}
          isSaveSearch={true}
          isFilter={true}
          listFilterItem={contractAttributeFilterList}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listContractAttribute && listContractAttribute.length > 0 ? (
          <BoxTable
            name="Trường thông tin hợp đồng"
            titles={titles}
            items={listContractAttribute}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            striped={true}
            isBulkAction={true}
            listIdChecked={listIdChecked}
            bulkActionItems={bulkActionList}
            setListIdChecked={(listId) => setListIdChecked(listId)}
            actions={actionsTable}
            actionType="inline"
          />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Fragment>
            {isPermissions ? (
              <SystemNotification type="no-permission" />
            ) : isNoItem ? (
              <SystemNotification
                description={
                  <span>
                    Hiện tại chưa định nghĩa trường thông tin hợp đồng nào. <br />
                    Hãy thêm mới trường thông tin hợp đồng đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới trường thông tin hợp đồng"
                action={() => {
                  setListContractAttribute(null);
                  setShowModalAdd(true);
                }}
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
      <AddContractAttributeModal
        onShow={showModalAdd}
        dataContractAttribute={dataContractAttribute}
        onHide={(reload) => {
          if (reload) {
            getListContractAttribute(params);
          }
          setShowModalAdd(false);
          setDataContractAttribute(null)
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
