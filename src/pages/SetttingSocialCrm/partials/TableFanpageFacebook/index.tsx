import React, { Fragment, useState } from "react";
import { IAction } from "model/OtherModel";
import { ITableFanpageFacebookProps } from "model/fanpageFacebook/PropsModel";
import { IFanpageFacebookResponse } from "model/fanpageFacebook/FanpageResponseModel";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Icon from "components/icon";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FanpageFacebookService from "services/FanpageFacebookService";
import { getPermissions } from "utils/common";
import { showToast } from "utils/common";

export default function TableFanpageFacebook(props: ITableFanpageFacebookProps) {
  const { listFanpageFacebook, isLoading, dataPagination, callback, isPermissionsFacebook } = props;

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [permissions, setPermissions] = useState(getPermissions());

  const titles = ["STT", "Tên fanpage", "Mã fanpage"];

  const dataFormat = ["text-center", "", ""];

  const dataMappingArray = (item: IFanpageFacebookResponse, index: number) => [index + 1, item.name, item._fanpage_id];

  const actionsTable = (item: IFanpageFacebookResponse): IAction[] => {
    return [
      permissions["FANPAGE_DELETE"] == 1 && {
        title: "Gỡ fanpage",
        icon: <Icon name="UnConnect" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDelete = async (id: string) => {
    const response = await FanpageFacebookService.delete(id);
    if (response.code === 0) {
      showToast("Gỡ fanpage thành công", "success");
      callback();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: IFanpageFacebookResponse) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Gỡ...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn gỡ fanpage
          {item ? <strong> {item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => onDelete(item._fanpage_id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  return (
    <Fragment>
      {!isLoading && listFanpageFacebook && listFanpageFacebook.length > 0 ? (
        <BoxTable
          name="Danh sách Fanpage Facebook"
          titles={titles}
          items={listFanpageFacebook}
          dataMappingArray={(item, index) => dataMappingArray(item, index)}
          dataFormat={dataFormat}
          striped={true}
          isPagination={false}
          dataPagination={dataPagination}
          actions={actionsTable}
          actionType="inline"
        />
      ) : isLoading ? (
        <Loading />
      ) : isPermissionsFacebook ? (
        <SystemNotification type="no-permission" />
      ) : (
        <SystemNotification description={<span>Hiện tại bạn chưa có fanpage nào.</span>} type="no-item" />
      )}
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
