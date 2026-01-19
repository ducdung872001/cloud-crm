import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, ISaveSearch } from "model/OtherModel";
import { IContractPipelineResponse } from "model/contractPipeline/ContractPipelineResponseModel";
import { showToast } from "utils/common";
import { getPageOffset } from "reborn-util";
import { getPermissions } from "utils/common";
import "./CompetencyGuarantee.scss";
import ContractGuaranteeService from "services/ContractGuaranteeService";
import AddCompetencyGuarantee from "./partials/AddCompetencyGuarantee";

export default function CompetencyGuaranteeList(props: any) {
  document.title = "Danh mục nghiệp vụ bảo lãnh";

  const { onBackProps } = props;

  const isMounted = useRef(false);

  const [listCompetencyGuarantee, setListCompetencyGuarantee] = useState([]);
  const [dataCompetencyGuarantee, setDataCompetencyGuarantee] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAddCompetency, setShowModalAddCompetency] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());

  const [params, setParams] = useState({
    name: "",
    limit: 10,
    page: 1
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh mục nghiệp vụ bảo lãnh",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "nghiệp vụ bảo lãnh",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListCompetencyGuarantee = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await ContractGuaranteeService.competencyGuaranteeList(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListCompetencyGuarantee(result.items);

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
        getListCompetencyGuarantee(params);
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
    {
        title: "Thêm mới",
        callback: () => {
          setDataCompetencyGuarantee(null);
          setShowModalAddCompetency(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên nghiệp vụ bảo lãnh", "Thứ tự"];

  const dataFormat = ["text-center", "", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.name, 
    item.position,
  ];

  const actionsTable = (item: any): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""}/>,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          setDataCompetencyGuarantee(item);
          setShowModalAddCompetency(true);
          }
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className={isCheckedItem ? "icon-disabled" : "icon-error"} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          showDialogConfirmDelete(item);
          }
        },
      },
    ].filter((action) => action);
  };

  const onDelete = async (id: number) => {
    const response = await ContractGuaranteeService.competencyGuaranteeDelete(id);

    if (response.code === 0) {
      showToast("Xóa nghiệp vụ bảo lãnh thành công", "success");
      getListCompetencyGuarantee(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAll = () => {
    const selectedIds = listIdChecked || [];
    if (!selectedIds.length) return;

    const arrPromises = selectedIds.map((selectedId) => {
      const found = listCompetencyGuarantee.find((item) => item.id === selectedId);
      if (found?.id) {
        return ContractGuaranteeService.competencyGuaranteeDelete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} nghiệp vụ bảo lãnh`, "success");
        getListCompetencyGuarantee(params);
        setListIdChecked([]);
      } else {
        showToast("Không có nghiệp vụ bảo lãnh nào được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

  const showDialogConfirmDelete = (item?: IContractPipelineResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "nghiệp vụ bảo lãnh " : `${listIdChecked.length} nghiệp vụ bảo lãnh đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => {
        if (item?.id) {
          onDelete(item.id);
          return;
        }
        if (listIdChecked.length>0) {
          onDeleteAll();
          return;
        }
      }
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa nghiệp vụ bảo lãnh",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-competency-guarantee${isNoItem ? " bg-white" : ""}`}>
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
          <h1 className="title-last">Danh mục nghiệp vụ bảo lãnh</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>
      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên danh mục"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listCompetencyGuarantee && listCompetencyGuarantee.length > 0 ? (
          <BoxTable
            name="Nghiệp vụ bảo lãnh"
            titles={titles}
            items={listCompetencyGuarantee}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            listIdChecked={listIdChecked}
            isBulkAction={true}
            bulkActionItems={bulkActionList}
            striped={true}
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
                    Hiện tại chưa có nghiệp vụ bảo lãnh nào. <br />
                    Hãy thêm mới nghiệp vụ bảo lãnh đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới nghiệp vụ bảo lãnh"
                action={() => {
                  setDataCompetencyGuarantee(null);
                  setShowModalAddCompetency(true);
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
      <AddCompetencyGuarantee
        onShow={showModalAddCompetency}
        data={dataCompetencyGuarantee}
        onHide={(reload) => {
          if (reload) {
            getListCompetencyGuarantee(params);
          }
          setShowModalAddCompetency(false);
        }}
      />
     
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
