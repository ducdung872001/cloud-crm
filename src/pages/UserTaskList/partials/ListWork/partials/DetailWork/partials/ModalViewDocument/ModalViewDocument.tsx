import React, { Fragment, useContext, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { handDownloadFileOrigin, showToast } from "utils/common";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import "./ModalViewDocument.scss";

export default function ModalViewDocument(props: any) {
  const { onShow, onHide, dataDoc } = props;

  const [fileContract, setFileContract] = useState([]);

  useEffect(() => {
    if (dataDoc) {
      if (dataDoc.fileUrl.includes(".docx")) {
        setFileContract([
          {
            uri: dataDoc.fileUrl,
            fileType: "docx",
          },
        ]);
      }

      if (dataDoc.fileUrl.includes(".doc")) {
        setFileContract([
          {
            uri: dataDoc.fileUrl,
            fileType: "doc",
          },
        ]);
      }

      if (dataDoc.fileUrl.includes(".pdf") || dataDoc.fileUrl.includes(".PDF")) {
        setFileContract([
          {
            uri: dataDoc.fileUrl,
            fileType: "pdf",
          },
        ]);
      }

      if (dataDoc.fileUrl.includes(".xlsx")) {
        setFileContract([
          {
            uri: dataDoc.fileUrl,
            fileType: "xlsx",
          },
        ]);
      }

      if (dataDoc.fileUrl.includes(".pptx")) {
        setFileContract([
          {
            uri: dataDoc.fileUrl,
            fileType: "pptx",
          },
        ]);
      }
    }
  }, [dataDoc]);

  const handleClearForm = (acc) => {
    onHide(acc);
    setFileContract([]);
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
          {
            title: "Tải File",
            // type: "submit",
            color: "primary",
            // disabled: isSubmit || _.isEqual(formData, values) || validateFieldEmployee,
            // is_loading: isSubmit,
            callback: () => {
              handDownloadFileOrigin(dataDoc.fileUrl, dataDoc.fileName);
            },
          },
        ],
      },
    }),
    [dataDoc]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => handleClearForm(false)}
        className="modal-view-document"
        size="xl"
      >
        <form className="form-view-document">
          <ModalHeader title={dataDoc?.fileName} toggle={() => handleClearForm(false)} />
          <ModalBody>
            <div className="container-view-document">
              <DocViewer
                pluginRenderers={DocViewerRenderers}
                documents={fileContract}
                config={{
                  header: {
                    disableHeader: true,
                    disableFileName: false,
                    retainURLParams: false,
                  },
                }}
                style={{ height: "50rem" }}
              />
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
    </Fragment>
  );
}
