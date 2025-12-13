import React, { Fragment, useEffect, useMemo, useRef, useState, useContext } from "react";
import _ from "lodash";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Icon from "components/icon";
import Badge from "components/badge/badge";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
import { IWarrantyFilterRequest } from "model/warranty/WarrantyRequestModel";
import { IWarrantyResponseModel } from "model/warranty/WarrantyResponseModel";
import { ContextType, UserContext } from "contexts/userContext";
import WarrantyService from "services/WarrantyService";
import { showToast } from "utils/common";
import { isDifferenceObj, getPageOffset } from "reborn-util";
import TableWarranty from "./partials/TableWarranty/TableWarranty";
import KanbanWarranty from "./partials/KanbanWarranty/KanbanWarranty";
import AddWarrantyModal from "./partials/AddEditWarrantyModal/AddWarrantyModal";
import AddTransferVotes from "pages/Common/AddTransferVotes";

import "tippy.js/animations/scale.css";
import "./WarrantyList.scss";

export default function WarrantyList() {
  document.title = "Tiếp nhận bảo hành";

  const isMounted = useRef(false);

  const navigate = useNavigate();

  const { isCollapsedSidebar, setIsCollapsedSidebar } = useContext(UserContext) as ContextType;

  const [searchParams, setSearchParams] = useSearchParams();
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [listWarranty, setListWarranty] = useState<IWarrantyResponseModel[]>([]);
  const [dataWarranty, setDataWarranty] = useState<IWarrantyResponseModel>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isService, setIsService] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [isRegimeKanban, setIsRegimeKanban] = useState<boolean>(false);

  const [params, setParams] = useState<IWarrantyFilterRequest>({
    phone: "",
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách bảo hành",
      is_active: true,
    },
  ]);

  const customerFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "departmentId",
        name: "Phòng ban",
        type: "select",
        is_featured: true,
        value: searchParams.get("departmentId") ?? "",
      },
      {
        key: "status",
        name: "Trạng thái",
        type: "select",
        is_featured: true,
        list: [
          {
            value: "-1",
            label: "Tất cả",
          },
          {
            value: "1",
            label: "Đang thực hiện",
          },
          {
            value: "2",
            label: "Đã hoàn thành",
          },
          {
            value: "3",
            label: "Đã hủy",
          },
        ],
        value: searchParams.get("status") ?? "",
      },
      {
        key: "time_buy",
        name: "Khoảng thời gian",
        type: "date-two",
        param_name: ["startDate", "endDate"],
        is_featured: true,
        value: searchParams.get("startDate") ?? "",
        value_extra: searchParams.get("endDate") ?? "",
        is_fmt_text: true,
      },
    ],
    [searchParams]
  );

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Phiếu bảo hành",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListWarranty = async (paramsSearch: IWarrantyFilterRequest) => {
    setIsLoading(true);

    const response = await WarrantyService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListWarranty(result.items);
      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
      if (+result.total === 0 && !params?.phone && +result.page === 1) {
        setIsNoItem(true);
      }
    } else if (response.code == 400) {
      setIsPermissions(true);
    } else {
      setIsService(true);
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
      getListWarranty(params);
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
    return () => {
      abortController.abort();
    };
  }, [params]);

  const titleActions: ITitleActions = {
    actions: [
      ...(isRegimeKanban
        ? [
            {
              title: "Quay lại",
              callback: () => {
                // hiển thị chế độ kanban
                setIsRegimeKanban(!isRegimeKanban);
              },
            },
          ]
        : [
            {
              title: "Thêm mới",
              callback: () => {
                setDataWarranty(null);
                setShowModalAdd(true);
              },
            },
            {
              title: "Kanban",
              callback: () => {
                setIsRegimeKanban(true);
              },
            },
          ]),
    ],
  };

  const titles = [
    "STT",
    "Mã phiếu",
    "Tên khách hàng",
    "Dịch vụ bảo hành",
    "Lí do bảo hành",
    "Ngày tiếp nhận",
    "Ngày dự kiến xong",
    "Bộ phận xử lý",
    "Trạng thái xử lý",
  ];
  const dataFormat = ["text-center", "text-center", "", "", "", "text-center", "text-center", "text-center", "text-center"];

  const dataSize = ["auto", "auto", "auto", "auto", "auto", 20, "auto", 16, "auto"];

  const dataMappingArray = (item: IWarrantyResponseModel, index: number) => [
    getPageOffset(params) + index + 1,
    item.code,
    <span
      key={item.id}
      style={{ cursor: "pointer" }}
      onClick={() => {
        navigate(`/detail_warranty/warrantyId/${item.id}`);
      }}
    >
      {item.customerName}
    </span>,
    item.serviceName,
    <span key={item.id} style={{ color: "#dc3545" }}>
      {item.reasonName}
    </span>,
    item.createdTime ? moment(item.createdTime).format("DD/MM/YYYY HH:mm") : "",
    item.endDate ? moment(item.endDate).format("DD/MM/YYYY HH:mm") : "",
    <div
      key={item.id}
      className="processing__department"
      style={item.departmentName || item.employeeName ? { border: "1.3px dashed var(--extra-color-50)" } : {}}
    >
      {item.departmentName && (
        <div className="name-item name-department">
          <Icon name="Meeting" />
          <span>{item.departmentName}</span>
        </div>
      )}
      {item.employeeName && (
        <div className="name-item name-employee">
          <Icon name="UserCircle" />
          <span>{item.employeeName}</span>
        </div>
      )}
    </div>,
    <Badge
      key={item.id}
      text={
        !item.status
          ? "Chưa thực hiện"
          : item.status === 1
          ? "Đang thực hiện"
          : item.status === 2
          ? "Đã hoàn thành"
          : item.status === 4
          ? "Tạm dừng"
          : "Đã hủy"
      }
      variant={!item.status ? "secondary" : item.status === 1 ? "primary" : item.status === 2 ? "success" : item.status === 4 ? "warning" : "error"}
    />,
  ];

  const [hasTransferVotes, setHasTransferVotes] = useState<boolean>(false);

  const handUpdateStatus = async (item, status) => {
    if (!item) return;

    const body = {
      id: item.id,
      status: status,
    };

    const response = await WarrantyService.updateStatus(body);

    if (response.code === 0) {
      showToast(`${status == 1 ? "Tiếp tục" : "Tạm dừng"} thành công`, "success");
      getListWarranty(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const handResetSignature = async (item) => {
    if (!item) return;

    const param = {
      objectId: item.id,
      objectType: 2,
    };

    const response = await WarrantyService.resetTransferVotes(param);

    if (response.code === 0 && response.result > 0) {
      showToast(`Trình lại duyệt phiếu thành công`, "success");
      getListWarranty(params);

      setTimeout(() => {
        setHasTransferVotes(true);
      }, 300);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmStatus = async (item?, status?: "pending" | "play" | "inital") => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-warning",
      isCentered: true,
      isLoading: true,
      title: <Fragment>{`${status == "play" ? "Tiếp tục" : status == "inital" ? "Duyệt lại" : "Tạm dừng"} duyệt phiếu...`}</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn {status == "play" ? "tiếp tục" : status == "inital" ? "trình lại" : "tạm dừng"} duyệt phiếu{" "}
          {item ? "hỗ trợ " : `${listIdChecked.length} hỗ trợ đã chọn`}
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        if (status == "play") {
          handUpdateStatus(item, 1);
        } else if (status == "pending") {
          handUpdateStatus(item, 4);
        } else {
          handResetSignature(item);
        }
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const actionsTable = (item: IWarrantyResponseModel) => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      ...(!item.status
        ? [
            {
              title: "Chuyển phiếu",
              icon: <Icon name="FingerTouch" className={isCheckedItem ?"icon-disabled": "icon-warning"} />,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                setDataWarranty(item);
                setHasTransferVotes(true);
                }
              },
            },
          ]
        : []),
      {
        title: "Xem chi tiết",
        icon: <Icon name="Eye" className={isCheckedItem ? "icon-disabled" : ""} />,
        disabled: isCheckedItem,
        callback: () => {
          if (!isCheckedItem) {
          navigate(`/detail_warranty/warrantyId/${item.id}`);
          }
        },
      },
      ...(!item.status
        ? [
            {
              title: "Sửa",
              icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""} />,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                setDataWarranty(item);
                setShowModalAdd(true);
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
          ]
        : []),
      ...(item.status === 1
        ? [
            {
              title: "Tạm dừng duyệt phiếu",
              icon: <Icon name="WarningCircle" className={isCheckedItem ?"icon-disabled": "icon-warning"} />,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                showDialogConfirmStatus(item, "pending");
                }
              },
            },
          ]
        : []),
      ...(item.status === 4
        ? [
            {
              title: "Tiếp tục duyệt phiếu",
              icon: <Icon name="InfoCircle" className={isCheckedItem?"icon-disabled" : "icon-success"} />,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                showDialogConfirmStatus(item, "play");
                }
              },
            },
            {
              title: "Duyệt phiếu lại",
              icon: <Icon name="FingerTouch" className={isCheckedItem ?"icon-disabled": "icon-warning"} />,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                showDialogConfirmStatus(item, "inital");
                }
              },
            },
          ]
        : []),
    ];
  };

  //! đoạn này xử lý vấn đề vấn vào chữ F trên bàn phím
  //? thì sẽ tự động đóng hoặc mở chế độ toàn màn hình
  const handleHideShowFullPage = (e) => {
    if (e.key === "f" || e.keyCode === 70) {
      setIsCollapsedSidebar(!isCollapsedSidebar);
      if (!isCollapsedSidebar) {
        showToast("Thoát khỏi chế độ toàn màn hình ấn phím (f)", "success");
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleHideShowFullPage);

    //! đoạn này mục đích xóa sự kiện khi component unmount
    return () => window.removeEventListener("keydown", handleHideShowFullPage);
  }, [isCollapsedSidebar]);

  const onDelete = async (id: number) => {
    const response = await WarrantyService.delete(id);

    if (response.code === 0) {
      showToast("Xóa bảo hành thành công", "success");
      getListWarranty(params);
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
      const found = listWarranty.find((item) => item.id === selectedId);
      if (found?.id) {
        return WarrantyService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} bảo hành`, "success");
        getListWarranty(params);
        setListIdChecked([]);
      } else {
        showToast("Không có bảo hành nào được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

  const showDialogConfirmDelete = (item?: IWarrantyResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "phiếu bảo hành cho khách hàng " : `${listIdChecked.length} phiếu bảo hành cho khách hàng đã chọn`}
          {item ? <strong>{item.customerName}</strong> : ""}? Thao tác này không thể khôi phục.
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
      title: "Xóa phiếu bảo hành",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-warranty${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Tiếp nhận bảo hành" titleActions={titleActions} />
      <div className="card-box d-flex flex-column">
        <div className={`${isRegimeKanban ? "d-none" : ""}`}>
          <div
            className="option-improve"
            onClick={(e) => {
              e.preventDefault();
              setIsCollapsedSidebar(!isCollapsedSidebar);
            }}
          >
            {isCollapsedSidebar ? (
              <Tippy content="Thoát khỏi chế độ toàn màn hình (f)" placement="left" delay={[120, 100]} animation="scale">
                <span className="icon-item">
                  <Icon name="FullscreenExit" />
                </span>
              </Tippy>
            ) : (
              <Tippy content="Toàn màn hình (f)" delay={[120, 100]} placement="left" animation="scale">
                <span className="icon-item">
                  <Icon name="Fullscreen" />
                </span>
              </Tippy>
            )}
          </div>
          <TableWarranty
            params={params}
            setParams={setParams}
            listSaveSearch={listSaveSearch}
            customerFilterList={customerFilterList}
            titles={titles}
            listWarranty={listWarranty}
            pagination={pagination}
            dataMappingArray={dataMappingArray}
            dataFormat={dataFormat}
            listIdChecked={listIdChecked}
            setListIdChecked={setListIdChecked}
            bulkActionList={bulkActionList}
            actionsTable={actionsTable}
            isLoading={isLoading}
            isNoItem={isNoItem}
            setDataWarranty={setDataWarranty}
            setShowModalAdd={showModalAdd}
            isPermissions={isPermissions}
            isService={isService}
            dataSize={dataSize}
          />
        </div>
        <div className={`${isRegimeKanban ? "" : "d-none"}`}>
          <KanbanWarranty data={listWarranty} />
        </div>
      </div>
      <AddWarrantyModal
        onShow={showModalAdd}
        data={dataWarranty}
        onHide={(reload) => {
          if (reload) {
            getListWarranty(params);
          }
          setShowModalAdd(false);
        }}
      />
      <AddTransferVotes
        onShow={hasTransferVotes}
        onHide={(reload) => {
          if (reload) {
            getListWarranty(params);
          }

          setHasTransferVotes(false);
        }}
        dataProps={{
          objectId: dataWarranty?.id,
          objectType: 2,
        }}
        type="warranty"
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
