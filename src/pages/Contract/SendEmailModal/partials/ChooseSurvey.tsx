import React, { Fragment, useEffect, useMemo, useState } from "react";
import Tippy from "@tippyjs/react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import SurveyFormService from "services/SurveyFormService";
import { showToast } from "utils/common";
import Icon from "components/icon";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IActionModal } from "model/OtherModel";
import "./ChooseSurvey.scss";

interface IChooseSurveyProps {
  onShow: boolean;
  onHide: () => void;
  // takeLink: (link: string) => void
}

export default function ChooseSurvey(props: IChooseSurveyProps) {
  const { onShow, onHide } = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lstSurvey, setLstSurvey] = useState([]);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);

  const handleGetSurvey = async () => {
    setIsLoading(true);

    const response = await SurveyFormService.lst();

    if (response.code === 0) {
      const result = response.result;

      result.length === 0 ? setIsNoItem(true) : setLstSurvey(result);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if(onShow){
      handleGetSurvey();
    }
  }, [onShow]);

  const titles = ["STT", "Tên khảo sát", "Link gốc"];

  const dataFormat = ["text-center", "", "text-center"];

  const handChangeLink = (link, id) => {
    const regex = new RegExp("undefined", "g");
    const result = link.replace(regex, id);

    navigator.clipboard
      .writeText(link)
      .then(() => {
        showToast("Copy link thành công", "success");
        onHide();
      })
      .catch(() => {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      });
  };

  const dataMappingArray = (item, index: number) => [
    index + 1,
    <span key={item.id} style={{ cursor: "pointer", display: "block" }}>
      {item.name}
    </span>,
    <Tippy key={item.id} content="Sao chép link" placement="left">
    <span key={item.id} className="copy__link--org" onClick={() => handChangeLink(item.link, item.id)}>
      <Icon name="Copy" />
    </span>
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
              onHide();
            },
          },
        ],
      },
    }),
    []
  );

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide()} className="modal-choose-survey">
        <div className="box__choose--survey">
          <ModalHeader title={`Chọn phiếu khảo sát`} toggle={() => onHide()} />
          <ModalBody>
            <div className="view__option">
              {!isLoading && lstSurvey && lstSurvey.length > 0 ? (
                <BoxTable
                  name="Đơn vị sản phẩm"
                  titles={titles}
                  items={lstSurvey}
                  dataMappingArray={(item, index) => dataMappingArray(item, index)}
                  dataFormat={dataFormat}
                  striped={true}
                />
              ) : isLoading ? (
                <Loading />
              ) : (
                <SystemNotification description={<span>Hiện tại chưa có phiếu khảo sát nào.</span>} type="no-item" />
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
    </Fragment>
  );
}
