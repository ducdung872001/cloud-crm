import React from "react";
import { useState, Fragment } from "react";
import { showToast } from "utils/common";
import Dialog, { IContentDialog } from "components/dialog/dialog";

export function DeleteHandler({
  deleteService,
  entityName,
  reload,
}: {
  deleteService: (id: number) => Promise<any>;
  entityName: string;
  reload: () => void;
}) {
  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const handleDelete = async (ids: number[]) => {
    if (!ids.length) return;

    const promises = ids.map((id) => deleteService(id));
    const results = await Promise.all(promises);

    const successCount = results.filter(r => r?.code === 0).length;

    if (successCount > 0) {
      showToast(`Xóa thành công ${successCount} ${entityName}`, "success");
      reload();
    } else {
      showToast("Không có dữ liệu nào được xóa", "error");
    }

    setShowDialog(false);
    setContentDialog(null);
  };

  const showConfirmDelete = (
    ids: number[],
    itemName?: string
  ) => {
    const content: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa{" "}
          {itemName ? entityName : `${ids.length} ${entityName} đã chọn`}{" "}
          {itemName && <strong>{itemName}</strong>}?
          Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => handleDelete(ids),
    };

    setContentDialog(content);
    setShowDialog(true);
  };

  const DialogComponent = (
    <Dialog content={contentDialog} isOpen={showDialog} />
  );

  return {
    showConfirmDelete,
    DialogComponent,
  };
}