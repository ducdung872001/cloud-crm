import React, { Fragment, useEffect, useMemo, useState } from "react";
import Icon from "components/icon";
import Loading from "components/loading";
import CustomScrollbar from "components/customScrollbar";
import BoxTable from "components/boxTable/boxTable";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IAction, IActionModal } from "model/OtherModel";
import ImageError from "assets/images/error.png";
import BeautySalonService from "services/BeautySalonService";
import { showToast } from "utils/common";

import "./ViewOrgModal.scss";

interface IViewOrgModalProps {
  onShow: boolean;
  data: any;
  onHide: (reload: boolean) => void;
}

export default function ViewOrgModal(props: IViewOrgModalProps) {
  const { onShow, onHide, data } = props;

  const [lstOrg, setLstOrg] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const titles = ["STT", "Ảnh đại diện", "Tên tổ chức", "Số điện thoại", "Địa chỉ"];

  const dataFormat = ["text-center", "text-center", "", "text-center", ""];

  const dataMappingArray = (item: any, index: number) => [
    index + 1,
    <div key={item.id} className="avatar">
      <img src={item.avatar || ImageError} alt={item.name} />
    </div>,
    item.name,
    item.phone,
    item.address,
  ];

  const handleAccess = (item) => {
    const link = `https://${process.env.APP_DOMAIN}/tham-my-vien/${item.pageLink}`;
    window.open(link, "_blank");
  };

  const actionsTable = (item: any): IAction[] => {
    return [
      {
        title: "Truy cập",
        icon: <Icon name="FingerTouch" className="icon-warning" />,
        callback: () => {
          handleAccess(item);
        },
      },
    ];
  };

  const handleGetOrg = async (idOrg: number) => {
    setIsLoading(true);

    const param = {
      ownerId: idOrg,
      sortedBy: "newest",
      limit: 100,
    };

    const response = await BeautySalonService.list(param);

    if (response.code === 0) {
      const result = response.result.items;
      setLstOrg(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (data && onShow) {
      handleGetOrg(data.id);
    }
  }, [onShow, data]);

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => {
              onHide(false);
            },
          },
        ],
      },
    }),
    []
  );

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide(false)} className="modal-view-org" size="lg">
        <div className="box-view-org">
          <ModalHeader title={`Danh sách quản trị tổ chức`} toggle={() => onHide(false)} />
          <ModalBody>
            <div className="lst__org">
              {!isLoading && lstOrg && lstOrg.length > 0 ? (
                <CustomScrollbar width="100%" height={`${lstOrg.length * 88.5 > 420 ? 420 : lstOrg.length * 88.5 + 56}px`}>
                  <BoxTable
                    name="Danh sách tổ chức"
                    titles={titles}
                    items={lstOrg}
                    dataMappingArray={(item, index) => dataMappingArray(item, index)}
                    dataFormat={dataFormat}
                    striped={true}
                    actions={actionsTable}
                    actionType="inline"
                    onClickRow={(data) => {
                      handleAccess(data);
                    }}
                  />
                </CustomScrollbar>
              ) : isLoading ? (
                <Loading />
              ) : (
                <SystemNotification
                  description={
                    <span>
                      Hiện tại chưa quản trị tổ chức nào. <br />
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
