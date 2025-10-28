import React, { Fragment, useEffect, useMemo, useState } from "react";
import moment from "moment";
import { IAction, IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Icon from "components/icon";
import BoxTable from "components/boxTable/boxTable";
import QuoteService from "services/QuoteService";
import { showToast } from "utils/common";
import "./index.scss";

interface ICopyItemModalProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  lstData: any[];
}

export default function CopyItemModal(props: ICopyItemModalProps) {
  const { onShow, onHide, lstData } = props;

  const [takeItem, setTakeItem] = useState(null);
  const [isSubmit, setIsSubmit] = useState<boolean>(null);

  const titles = ["STT", "Tên báo giá", "Ngày báo giá", "Ngày hết hạn"];

  const dataFormat = ["text-center", "", "text-center", "text-center"];

  const dataMappingArray = (item, index: number) => [
    index + 1,
    item.name,
    item.quoteDate ? moment(item.quoteDate).format("DD/MM/YYYY") : "",
    item.expiredDate ? moment(item.expiredDate).format("DD/MM/YYYY") : "",
  ];

  const actionsTable = (item): IAction[] => {
    return [
      {
        title: "Chọn",
        icon: isSubmit && item.id === takeItem?.id ? <Icon name="Loading" /> : <Icon name="FingerTouch" />,
        callback: () => {
          !isSubmit && setTakeItem(item);
        },
      },
    ];
  };

  const handleCopyItemFS = async (id: number) => {
    if (!id) return;

    setIsSubmit(true);

    const body = {
      id,
    };

    const response = await QuoteService.cloneQuote(body);
    if (response.code === 0) {
      onHide(true);
      setTakeItem(null);
      showToast("Sao chép mẫu thành công", "success");
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
  };

  useEffect(() => {
    if (takeItem) {
      handleCopyItemFS(takeItem.id);
    }
  }, [takeItem]);

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => onHide(false),
          },
        ],
      },
    }),
    [isSubmit]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-copy-item-quota"
      >
        <div className="form-copy-item-quota-group">
          <ModalHeader title={`Sao chép mẫu báo cáo`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="table__item--quota">
              {lstData && lstData.length > 0 && (
                <BoxTable
                  name="Báo giá"
                  titles={titles}
                  items={lstData}
                  dataMappingArray={(item, index) => dataMappingArray(item, index)}
                  dataFormat={dataFormat}
                  striped={true}
                  actions={actionsTable}
                  actionType="inline"
                />
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
    </Fragment>
  );
}
