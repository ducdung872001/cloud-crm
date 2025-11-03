import React, { useEffect, useState } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import "./saleFlowModal.scss";
import SelectCustom from "components/selectCustom/selectCustom";
import SaleFlowService from "services/SaleFlowService";
import { showToast } from "utils/common";
import OrderService from "services/OrderService";

export interface SaleFlowModalProps {
  itemSaleFlow: any;
  onShow: boolean;
  onHide: () => void;
}
export default function SaleFlowModal(props: SaleFlowModalProps) {
  const { itemSaleFlow, onShow, onHide } = props;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [valueSaleflow, setValueSaleflow] = useState(null);

  useEffect(() => {
    if (onShow) {
    }
  }, [onShow]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const body = { ...itemSaleFlow };
    body.saleflowId = valueSaleflow.value;
    body.approachId = body?.approachId ? body?.approachId : 0;
    const response = await OrderService.update(body, body.id);

    if (response.code === 0) {
      showToast(`Lưu thành công`, "success");
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const actions: IActionModal = {
    actions_right: {
      buttons: [
        {
          title: "Hủy",
          color: "primary",
          variant: "outline",
          disabled: isSubmit,
          callback: () => onHide(),
        },
        {
          title: "Xác nhận",
          type: "submit",
          color: "primary",
          disabled: !valueSaleflow?.value,
          is_loading: isSubmit,
          callback: () => {
            setIsSubmit(true);
          },
        },
      ],
    },
  };
  const handleChangeValueSaleflow = (e) => {
    setValueSaleflow(e);
  };
  const loadOptionSaleflow = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };
    const response = await SaleFlowService.list(param);
    const optionSaleflow = [];

    if (response.code === 0) {
      const dataOption = response.result.items;

      if (dataOption.length > 0) {
        dataOption.map((item: any) => {
          optionSaleflow.push({
            value: item.id,
            label: item.name,
          });
        });
      }

      return {
        options: optionSaleflow,
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  return (
    <Modal isOpen={onShow} className="modal-export" isFade={true} staticBackdrop={true} toggle={() => !isSubmit && onHide()} isCentered={true}>
      <form className="form-export" onSubmit={(e) => onSubmit(e)}>
        <ModalHeader title={`Chọn quy trình bán hàng`} toggle={() => !isSubmit && onHide()} />
        <ModalBody>
          <div>
            <SelectCustom
              id="saleflowId"
              name="saleflowId"
              fill={true}
              required={true}
              options={[]}
              value={valueSaleflow}
              onChange={(e) => handleChangeValueSaleflow(e)}
              isAsyncPaginate={true}
              placeholder="Chọn quy trình bán hàng"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadOptionSaleflow}
            />
          </div>
        </ModalBody>
        <ModalFooter actions={actions} />
      </form>
    </Modal>
  );
}
