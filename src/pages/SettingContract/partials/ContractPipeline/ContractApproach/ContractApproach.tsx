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
import { IContractPipelineFilterRequest } from "model/contractPipeline/ContractPipelineRequestModel";
import { IContractApproachResponse } from "model/contractApproach/ContractApproachResponseModel";
import { showToast } from "utils/common";
import { getPageOffset } from "reborn-util";
import { getPermissions } from "utils/common";
import "./ContractApproach.scss";
import ContractApproachService from "services/ContractApproachService";
import Button from "components/button/button";
import AddContractApproachModal from "./partials/AddContractApproach";
import ModalSettingActionApproach from "./ModalSettingAction/ModalSettingAction";

export default function ContractApproachList(props: any) {
  document.title = "Quy trình hợp đồng";

  const { dataContractPipeline } = props;

  const isMounted = useRef(false);

  const [listContractApproach, setListContractApproach] = useState([]);
  const [dataContractApproach, setDataContractApproach] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAddApproach, setShowModalAddApproach] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());

  const [params, setParams] = useState({
    name: "",
    limit: 10,
  });

  useEffect(() => {
    setParams((prevParams) => ({ ...prevParams, pipelineId: dataContractPipeline.id }));
  }, [dataContractPipeline]);

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Quy trình hợp đồng",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "quy trình hợp đồng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListContractApproach = async (paramsSearch: IContractPipelineFilterRequest) => {
    setIsLoading(true);

    const response = await ContractApproachService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListContractApproach(result.items);

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
      getListContractApproach(params);
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
          setDataContractApproach(null);
          setShowModalAddApproach(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên quy trình", "Bước quy trình", "Hành động"];

  const dataFormat = ["text-center", "", "text-center", "text-center", "text-center"];

  const dataMappingArray = (item: IContractApproachResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.step,
    <a
      key={item.id}
      onClick={(e) => {
        e && e.preventDefault();
        setApproachData(item);
        setModalSettingAction(true);
      }}
    >
      Cài đặt
    </a>,
  ];

  const actionsTable = (item: IContractApproachResponse): IAction[] => {
    return [
      permissions["CONTRACT_UPDATE"] == 1 && {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataContractApproach(item);
          setShowModalAddApproach(true);
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
    const response = await ContractApproachService.delete(id);

    if (response.code === 0) {
      showToast("Xóa quy tình hợp đồng thành công", "success");
      getListContractApproach(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IContractApproachResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "quy trìh hợp đồng " : `${listIdChecked.length} loại hợp đồng đã chọn`}
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
      title: "Xóa quy trình hợp đồng",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  //Cài đặt hành động
  const [modalSettingAction, setModalSettingAction] = useState(false);
  const [approachData, setApproachData] = useState(null);

  //Cài đặt SLA
  const [modalSettingSLA, setModalSettingSLA] = useState(false);
  const [dataApproach, setDataApproach] = useState(null);

  return (
    <div className={`page-content page-contract-approach${isNoItem ? " bg-white" : ""}`}>
      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              <li className={"active"} onClick={(e) => {}}>
                {"Quy trình hợp đồng"}
              </li>
            </ul>
            <div style={{ marginRight: "2rem" }}>
              <Button
                // type="submit"
                color="primary"
                // disabled={}
                onClick={() => {
                  setDataContractApproach(null);
                  setShowModalAddApproach(true);
                }}
              >
                Thêm mới
              </Button>
            </div>
          </div>
          <SearchBox
            name="Tên quy trình hợp đồng"
            params={params}
            // isSaveSearch={true}
            // listSaveSearch={listSaveSearch}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />
        </div>

        {!isLoading && listContractApproach && listContractApproach.length > 0 ? (
          <BoxTable
            name="quy trình hợp đồng"
            titles={titles}
            items={listContractApproach}
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
                    Hiện tại chưa có quy trình hợp đồng nào. <br />
                    Hãy thêm mới quy trình hợp đồng đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới quy trình hợp đồng"
                action={() => {
                  setDataContractApproach(null);
                  setShowModalAddApproach(true);
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

      <AddContractApproachModal
        onShow={showModalAddApproach}
        data={dataContractApproach}
        listContractApproach={listContractApproach}
        dataContractPipeline={dataContractPipeline}
        onHide={(reload) => {
          if (reload) {
            getListContractApproach(params);
          }
          setShowModalAddApproach(false);
        }}
      />

      <ModalSettingActionApproach
        onShow={modalSettingAction}
        approachData={approachData}
        onHide={(reload) => {
          if (reload) {
            // loadCampaignApproaches(campaignId);
          }
          setModalSettingAction(false);
          setApproachData(null);
        }}
      />

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
