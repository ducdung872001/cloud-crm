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
import "./SettingEform.scss";
import Button from "components/button/button";
import ContractEformService from "services/ContractEformService";
import ModalSelectAtribute from "./ModalSelectAttribute/ModalSelectAttribute";
// import AddContractApproachModal from "./partials/AddContractApproach";
// import ModalSettingActionApproach from "./ModalSettingAction/ModalSettingAction";

export default function SettingEform(props: any) {
  document.title = "Danh sách trường thông tin biểu mẫu";

  const { dataContractEform, setIsPreviewEform } = props;

  const isMounted = useRef(false);

  const [listEformAttribute, setListEformAttribute] = useState([]);
  const [dataEformAttribute, setDataEformAttribute] = useState(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAddAttribute, setShowModalAddAttribute] = useState<boolean>(false);
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
    setParams((prevParams) => ({ ...prevParams, eformId: dataContractEform.id }));
  }, [dataContractEform]);

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách trường thông tin biểu mẫu",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "trường thông tin",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListEformAttribute = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await ContractEformService.listEformExtraInfo(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListEformAttribute(result);

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
      getListEformAttribute(params);
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
          setDataEformAttribute(null);
          setShowModalAddAttribute(true);
        },
      },
    ],
  };

  const titles = ["STT", "Tên trường", "Kiểu dữ liệu"];

  const dataFormat = ["text-center", "", "", "text-center", ""];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.datatype || "text",
    // item.parentName
  ];

  const actionsTable = (item: IContractPipelineResponse): IAction[] => {
    return [
      //   permissions["CONTRACT_UPDATE"] == 1 && {
      //     title: "Sửa",
      //     icon: <Icon name="Pencil" />,
      //     callback: () => {
      //       setDataEformAttribute(item);
      //       setShowModalAddAttribute(true);
      //     },
      //   },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ].filter((action) => action);
  };

  const onDelete = async (id: number) => {
    const response = await ContractEformService.deleteEformExtraInfo(id);

    if (response.code === 0) {
      showToast("Xóa trường thông tin thành công", "success");
      getListEformAttribute(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAll = async () => {
    const arrayPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        ContractEformService.deleteEformExtraInfo(item).then((res) => resolve(res));
      });

      arrayPromise.push(promise);
    });

    Promise.all(arrayPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xóa trường thông tin thành công", "success");
        getListEformAttribute(params);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const showDialogConfirmDelete = (item?: IContractPipelineResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "trường" : `${listIdChecked.length} trường đã chọn`}
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
        if (listIdChecked.length > 0) {
          onDeleteAll();
        } else {
          onDelete(item.id);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: "Xóa trường",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-setting-eform${isNoItem ? " bg-white" : ""}`}>
      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              <li className={"active"} onClick={(e) => {}}>
                {"Danh sách trường thông tin biểu mẫu"}
              </li>
            </ul>
            <div style={{ marginRight: "2rem", display: "flex" }}>
              <div style={{ marginRight: 10 }}>
                <Button
                  // type="submit"
                  color="primary"
                  // disabled={}
                  onClick={() => {
                    setIsPreviewEform(true);
                  }}
                >
                  Xem biểu mẫu
                </Button>
              </div>

              <div>
                <Button
                  // type="submit"
                  color="primary"
                  // disabled={}
                  onClick={() => {
                    setDataEformAttribute(null);
                    setShowModalAddAttribute(true);
                  }}
                >
                  Thêm trường
                </Button>
              </div>
            </div>
          </div>
          <SearchBox
            name="Tên trường"
            params={params}
            // isSaveSearch={true}
            // listSaveSearch={listSaveSearch}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />
        </div>

        {!isLoading && listEformAttribute && listEformAttribute.length > 0 ? (
          <BoxTable
            name="Trường thông tin"
            titles={titles}
            items={listEformAttribute}
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
            <SystemNotification
              description={
                <span>
                  Hiện tại chưa có trường thông tin nào. <br />
                  Hãy thêm mới trường thông tin đầu tiên nhé!
                </span>
              }
              type="no-item"
              titleButton="Thêm mới trường thông tin"
              action={() => {
                setDataEformAttribute(null);
                setShowModalAddAttribute(true);
              }}
            />
          </Fragment>
        )}
      </div>

      <ModalSelectAtribute
        onShow={showModalAddAttribute}
        dataContractEform={dataContractEform}
        //   data={dataContractApproach}
        onHide={(reload) => {
          if (reload) {
            getListEformAttribute(params);
          }
          setShowModalAddAttribute(false);
        }}
      />

      {/* <ModalSettingActionApproach
            onShow={modalSettingAction}
            approachData={approachData}
            onHide={(reload) => {
            if (reload) {
                // loadCampaignApproaches(campaignId);
            }
                setModalSettingAction(false);
                setApproachData(null);
            }}
        /> */}

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
