import React, { Fragment, useState, useEffect, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import CustomerService from "services/CustomerService";
import { showToast } from "utils/common";
import { IAction, IActionModal } from "model/OtherModel";
import Icon from "components/icon";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import "./index.scss";

interface IViewOpportunityBTwoBProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  idCustomer: number;
  special: boolean;
  totalOpportunity: number;
  handlePushCampaign: (action: boolean, idOpportunity: number, idCustomer: number) => void;
}

export default function ViewOpportunityBTwoB(props: IViewOpportunityBTwoBProps) {
  const { onShow, onHide, idCustomer, totalOpportunity, handlePushCampaign, special } = props;

  const [lstOpportunity, setLstOpportunity] = useState([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGetData = async (idCustomer: number, isLoading?: boolean) => {
    if (!idCustomer) return;

    isLoading && setIsLoading(true);

    const param = {
      customerId: idCustomer,
    };

    const response = await CustomerService.lstOpportunity(param);

    if (response.code === 0) {
      const result = response.result;
      setLstOpportunity(result.items);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (onShow && idCustomer) {
      handleGetData(idCustomer, true);
    }
  }, [onShow, idCustomer]);

  const titles = ["STT", "Tên sản phẩm/dịch vụ", "Người quyết định"];

  const dataFormat = ["text-center", "", "", "text-right"];

  const dataMappingArray = (item, index: number) => [index + 1, item.productName || item.serviceName, item.contactName];

  const deleteCampaign = async (id) => {
    if (!id) return;

    const response = await CustomerService.deleteOpportunity(id);
    if (response.code === 0) {
      showToast(`Xóa cơ hội thành công`, "success");
      handleGetData(idCustomer, false);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const actionsTable = (item): IAction[] => {
    return [
      {
        title: "Đẩy vào chiến dịch bán hàng",
        icon: <Icon name="Reply" />,
        callback: () => handlePushCampaign(true, item.id, idCustomer),
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          deleteCampaign(item.id);
        },
      },
    ];
  };

  const handleClearForm = () => {
    onHide(totalOpportunity != lstOpportunity.length || special ? true : false);
    setLstOpportunity([]);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => handleClearForm(),
          },
        ],
      },
    }),
    [totalOpportunity, lstOpportunity, special]
  );

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide(false)} className="modal__view--opportunity">
        <div className="__view--opportunity">
          <ModalHeader title={"Danh sách cơ hội"} toggle={() => onHide(false)} />
          <ModalBody>
            <div className="list__info--opportunity">
              {!isLoading && lstOpportunity && lstOpportunity.length > 0 ? (
                <BoxTable
                  name="Cơ hội"
                  titles={titles}
                  items={lstOpportunity}
                  dataMappingArray={(item, index) => dataMappingArray(item, index)}
                  dataFormat={dataFormat}
                  striped={true}
                  actions={actionsTable}
                  actionType="inline"
                />
              ) : isLoading ? (
                <Loading />
              ) : (
                <SystemNotification
                  description={
                    <span>
                      Hiện tại chưa có cơ hội nào. <br />
                    </span>
                  }
                  type="no-item"
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
