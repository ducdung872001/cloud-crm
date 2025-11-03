import React, { Fragment, useState, useEffect, useRef, useMemo } from "react";
import _ from "lodash";
import { useSearchParams } from "react-router-dom";
import Icon from "components/icon";
import Image from "components/image";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
import { IServiceListProps } from "model/service/PropsModel";
import { useWindowDimensions } from "utils/hookCustom";
import { IServiceFilterRequest } from "model/service/ServiceRequestModel";
import { IServiceRespone } from "model/service/ServiceResponseModel";
import { showToast } from "utils/common";
import { formatCurrency, isDifferenceObj, getPageOffset } from "reborn-util";
import { getPermissions } from "utils/common";
import ServiceService from "services/ServiceService";
import CategoryServiceService from "services/CategoryServiceService";
import TableService from "./partials/TableService/TableService";
import AddServiceModal from "./partials/AddServiceModal";
import PomModal from "./partials/PomModal";
import CustomerCharacteristics from "pages/Common/CustomerCharacteristics";

import "./ServiceList.scss";
import PermissionService from "services/PermissionService";
import ConfigIntegrateModal from "../Product/ConfigIntegrateModal/ConfigIntegrateModal";
import DetailServiceModal from "./partials/DetailService/DetailServiceModal";

export default function ServiceList(props: IServiceListProps) {
  document.title = "Danh sách dịch vụ";

  const { onBackProps } = props;

  const isMounted = useRef(false);
  const targetBsnId_service = localStorage.getItem("targetBsnId_service");

  const [searchParams, setSearchParams] = useSearchParams();

  const [listService, setListService] = useState<IServiceRespone[]>([]);
  const [dataService, setDataService] = useState<IServiceRespone>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isAddEditService, setIsAddEditService] = useState<boolean>(false);

  const [showModalPom, setShowModalPom] = useState<boolean>(false);
  const [infoService, setInfoService] = useState(null);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState("tab_one");
  const [listPartner, setListPartner] = useState([]);
  const [targetBsnId, setTargetBsnId] = useState(targetBsnId_service ? +targetBsnId_service : null);
  const [showModalConfig, setShowModalConfig] = useState<boolean>(false);
  const [showModalDetail, setShowModalDetail] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem("targetBsnId_service", JSON.stringify(targetBsnId));
  }, [targetBsnId]);

  const [params, setParams] = useState<IServiceFilterRequest>({ name: "", limit: 10 });

  const [paramsServicePartner, setParamsServicePartner] = useState({
    name: "",
    limit: 10,
    page: 1,
    targetBsnId: null,
  });

  const listTabs = [
    {
      title: "Danh sách dịch vụ",
      is_active: "tab_one",
    },
    {
      title: "Danh sách dịch vụ của đối tác",
      is_active: "tab_two",
    },
  ];

  const [permissions, setPermissions] = useState(getPermissions());

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách dịch vụ",
      is_active: true,
    },
  ]);

  const colorData = [
    "#E98E4C",
    "#ED6665",
    "#FFBF00",
    "#9966CC",
    "#6A5ACD",
    "#007FFF",
    "#993300",
    "#F0DC82",
    "#CC5500",
    "#C41E3A",
    "#ACE1AF",
    "#7FFF00",
    "#FF7F50",
    "#BEBEBE",
    "#FF00FF",
    "#C3CDE6",
    "#FFFF00",
    "#40826D",
    "#704214",
  ];

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Dịch vụ",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const [paginationPartner, setPaginationPartner] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Dịch vụ",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParamsServicePartner((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParamsServicePartner((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const [lstCategoryService, setLstCategoryService] = useState([]);

  const handLstCategoryService = async () => {
    const response = await CategoryServiceService.list({ limit: 10000 });

    if (response.code === 0) {
      const result = (response.result?.items || []).map((item) => {
        return {
          value: item.id,
          label: item.name,
        };
      });

      setLstCategoryService(result);
    }
  };

  useEffect(() => {
    handLstCategoryService();
  }, []);

  const customerFilterList = useMemo(
    () =>
      [
        {
          key: "categoryId",
          name: "Danh mục dịch vụ",
          type: "select",
          list: lstCategoryService,
          is_featured: true,
          value: "",
          is_render: true,
        },
      ] as IFilterItem[],
    [lstCategoryService]
  );

  const abortController = new AbortController();

  const getListService = async (paramsSearch: any, tab) => {
    setIsLoading(true);

    let response = null;

    if (tab === "tab_one") {
      response = await ServiceService.filter(paramsSearch, abortController.signal);
    } else {
      if (!paramsSearch.targetBsnId) {
        setListService([]);
        setIsLoading(false);
        setIsNoItem(true);
        return;
      } else {
        response = await ServiceService.listShared(paramsSearch, abortController.signal);
      }
    }

    if (response.code === 0) {
      const result = response.result;
      setListService(result.items);

      if (tab === "tab_one") {
        setPagination({
          ...pagination,
          page: +result.page,
          sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
          totalItem: +result.total,
          totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
        });
      } else {
        setPaginationPartner({
          ...paginationPartner,
          page: +result.page,
          sizeLimit: paramsServicePartner.limit ?? DataPaginationDefault.sizeLimit,
          totalItem: +result.total,
          totalPage: Math.ceil(+result.total / +(paramsServicePartner.limit ?? DataPaginationDefault.sizeLimit)),
        });
      }

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
      if (tab === "tab_one") {
        getListService(params, tab);
      }

      const paramsTemp = _.cloneDeep(params);

      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }

      Object.keys(paramsTemp).map((key) => {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });

      if (isDifferenceObj(searchParams, paramsTemp)) {
        if (paramsTemp.page === 1) {
          delete paramsTemp["page"];
        }
        setSearchParams(paramsTemp as Record<string, string | string[]>);
      }
    }
    return () => {
      abortController.abort();
    };
  }, [params, tab]);

  const getListPartner = async () => {
    const params = {
      limit: 100,
      status: 1,
      requestCode: "service",
    };

    const response = await PermissionService.requestPermissionSource(params);

    if (response.code === 0) {
      const result = response.result.items || [];
      const newList = [];
      result.map((item, index) => {
        if (newList.filter((el) => el.targetBsnId === item.targetBsnId).length === 0) {
          newList.push({
            name: item.targetBranchName,
            targetBsnId: item.targetBsnId,
            color: colorData[index],
          });
        }
      });

      setListPartner(newList);
    } else {
      // showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    getListPartner();
  }, []);

  const titleActions: ITitleActions = {
    actions: [
      ...(isAddEditService
        ? [
            {
              title: "Quay lại",
              callback: () => {
                setIsAddEditService(false);
              },
            },
          ]
        : [
            ...(tab === "tab_one"
              ? [
                  permissions["SERVICE_ADD"] == 1 && {
                    title: "Thêm mới",
                    callback: () => {
                      setDataService(null);
                      setIsAddEditService(!isAddEditService);
                    },
                  },
                ]
              : []),
          ]),
    ].filter((action) => action),
  };

  const titles = ["STT", "Tên dịch vụ", "Mã dịch vụ", "Ảnh dịch vụ", "Giá gốc", "Giá ưu đãi", "Vật tư tiêu hao"];

  const dataFormat = ["text-center", "", "text-center", "text-center", "text-right", "text-right", "text-center"];

  const dataMappingArray = (item: IServiceRespone, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.code,
    <a key={item.id} data-fancybox="gallery" href={item.avatar}>
      <Image src={item.avatar} alt={item.name} width={"64rem"} />
    </a>,
    formatCurrency(item.price),
    formatCurrency(item.discount),
    <a
      key={item.id}
      onClick={(e) => {
        e && e.preventDefault();
        setInfoService({ idService: item.id, nameService: item.name });
        setShowModalPom(true);
      }}
    >
      Xem thêm
    </a>,
  ];

  const actionsTable = (item: IServiceRespone): IAction[] => {
    return [
      ...(tab === "tab_one"
        ? [
            {
              title: "Đặc trưng khách hàng",
              icon: <Icon name="Tag" style={{ width: 18 }} />,
              callback: () => {
                setDataService(item);
                setShowModalConfig(true);
              },
            },
            {
              title: "Chi tiết dịch vụ",
              icon: <Icon name="CollectInfo" style={{ width: 17 }} />,
              callback: () => {
                setDataService(item);
                setShowModalDetail(true);
              },
            },
            permissions["SERVICE_UPDATE"] == 1 && {
              title: "Sửa",
              icon: <Icon name="Pencil" />,
              callback: () => {
                setDataService(item);
                setIsAddEditService(!isAddEditService);
              },
            },
            permissions["SERVICE_DELETE"] == 1 && {
              title: "Xóa",
              icon: <Icon name="Trash" className="icon-error" />,
              callback: () => {
                showDialogConfirmDelete(item);
              },
            },
          ]
        : []),
    ].filter((action) => action);
  };

  const onDelete = async (id: number) => {
    const response = await ServiceService.delete(id);

    if (response.code === 0) {
      showToast("Xóa dịch vụ thành công", "success");
      getListService(params, tab);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IServiceRespone) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "dịch vụ " : `${listIdChecked.length} dịch vụ đã chọn`}
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
    permissions["SERVICE_DELETE"] == 1 && {
      title: "Xóa dịch vụ",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  const handlClickPartner = (e, value) => {
    setTargetBsnId(value);
  };

  useEffect(() => {
    if (listPartner && listPartner.length > 0) {
      setParamsServicePartner({ ...paramsServicePartner, targetBsnId: targetBsnId ? targetBsnId : listPartner[0].targetBsnId });

      if (!targetBsnId) {
        setTargetBsnId(listPartner[0].targetBsnId);
      }
    }
  }, [targetBsnId, listPartner]);

  useEffect(() => {
    if (tab === "tab_two") {
      getListService(paramsServicePartner, tab);
    }
  }, [paramsServicePartner, tab, listPartner]);

  const [isConfigIntegrateModal, setIsConfigIntegrateModal] = useState(false);

  return (
    <div className={`page-content page-service${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              onBackProps(true);
            }}
            className={`title-first ${isAddEditService && width <= 768 ? "d-none" : ""}`}
            title="Quay lại"
          >
            Cài đặt bán hàng
          </h1>
          <Icon
            name="ChevronRight"
            className={`${isAddEditService && width <= 768 ? "d-none" : ""}`}
            onClick={() => {
              onBackProps(true);
            }}
          />
          <h1
            title={`${isAddEditService ? "Quay lại" : ""}`}
            className={`title-last ${isAddEditService ? "active" : ""}`}
            onClick={() => {
              setIsAddEditService(false);
            }}
          >
            Danh sách dịch vụ
          </h1>
          {isAddEditService && (
            <Fragment>
              <Icon
                name="ChevronRight"
                onClick={() => {
                  setIsAddEditService(false);
                }}
              />
              <h1 className="title-last">{dataService ? "Chỉnh sửa" : "Thêm mới"} dịch vụ</h1>
            </Fragment>
          )}
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box d-flex flex-column" style={tab === "tab_one" ? {} : { marginTop: "2rem" }}>
        {isAddEditService ? (
          <AddServiceModal
            onShow={isAddEditService}
            data={dataService}
            onHide={(reload) => {
              if (reload) {
                getListService(params, tab);
              }
              setIsAddEditService(false);
            }}
          />
        ) : (
          <TableService
            params={params}
            setParams={setParams}
            listSaveSearch={listSaveSearch}
            customerFilterList={customerFilterList}
            titles={titles}
            listService={listService}
            pagination={pagination}
            dataMappingArray={dataMappingArray}
            dataFormat={dataFormat}
            listIdChecked={listIdChecked}
            setListIdChecked={setListIdChecked}
            bulkActionList={bulkActionList}
            actionsTable={actionsTable}
            isLoading={isLoading}
            isNoItem={isNoItem}
            setDataService={setDataService}
            isPermissions={isPermissions}
            tab={tab}
            targetBsnId={targetBsnId}
            setTab={setTab}
            listTabs={listTabs}
            paginationPartner={paginationPartner}
            listPartner={listPartner}
            handlClickPartner={handlClickPartner}
            paramsServicePartner={paramsServicePartner}
            setParamsServicePartner={setParamsServicePartner}
            setIsConfigIntegrateModal={setIsConfigIntegrateModal}
          />
        )}
      </div>

      <PomModal
        infoService={infoService}
        onShow={showModalPom}
        onHide={(reload) => {
          if (reload) {
            getListService(params, tab);
          }

          setShowModalPom(false);
        }}
      />

      <CustomerCharacteristics
        onShow={showModalConfig}
        data={dataService?.id}
        typeProps="service"
        onHide={(reload) => {
          if (reload) {
            // nếu có thì làm gì đó ở đây
          }

          setShowModalConfig(false);
        }}
      />
      <ConfigIntegrateModal
        onShow={isConfigIntegrateModal}
        type="service"
        onHide={(reload) => {
          if (reload) {
            // setShowModalSetingFS(true);
          }

          setIsConfigIntegrateModal(false);
        }}
      />
      <DetailServiceModal
        onShow={showModalDetail}
        data={dataService}
        onHide={(reload) => {
          if (reload) {
            getListService(params, tab);
          }
          setShowModalDetail(false);
          setDataService(null);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
