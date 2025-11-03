import React, { Fragment, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import "./ModalHistorySignature.scss";
import ViewHistorySignature from "pages/Common/ViewHistorySignature";
import { convertToId } from "reborn-util";
import { handDownloadFileOrigin } from "utils/common";
import ModalSendEmail from "./partials/ModalSendEmail";

export default function ModalHistorySignature(props: any) {
  const { onShow, onHide, dataContract, dataProps } = props;

  const [tab, setTab] = useState("tab_four");
  const [showModalSendEmail, setShowModalSendEmail] = useState(false);

  const handleClearForm = (acc) => {
    onHide(acc);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            // disabled: isSubmit,
            callback: () => {
              handleClearForm(false);
            },
          },
          ...(tab === "tab_four" && dataContract?.template
            ? ([
                {
                  title: "Tải xuống",
                  type: "submit",
                  color: "primary",
                  disabled: false,
                  // is_loading: isSubmit,
                  callback: () => {
                    let fieldName = convertToId(dataContract.name) || "";
                    fieldName = fieldName.replace(new RegExp(`[^A-Za-z0-9]`, "g"), "");

                    const type = dataContract?.template?.includes(".docx")
                      ? "docx"
                      : dataContract?.template?.includes(".xlsx")
                      ? "xlsx"
                      : dataContract?.template?.includes(".pdf")
                      ? "pdf"
                      : dataContract?.template?.includes(".pptx")
                      ? "pptx"
                      : dataContract?.template?.includes(".zip")
                      ? "zip"
                      : "rar";
                    const name = `${fieldName}.${type}`;

                    handDownloadFileOrigin(dataContract?.template, name);
                  },
                },
              ] as any)
            : []),

          ...(tab === "tab_four" && dataContract?.template
            ? ([
                {
                  title: "Gửi Email",
                  color: "primary",
                  // disabled: isSubmit,
                  callback: () => {
                    setShowModalSendEmail(true);
                  },
                },
              ] as any)
            : []),
        ],
      },
    }),
    [tab, dataContract]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => handleClearForm(false)}
        className="modal-history-signature"
        size="xl"
      >
        <div className="form-history-signature">
          <ModalHeader title={`Lịch sử ký`} toggle={() => handleClearForm(false)} />
          <ModalBody>
            <div className="box-history-signature">
              <div className="card-box d-flex flex-column">
                <ViewHistorySignature
                  type="contract"
                  onShow={onShow}
                  data={dataContract}
                  contractTemplate={true}
                  callback={(dataTab) => {
                    setTab(dataTab);
                  }}
                  onHide={() => {
                    //
                  }}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>

      <ModalSendEmail
        onShow={showModalSendEmail}
        dataContract={dataContract}
        customerIdlist={dataContract?.customerId ? [dataContract?.customerId] : []}
        onHide={(reload) => {
          // onReload(true)
          // if (reload) {
          //     onReload(true)
          // } else {
          //     // handleUpdateStatusFail(dataWork);
          // }
          setShowModalSendEmail(false);
        }}
      />
    </Fragment>
  );
}
