import React, { Fragment, useState } from "react";
import Dialog, { IContentDialog } from "@/components/dialog/dialog";
import "./index.scss";
import DraftListPanel from "./partials/DraftListPanel";
import DraftDetailPanel from "./partials/DraftDetailPanel";
import { useDraftOrders } from "./partials/hooks/useDraftOrders";

type Props = {
  onContinue?: (draftId: string) => void;
};

const DraftOrders: React.FC<Props> = ({ onContinue }) => {
  const vm = useDraftOrders();

  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const askDelete = (id: string) => {
    const item = vm.list.find((x) => x.id === id);
    const dialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: false,
      title: <Fragment>Xóa đơn tạm?</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc muốn xóa <strong>{item?.tenDon}</strong> (<strong>{id}</strong>)? Thao tác này không thể hoàn tác.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => {
        vm.deleteDraft(id);
        setShowDialog(false);
        setContentDialog(null);
      },
    };

    setContentDialog(dialog);
    setShowDialog(true);
  };

  return (
    <div className="draft-orders">
      <DraftListPanel
        items={vm.filtered}
        selectedId={vm.selectedId}
        query={vm.query}
        onQueryChange={vm.setQuery}
        onSelect={vm.setSelectedId}
        onCreate={vm.createDraft}
      />

      <DraftDetailPanel order={vm.selected} onDelete={(id) => askDelete(id)} onContinue={onContinue} />

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
};

export default DraftOrders;
