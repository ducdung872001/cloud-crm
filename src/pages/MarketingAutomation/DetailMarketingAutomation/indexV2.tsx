import React, { Fragment, useState, useEffect, useRef, useContext, useMemo } from "react";
import _ from "lodash";
import moment from "moment";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
import { ICampaignFilterRequest } from "model/campaign/CampaignRequestModel";
import { ICampaignResponseModel } from "model/campaign/CampaignResponseModel";
import Icon from "components/icon";
import Image from "components/image";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { getSearchParameters, showToast } from "utils/common";
import CampaignService from "services/CampaignService";
import { getPageOffset } from "reborn-util";
import Badge from "components/badge/badge";
import "./index.scss";
import { CircularProgressbar } from "react-circular-progressbar";
import { ContextType, UserContext } from "contexts/userContext";
import MarketingAutomationService from "services/MarketingAutomationService";
import ModalProgressMA from "./partials/ModalProgressMA";
import { useEdgesState, useNodesState } from "reactflow";

export default function DetailMarketingAutomationV2() {
  document.title = "Danh sách Marketing Automation V2";

  const { id } = useParams();
  const navigate = useNavigate();
  const isMounted = useRef(false);
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [listCustomer, setListCustomer] = useState([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalProgress, setModalProgress] = useState(false);
  const [dataCustomer, setDataCustomer] = useState(null);
  const [maName, setMaName] = useState(null);

  const [params, setParams] = useState({
    keyword: "",
    maId: id,
    limit: 10,
    status: "-1",
    type: "",
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách khách hàng",
      is_active: true,
    },
  ]);
  const listApproach = [
    {
      value: "open_email",
      label: "Đã từng mở Email",
      color: "#9966CC",
    },
    {
      value: "success_sms",
      label: "Đã gửi SMS thành công",
      color: "#6A5ACD",
    },
    {
      value: "success_zalo",
      label: "Đã gửi Zalo thành công",
      color: "#007FFF",
    },
    {
      value: "none_action",
      label: "Chưa có hành động nào",
      color: "#ED6665",
    },
  ];

  useEffect(() => {
    if (dataBranch) {
      setParams((prevParams) => ({ ...prevParams, branchId: dataBranch.value }));
    }
  }, [dataBranch]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "khách hàng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListCustomer = async (paramsSearch: any) => {
    setIsLoading(true);

    let response = null;
    if (status === -1 || status === "none_action") {
      delete paramsSearch["type"];
      response = await MarketingAutomationService.listCustomer(paramsSearch, abortController.signal);
    } else {
      response = await MarketingAutomationService.listCustomerByType(paramsSearch, abortController.signal);
    }

    if (response.code == 0) {
      const result = response.result;
      setListCustomer(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && !params?.keyword && +result.page === 1) {
        setIsNoItem(true);
      }
    } else if (response.code == 400) {
      setIsPermissions(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    // setListCustomer([
    //     {
    //         name:'Trung nguyen',

    //     },
    //     {
    //         name:'Tung nguyen',

    //     },
    //     {
    //         name:'Dung Phan',

    //     }
    // ])
    setIsLoading(false);
  };

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);
    //! đoạn này bao giờ có chức năng lọc thì viết vào đây
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {
      getListCustomer(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
      //! đoạn này bao giờ có chức năng lọc thì viết vào đây
    }
    return () => {
      abortController.abort();
    };
  }, [params]);

  const titleActions: ITitleActions = {
    actions: [
      {
        title: "Quay lại",
        icon: <Icon name="ChevronLeft" />,
        callback: () => {
          // setShowModalAdd(true);
          navigate("/marketing_automation_v2");
        },
      },
    ],
  };

  const titles = ["STT", "Tên khách hàng", "Số điện thoại", "Email", "Điểm"];

  const dataFormat = ["text-center", "", "text-center", "", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    // <Link key={item.id} to={`/detail_marketing_automation/maId/${item.id}`} onClick={() => {}} className="detail-customer-marketing-automation">
    //     {item.name}
    // </Link>,
    item.name,
    item.phoneMasked,
    item.emailMasked,
    item.score,
  ];

  const actionsTable = (item: ICampaignResponseModel): IAction[] => {
    return [
      {
        title: "Xem chi tiết",
        icon: <Icon name="Eye" />,
        callback: () => {
          setModalProgress(true);
          setDataCustomer(item);
        },
      },
      // {
      //     title: "Sửa",
      //     icon: <Icon name="Pencil" />,
      //     callback: () => {
      //     //   setIdCampaign(item.id);
      //     //   // setShowModalAdd(true);
      //       navigate(`/edit_marketing_automation/${item.id}`);
      //     },
      // },
      // {
      //     title: "Xóa",
      //     icon: <Icon name="Trash" className="icon-error" />,
      //     callback: () => {
      //         showDialogConfirmDelete(item);
      //     },
      // },
    ];
  };

  const onDeleteAll = async () => {
    const arrayPromise = [];

    listIdChecked.map((item) => {
      const promise = new Promise((resolve, reject) => {
        MarketingAutomationService.deleteCustomer(item).then((res) => resolve(res));
      });

      arrayPromise.push(promise);
    });

    Promise.all(arrayPromise).then((result) => {
      if (result.length > 0) {
        showToast("Xoá khách hàng thành công", "success");
        getListCustomer(params);
        setListIdChecked([]);
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const onDelete = async (id: number) => {
    const response = await MarketingAutomationService.deleteCustomer(id);
    if (response.code === 0) {
      showToast("Xoá khách hàng thành công", "success");
      getListCustomer(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: ICampaignResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "khách hàng" : `${listIdChecked.length} khách hàng đã chọn`}
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
      title: "Xóa chương trình",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  const getDettailMA = async (maId?: number) => {
    const response = await MarketingAutomationService.detailMA(maId);

    if (response.code === 0) {
      const result = response.result;
      const configData = result?.configs;
      const nodeList = result?.nodes;
      let nodeData = [];
      let edgeData = [];

      setMaName(result.maName);

      if (nodeList && nodeList.length > 0) {
        nodeList.map((item) => {
          nodeData.push({
            id: `${item.id}`,
            type: "default",
            typeNode: item.typeNode,
            point: item.point,
            position: item.position,
            configData: item.configData,
            code: item.code,
            data: { label: `${item.name}` },
            height: 46,
            width: 150,
            style:
              item.typeNode === "condition"
                ? { border: "1px solid #E0E0E0", borderLeft: "3px solid #4169E1", borderRadius: 100 }
                : { border: "1px solid #E0E0E0", borderLeft: "3px solid #00CC33", borderRadius: 5 },
          });
        });
      }

      if (configData && configData.length > 0) {
        configData.map((item) => {
          edgeData.push({
            id: `reactflow__edge-${item.fromNodeId}-${item.toNodeId}`,
            source: `${item.fromNodeId}`,
            sourceHandle: null,
            target: `${item.toNodeId}`,
            targetHandle: null,
            markerEnd: { type: "arrowclosed" },
          });
        });
      }

      setEdges(edgeData);
      setNodes(nodeData);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (id) {
      getDettailMA(+id);
    }
  }, [id]);

  const [status, setStatus] = useState<any>(-1);
  const handlClickOptionStatus = (e, value) => {
    if (status === value) {
      setStatus(-1);
      setParams({ ...params, status: "-1", type: "" });
    } else {
      setStatus(value);
      let type = "";
      let status_param = "";
      if (value === "open_email") {
        type = "customer_email";
        status_param = "open";
      } else if (value === "success_sms") {
        type = "customer_sms";
        status_param = "success";
      } else if (value === "success_zalo") {
        type = "customer_zalo";
        status_param = "success";
      } else if (value === "none_action") {
        type = "";
        status_param = "none";
      }
      setParams({ ...params, status: status_param, type: type });
    }
  };
  return (
    <div className={`page-content page-customer-automation-marketing-list${isNoItem ? " bg-white" : ""}`}>
      {/* <TitleAction title="Danh sách khách hàng" titleActions={titleActions} /> */}
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              navigate("/marketing_automation_v2");
            }}
            className="title-first"
            title="Quay lại"
          >
            Danh sách Marketing Automation V2
          </h1>
          <Icon name="ChevronRight" />
          <h1 className="title-last">Danh sách khách hàng</h1>
        </div>
      </div>

      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              <li
                className={"active"}
                onClick={(e) => {
                  console.log("click");
                }}
              >
                {maName}
              </li>
            </ul>
          </div>
          <div className="list__relationship">
            {listApproach.map((item, idx) => {
              return item.label ? (
                <div
                  key={idx}
                  className={`relationship-item ${item.value === status ? "active__relationship--item" : ""}`}
                  style={{ backgroundColor: item.color, color: "white" }}
                  onClick={(e) => {
                    e && e.preventDefault();
                    handlClickOptionStatus(e, item.value);
                  }}
                >
                  {item.label}
                </div>
              ) : null;
            })}
          </div>
          <SearchBox
            name="Tên khách hàng"
            params={params}
            isSaveSearch={false}
            listSaveSearch={listSaveSearch}
            updateParams={(paramsNew) => setParams(paramsNew)}
          />
        </div>

        {!isLoading && listCustomer && listCustomer.length > 0 ? (
          <BoxTable
            name="Danh sách khách hàng"
            titles={titles}
            items={listCustomer}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            isBulkAction={true}
            bulkActionItems={bulkActionList}
            listIdChecked={listIdChecked}
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
                    Hiện tại chưa có khách hàng nào. <br />
                    {/* Hãy thêm mới  đầu tiên nhé! */}
                  </span>
                }
                type="no-item"
                //   titleButton="Thêm mới chương trình MA"
                action={() => {
                  // setShowModalAdd(true);
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

      <Dialog content={contentDialog} isOpen={showDialog} />

      <ModalProgressMA
        onShow={modalProgress}
        dataCustomer={dataCustomer}
        nodesData={nodes}
        edgesData={edges}
        maId={id}
        onHide={(reload) => {
          // if (reload) {
          //   onReload();
          // }
          setModalProgress(false);
          setDataCustomer(null);
        }}
      />
    </div>
  );
}
