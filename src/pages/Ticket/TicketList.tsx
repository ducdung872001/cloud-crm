import React, { Fragment, useEffect, useMemo, useRef, useState, useContext } from "react";
import _ from "lodash";
import moment from "moment";
import Tippy from "@tippyjs/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "components/icon";
import Badge from "components/badge/badge";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, IFilterItem, ISaveSearch } from "model/OtherModel";
import { ITicketFilterRequest } from "model/ticket/TicketRequestModel";
import { ITicketResponseModel } from "model/ticket/TicketResponseModel";
import { ContextType, UserContext } from "contexts/userContext";
import { showToast } from "utils/common";
import { isDifferenceObj, getPageOffset } from "reborn-util";
import TicketService from "services/TicketService";
import AddTicketModal from "./partials/AddEditTicketModal/AddTicketModal";
import TableTicket from "./partials/TableTicket/TableTicket";
import KanbanTicket from"./partials/KanbanTicket/KanbanTicket";
import AddTransferVotes from "pages/Common/AddTransferVotes";

import "tippy.js/animations/scale.css";
import "./TicketList.scss";

export default function TicketList() {
  document.title = "Tiếp nhận hỗ trợ";

  const isMounted = useRef(false);

  const navigate = useNavigate();

  const { isCollapsedSidebar, setIsCollapsedSidebar } = useContext(UserContext) as ContextType;

  const [searchParams, setSearchParams] = useSearchParams();
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [listTicket, setListTicket] = useState<ITicketResponseModel[]>([]);
  const [dataTicket, setDataTicket] = useState<ITicketResponseModel>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isService, setIsService] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);

  const [isRegimeKanban, setIsRegimeKanban] = useState<boolean>(false);

  const [params, setParams] = useState<ITicketFilterRequest>({
    phone: "",
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách hỗ trợ",
      is_active: true,
    },
  ]);

  const customerFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "supportId",
        name: "Quy trình hỗ trợ",
        type: "select",
        is_featured: true,
        params: { type: 1 },
        value: searchParams.get("supportId") ?? "",
      },
      {
        key: "ticketCategoryId",
        name: "Loại hỗ trợ",
        type: "select",
        is_featured: true,
        value: searchParams.get("ticketCategoryId") ?? "",
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
            value: "0",
            label: "Chưa thực hiện",
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
    name: "Hỗ trợ",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListTicket = async (paramsSearch: ITicketFilterRequest) => {
    setIsLoading(true);

    const response = await TicketService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListTicket(result.items);
      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
      if (+result.total === 0 && !params?.name && +result.page === 1) {
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
      getListTicket(params);
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
                setDataTicket(null);
                setShowModalAdd(true);
              },
            },
            // {
            //   title: "Kanban",
            //   callback: () => {
            //     setIsRegimeKanban(true);
            //   },
            // },
          ]),
    ],
  };

  const titles = [
    "STT",
    "Mã phiếu",
    "Tên khách hàng",
    "Danh mục hỗ trợ",
    "Ngày tiếp nhận",
    "Ngày dự kiến xong",
    "Người tạo phiếu",
    "Bộ phận xử lý",
    "Trạng thái xử lý",
  ];

  const dataFormat = ["text-center", "", "", "", "text-center", "text-center", "", "text-center", "text-center"];

  const dataSize = ["auto", "auto", "auto", "auto", 20, "auto", "auto", 16, "auto"];

  const dataMappingArray = (item: ITicketResponseModel, index: number) => [
    getPageOffset(params) + index + 1,
    item.code,
    <span
      key={item.id}
      style={{ cursor: "pointer" }}
      onClick={() => {
        navigate(`/detail_ticket/ticketId/${item.id}`);
      }}
    >
      {item.customerName}
    </span>,
    item.supportName,
    item.createdTime ? moment(item.createdTime).format("DD/MM/YYYY HH:mm") : "",
    item.endDate ? moment(item.endDate).format("DD/MM/YYYY HH:mm") : "",
    item.creatorName,
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

    const response = await TicketService.updateStatus(body);

    if (response.code === 0) {
      showToast(`${status == 1 ? "Tiếp tục" : "Tạm dừng"} thành công`, "success");
      getListTicket(params);
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
      objectType: 1,
    };

    const response = await TicketService.resetTransferVotes(param);

    if (response.code === 0 && response.result > 0) {
      showToast(`Trình lại duyệt phiếu thành công`, "success");
      getListTicket(params);

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

  const actionsTable = (item: ITicketResponseModel): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      ...(!item.status
        ? [
            {
              title: "Chuyển phiếu",
              icon: <Icon name="FingerTouch" className={isCheckedItem ?"icon-disabled": "icon-warning"}/>,
              disabled: isCheckedItem,
              callback: () => {
                if (!isCheckedItem) {
                setDataTicket(item);
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
          navigate(`/detail_ticket/ticketId/${item.id}`);
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
                setDataTicket(item);
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
                showDialogConfirmStatus(item, "pending");
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
                showDialogConfirmStatus(item, "play");
              },
            },
            {
              title: "Duyệt phiếu lại",
              icon: <Icon name="FingerTouch" className={isCheckedItem ?"icon-disabled": "icon-warning"} />,
              disabled: isCheckedItem,
              callback: () => {
                showDialogConfirmStatus(item, "inital");
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
    const response = await TicketService.delete(id);

    if (response.code === 0) {
      showToast("Xóa hỗ trợ thành công", "success");
      getListTicket(params);
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
      const found = listTicket.find((item) => item.id === selectedId);
      if (found?.id) {
        return TicketService.delete(found.id);
      } else {
        return Promise.resolve(null);
      }
    });
    Promise.all(arrPromises)
    .then((results) => {
      const checkbox = results.filter (Boolean)?.length ||0;
      if (checkbox > 0) {
        showToast(`Xóa thành công ${checkbox} hỗ trợ`, "success");
        getListTicket(params);
        setListIdChecked([]);
      } else {
        showToast("Không có hỗ trợ nào được xóa", "error");
      }
   })
    .finally(() => {
      setShowDialog(false);
      setContentDialog(null);
    });
  }

  const showDialogConfirmDelete = (item?: ITicketResponseModel) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "hỗ trợ cho khách hàng " : `${listIdChecked.length} hỗ trợ cho khách hàng đã chọn`}
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
      title: "Xóa hỗ trợ",
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page-content page-ticket${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Tiếp nhận hỗ trợ" titleActions={titleActions} />
      <div className="card-box d-flex flex-column">
        <div className={`${isRegimeKanban ? "d-none" : ""}`}>
          <div className="option-improve">
            <Tippy content="Tải lại trang" delay={[120, 100]} placement="left" animation="scale">
              <span className="icon-item icon-reload" onClick={() => getListTicket(params)}>
                <Icon name="BackupRestore" />
              </span>
            </Tippy>
            {isCollapsedSidebar ? (
              <Tippy content="Thoát khỏi chế độ toàn màn hình (f)" placement="left" delay={[120, 100]} animation="scale">
                <span className="icon-item" onClick={() => setIsCollapsedSidebar(false)}>
                  <Icon name="FullscreenExit" />
                </span>
              </Tippy>
            ) : (
              <Tippy content="Toàn màn hình (f)" delay={[120, 100]} placement="left" animation="scale">
                <span className="icon-item" onClick={() => setIsCollapsedSidebar(true)}>
                  <Icon name="Fullscreen" />
                </span>
              </Tippy>
            )}
          </div>
          <TableTicket
            params={params}
            setParams={setParams}
            listSaveSearch={listSaveSearch}
            customerFilterList={customerFilterList}
            titles={titles}
            listTicket={listTicket}
            pagination={pagination}
            dataMappingArray={dataMappingArray}
            dataFormat={dataFormat}
            listIdChecked={listIdChecked}
            setListIdChecked={setListIdChecked}
            bulkActionList={bulkActionList}
            actionsTable={actionsTable}
            isLoading={isLoading}
            isNoItem={isNoItem}
            setDataTicket={setDataTicket}
            setShowModalAdd={showModalAdd}
            isPermissions={isPermissions}
            isService={isService}
            dataSize={dataSize}
          />
        </div>
        {/* <div className={`${isRegimeKanban ? "" : "d-none"}`}>
          <KanbanTicket data={listTicket} isRegimeKanban={isRegimeKanban} />
        </div> */}
      </div>
      <AddTicketModal
        onShow={showModalAdd}
        data={dataTicket}
        onHide={(reload) => {
          if (reload) {
            getListTicket(params);
          }
          setShowModalAdd(false);
        }}
      />
      <AddTransferVotes
        onShow={hasTransferVotes}
        onHide={(reload) => {
          if (reload) {
            getListTicket(params);
          }

          setHasTransferVotes(false);
        }}
        dataProps={{
          objectId: dataTicket?.id,
          objectType: 1,
        }}
        type="ticket"
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
