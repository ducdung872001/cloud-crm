import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import Icon from "components/icon";
import BoxTable from "components/boxTable/boxTable";
import { isDifferenceObj, showToast } from "utils/common";
import SearchBox from "components/searchBox/searchBox";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Loading from "components/loading";
import { IAction, IFilterItem, IOption, ISaveSearch } from "model/OtherModel";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { useNavigate, useSearchParams } from "react-router-dom";
import _ from "lodash";
import moment from "moment";
import { PHONE_REGEX, EMAIL_REGEX } from "utils/constant";
import AddUserModal from "pages/User/partials/AddUserModal";
import UserService from "services/UserService";
import Image from "components/image";
import { getPageOffset } from "reborn-util";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import ChangePasswordUser from "./partials/ChangePasswordUser";
import ViewOrgModal from "./partials/ViewOrgModal";
import "./UserList.scss";

export default function UserList() {
  document.title = "Danh sách Người dùng";
  const [searchParams, setSearchParams] = useSearchParams();
  const [listUser, setListUser] = useState<any[]>([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [idCustomer, setIdCustomer] = useState<number>(null);
  const [isShowResetPassword, setIsShowResetPassword] = useState<boolean>(false);
  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Tất cả người dùng",
      is_active: true,
    },
  ]);

  const navigation = useNavigate();

  const customerFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "time_treament",
        name: "Thời gian",
        type: "date-two",
        is_featured: true,
        value: searchParams.get("form_date") ?? "",
        value_extra: searchParams.get("to_date") ?? "",
      },
      {
        key: "seeder",
        name: "Chọn đối tượng",
        type: "select",
        is_featured: true,
        list: [
          {
            value: "-1",
            label: "Tất cả",
          },
          {
            value: "0",
            label: "Khách mua hàng",
          },
          {
            value: "1",
            label: "Tài khoản Seeder",
          },
        ],
        value: searchParams.get("seeder") ?? "",
      },
      {
        key: "role",
        name: "Chọn vai trò",
        type: "select",
        is_featured: true,
        list: [
          {
            value: "",
            label: "Tất cả",
          },
          {
            value: "mod",
            label: "Quản trị viên",
          },
        ],
        value: searchParams.get("role") ?? "",
      },
    ],
    [searchParams]
  );

  const isMounted = useRef(false);
  const [params, setParams] = useState<any>({
    name: "",
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Người dùng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit, page: 1 }));
    },
  });

  const abortController = new AbortController();
  const getListUser = async (paramsSearch: any) => {
    setIsLoading(true);
    const response = await UserService.list(paramsSearch, abortController.signal);
    if (response.code === 0) {
      const result = response.result;
      setListUser(result.items);
      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
      if (+result.total === 0 && params.name === "" && +params.page === 1) {
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
      getListUser(params);
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
      {
        title: "Thêm người dùng",
        callback: () => {
          setDataUser(null);
          setShowModalUser(true);
        },
      },
    ],
    actions_extra: [
      {
        title: "Xuất danh sách",
        icon: <Icon name="Download" />,
        callback: () => setOnShowModalExport(true),
      },
    ],
  };

  const titles = ["STT", "Họ tên", "Điện thoại", "Email", "Đơn hàng", "Quản trị tổ chức", "Ngày tham gia", "Kiểu người dùng"];

  const [modalViewOrg, setModalViewOrg] = useState<boolean>(false);

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    <div key={index} className="container-name">
      {/* <div style={{width: '2rem'}}>
        <Image key={item.id} src={item.avatar} alt={item.name} width="6.4rem"/>
      </div> */}
      <div>
        <span style={{ marginLeft: "1rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "500" }}>{item.name}</span>
      </div>
    </div>,
    item.phone,
    item.email,
    <a key={index} href={`/order?userId=${item.id}`}>
      Đơn hàng
    </a>,
    <a
      key={index}
      onClick={() => {
        setModalViewOrg(true);
        setDataUser(item);
      }}
    >
      Xem tổ chức
    </a>,
    moment(item.regisDate).format("DD/MM/YYYY HH:mm"),
    item.seeder == null || item.seeder == 0 ? "Người dùng thật" : "Seeder",
  ];

  const dataFormat = ["text-center", "", "text-center", "", "text-center", "text-center", ""];

  const actionsTable = (item: any): IAction[] => {
    return [
      {
        title: "Tạo tổ chức",
        icon: <Icon name="Headquarters" className="icon-success" />,
        callback: () => {
          navigation(`/organization`);
          localStorage.setItem("idUserAdmin", `${item.id}`);
        },
      },
      {
        title: "Reset mật khẩu",
        icon: <Icon name="ResetPassword" className="icon-warning" />,
        callback: () => {
          setIdCustomer(item.id);
          setIsShowResetPassword(true);
        },
      },
      {
        title: "Sửa người dùng",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataUser(item);
          setShowModalUser(true);
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const showDialogConfirmDelete = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa người dùng</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "người dùng " : `${listIdChecked.length} người dùng đã chọn`}
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

  const onDelete = async (id: number) => {
    const response = await UserService.delete(id);
    if (response.code === 0) {
      showToast(`Xóa người dùng thành công`, "success");
      getListUser(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const [showModalUser, setShowModalUser] = useState<boolean>(false);
  const [dataUser, setDataUser] = useState<any>(null);

  //Export
  const [onShowModalExport, setOnShowModalExport] = useState<boolean>(false);
  const optionsExport: IOption[] = useMemo(
    () => [
      {
        value: "all",
        label: "Tất cả người dùng ",
      },
      {
        value: "current_page",
        label: "Trên trang này",
        disabled: pagination.totalItem === 0,
      },
      {
        value: "current_search",
        label: `${pagination.totalItem} người dùng phù hợp với kết quả tìm kiếm hiện tại`,
        disabled: pagination.totalItem === 0 || !isDifferenceObj(params, { keyword: "" }),
      },
    ],
    [pagination, listIdChecked, params]
  );

  return (
    <div className={`page-content page-user${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Người dùng" titleActions={titleActions} />
      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Người dùng"
          placeholderSearch="Tìm kiếm theo tên người dùng"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          isFilter={true}
          listFilterItem={customerFilterList}
          updateParams={(paramsNew) => {
            let newParams = null;

            if (paramsNew) {
              const changeParams = _.cloneDeep(paramsNew);
              if (new RegExp(PHONE_REGEX).test(paramsNew.name)) {
                changeParams.phone = paramsNew.name;

                changeParams.name = "";
                changeParams.email = "";
              } else if (new RegExp(EMAIL_REGEX).test(paramsNew.name)) {
                changeParams.email = paramsNew.name;

                changeParams.name = "";
                changeParams.phone = "";
              } else {
                changeParams.name = paramsNew.name;

                changeParams.phone = "";
                changeParams.email = "";
              }
              newParams = changeParams;
            }

            setParams(newParams);
          }}
        />
        {!isLoading && listUser && listUser.length > 0 ? (
          <BoxTable
            name="Người dùng"
            titles={titles}
            items={listUser}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            striped={true}
            setListIdChecked={(listId) => setListIdChecked(listId)}
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
                    Hiện tại chưa có người dùng nào. <br />
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới người dùng"
                action={() => {
                  setDataUser(null);
                  setShowModalUser(true);
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
      <AddUserModal
        onShow={showModalUser}
        data={dataUser}
        onHide={(reload) => {
          if (reload) {
            getListUser(params);
          }
          setShowModalUser(false);
        }}
      />
      <ChangePasswordUser
        onShow={isShowResetPassword}
        id={idCustomer}
        onHide={(reload) => {
          if (reload) {
            getListUser(params);
          }
          setIsShowResetPassword(false);
        }}
      />
      <ViewOrgModal onShow={modalViewOrg} onHide={(reload) => setModalViewOrg(false)} data={dataUser} />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
