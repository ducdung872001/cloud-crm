import React, { Fragment, useState, useEffect, useMemo } from "react";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IActionModal } from "model/OtherModel";
import { IAddTemplateEmailModelProps } from "model/templateEmail/PropsModel";
import { IEmployeeResponse } from "model/employee/EmployeeResponseModel";
import TemplateEmailService from "services/TemplateEmailService";
import { showToast } from "utils/common";
import { ITemplateEmailResponseModel } from "model/templateEmail/TemplateEmailResponseModel";
import { removeHtmlTags, trimContent } from "reborn-util";
import Tippy from "@tippyjs/react";

import "./ViewTemplateEmailModal.scss";

export default function ViewTemplateEmailModal(props: IAddTemplateEmailModelProps) {
  const { onShow, onHide, callback } = props;

  const [listTemplateEmail, setListTemplateEmail] = useState<IEmployeeResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);

  const getListTemplateEmail = async () => {
    setIsLoading(true);

    const param = {
      name: "",
      limit: 30,
    };

    const response = await TemplateEmailService.list(param);

    if (response.code === 0) {
      const result = response.result.items || [];

      if (result.length === 0) {
        setIsNoItem(true);
      }
      setListTemplateEmail(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (onShow) {
      getListTemplateEmail();
    }
  }, [onShow]);

  const titles = ["STT", "Tiêu đề Email", "Nội dung Email"];

  const dataFormat = ["text-center", "", ""];

  const dataMappingArray = (item: ITemplateEmailResponseModel, index: number) => [
    index + 1,
    item.title,
    <Tippy key={item.id} content={removeHtmlTags(item.content)} delay={[120, 100]} placement="bottom" animation="scale">
      <p style={{ cursor: "pointer" }} onClick={() => {
        //Xử lý khi được click vào
        callback && callback(item);
        onHide(false);
      }}>{trimContent(item.content, 120, true, true)}</p>
    </Tippy>,
  ];

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
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true}
        toggle={() => onHide(false)} className="modal-view-email--template">
        <ModalHeader title={`Mẫu Email`} toggle={() => onHide(false)} />
        <ModalBody>
          <div className="list-template-email">
            {!isLoading && listTemplateEmail && listTemplateEmail.length > 0 ? (
              <BoxTable
                name="Mẫu Email"
                titles={titles}
                items={listTemplateEmail}
                dataMappingArray={(item, index) => dataMappingArray(item, index)}
                dataFormat={dataFormat}
                striped={true}
              />
            ) : isLoading ? (
              <Loading />
            ) : (
              isNoItem && (
                <SystemNotification
                  description={
                    <span>
                      Hiện tại chưa có mẫu email nào <br />
                      Hãy thêm mới mẫu email rồi quay lại sau nhé!
                    </span>
                  }
                  type="no-item"
                />
              )
            )}
          </div>
        </ModalBody>
        <ModalFooter actions={actions} />
      </Modal>
    </Fragment>
  );
}
