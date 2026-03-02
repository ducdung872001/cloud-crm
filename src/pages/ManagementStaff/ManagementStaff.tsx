import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import Badge from "components/badge/badge";
import { IAction } from "model/OtherModel";
import { showToast } from "utils/common";
import "./ManagementStaff.scss";
import ModalAddStaff from "./partials/ModalManagementStaff/ModalAddStaff";

export default function StaffManagement() {
  document.title = "Quản lý Nhân viên";

  const isMounted = useRef(false);

  const [listStaff, setListStaff] = useState<any[]>([]);
  const [dataStaff, setDataStaff] = useState<any>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);

  const [params, setParams] = useState<any>({ name: "", page: 1, limit: 10 });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "nhân viên",
    isChooseSizeLimit: true,
    setPage: (page) => setParams((prev) => ({ ...prev, page })),
    chooseSizeLimit: (limit) => setParams((prev) => ({ ...prev, limit })),
  });

  const getListStaff = (paramsSearch: any) => {
    setIsLoading(true);
    setTimeout(() => {
      const mockData = [
        { id: 1, name: "Nguyễn Hân", role: "Thu ngân", code: "NV001", status: "Đã về", isShiftManager: true },
        { id: 2, name: "Nguyễn Dinh", role: "Thu ngân", code: "NV002", status: "Đang ca", isShiftManager: true },
        { id: 3, name: "Nguyễn Thông", role: "Thu ngân", code: "NV003", status: "Đang ca", isShiftManager: true },
        { id: 4, name: "Nguyễn Phom", role: "Quản lý", code: "MG001", status: "Đang trực", isShiftManager: true },
      ];
      setListStaff(mockData);
      setPagination((prev) => ({ ...prev, totalItem: mockData.length, totalPage: 1 }));
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    getListStaff(params);
  }, [params]);

  const titleActions: ITitleActions = {
    actions: [
      {
        title: "Thêm nhân viên",
        callback: () => {
          setDataStaff(null);
          setShowModalAdd(true);
        },
      },
    ],
  };

  const titles = ["Nhân viên", "Vai trò", "Mã số", "Trạng thái", "Quản lý ca", "Hành động"];
  const dataFormat = ["", "text-center", "text-center", "text-center", "text-center", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    <div className="staff-info-cell" key={`staff-${item.id}`}>
      <div className="text-wrapper">
        <span className="name">{item.name}</span>
      </div>
    </div>,
    <div key={`role-${item.id}`}>
      <span className="role text-center">{item.role}</span>
    </div>,
    // <Badge key={`role-${item.id}`} variant="secondary" text={item.role} />,
    item.code,
    <Badge key={`status-${item.id}`} variant={item.status === "Đã về" ? "wait-collect" : "success"} text={item.status} />,
    <Badge key={`shift-${item.id}`} variant="primary" text="✓ Bật" />,
  ];

  const actionsTable = (item: any): IAction[] => {
    const isCheckedItem = listIdChecked?.length > 0;
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" className={isCheckedItem ? "icon-disabled" : ""} />,
        disabled: isCheckedItem,
        callback: () => {
          setDataStaff(item);
          setShowModalAdd(true);
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className={isCheckedItem ? "icon-disabled" : "icon-error"} />,
        disabled: isCheckedItem,
        callback: () => {
          // Logic
        },
      },
    ];
  };

  const bulkActionList: BulkActionItemModel[] = [
    {
      title: `Xóa nhân viên đã chọn`,
      callback: () => {
        /* Logic*/
      },
    },
  ];

  return (
    <div className="page-content page-mgt-staff">
      <TitleAction title="Quản lý Nhân viên" titleActions={titleActions} />

      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              <li className="active">Danh sách nhân viên</li>
            </ul>
          </div>
          <SearchBox name={`Tên nhân viên`} params={params} updateParams={(p) => setParams(p)} />
        </div>

        {!isLoading && listStaff.length > 0 ? (
          <BoxTable
            titles={titles}
            items={listStaff}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={dataMappingArray}
            dataFormat={dataFormat}
            listIdChecked={listIdChecked}
            setListIdChecked={setListIdChecked}
            actions={actionsTable}
            actionType="inline"
            isBulkAction={true}
            bulkActionItems={bulkActionList}
          />
        ) : isLoading ? (
          <Loading />
        ) : (
          <SystemNotification type="no-item" titleButton="Thêm nhân viên" action={() => setShowModalAdd(true)} />
        )}

        <ModalAddStaff
          onShow={showModalAdd}
          data={dataStaff}
          onHide={(reload) => {
            if (reload) getListStaff(params);
            setShowModalAdd(false);
          }}
        />
        <Dialog content={contentDialog} isOpen={showDialog} />
      </div>
    </div>
  );
}
