import React, { Fragment, useEffect, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment";
import { IAction, ISaveSearch } from "model/OtherModel";
import { ITipUserDetail } from "model/tipUser/PropsModel";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { showToast } from "utils/common";
import AddTipRose from "./partials/AddTipRose";
import { getPageOffset } from 'reborn-util';

import "./TipUserDetail.scss";

const mockData = [
  {
    id: 1,
    name: "Tính theo giá trị đơn hàng",
    startDate: "27/04/2023",
    endDate: "28/04/2023",
  },
  {
    id: 2,
    name: "Tính theo mức lương",
    startDate: "27/04/2023",
    endDate: "28/04/2023",
  },
  {
    id: 3,
    name: "Tính theo số lượng mặt hàng",
    startDate: "27/04/2023",
    endDate: "28/04/2023",
  },
];

export default function TipUserDetail(props: ITipUserDetail) {
  const { showModalCommissionRate, setShowModalCommissionRate, dataTipUser, dataDetailTip, setDataDetailTip } = props;

  const isMounted = useRef(false);

  const [listDetailTips, setListDetailTips] = useState([...mockData]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [params, setParams] = useState({
    name: "",
    page: 1,
    limit: 10,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Hoa hồng theo cá nhân",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Hoa hồng theo cá nhân",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListDetailTip = async (paramsSearch) => {
    setIsLoading(true);

    // sau có api rồi thì call vào đây

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
      getListDetailTip(params);
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

  const titles = ["STT", "Cách tính", "Từ ngày", "Đến ngày", "Cấu hình"];

  const dataFormat = ["text-center", "", "text-center", "text-center", "text-center"];

  const dataMappingArray = (item, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.startDate ? moment(item.startDate).format("DD/MM/YYYY") : "",
    item.endDate ? moment(item.endDate).format("DD/MM/YYYY") : "",
    <a
      key={item.id}
      onClick={(e) => {
        e && e.preventDefault();
        setDataDetailTip(item);
        setShowModalCommissionRate(true);
      }}
    >
      Cấu hình
    </a>,
  ];

  const actionsTable = (item): IAction[] => {
    return [
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    if (!id) return;
    // bh có api thì call vào đây
    const response = { code: 0, message: "" };

    if (response.code === 0) {
      showToast(`Xóa hoa hồng của cá nhân ${dataTipUser?.employeeName} thành công`, "success");
      getListDetailTip(params);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? `hoa hồng của cá nhân ${dataTipUser?.employeeName}` : `${listIdChecked.length} hoa hồng đã chọn`}? Thao
          tác này không thể khôi phục.
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
    {
      title: `Xóa hoa hồng của cá nhân ${dataTipUser?.employeeName}`,
      callback: () => showDialogConfirmDelete(),
    },
  ];

  return (
    <div className={`page__detail--tip ${isNoItem ? " bg-white" : ""}`}>
      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên cách tính hoa hồng"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listDetailTips && listDetailTips.length > 0 ? (
          <BoxTable
            name="Hoa hồng theo cá nhân"
            titles={titles}
            items={listDetailTips}
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
            {!isNoItem ? (
              <SystemNotification
                description={
                  <span>
                    Hiện tại chưa có cách tính hoa hồng nào. <br />
                    Hãy thêm mới cách tính hoa hồng đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới cách tính hoa hồng"
                action={() => {
                  setDataDetailTip(null);
                  setShowModalCommissionRate(true);
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
      <AddTipRose
        onShow={showModalCommissionRate}
        data={dataDetailTip}
        dataEmployee={dataTipUser}
        onHide={(reload) => {
          if (reload) {
            getListDetailTip(params);
          }
          setShowModalCommissionRate(false);
        }}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
