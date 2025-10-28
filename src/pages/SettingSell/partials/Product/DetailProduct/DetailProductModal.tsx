import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { capitalize, isDifferenceObj, removeHtmlTags } from "reborn-util";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast } from "utils/common";
import "./DetailProductModal.scss";
import RebornEditor from "components/editor/reborn";
import { serialize } from "utils/editor";
import _ from "lodash";
import ProductService from "services/ProductService";

export default function DetailProductModal(props: any) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
      ({
        id: data?.id,
        content: data?.content ?? "",
      } as any),
    [onShow, data]
  );

  const validations: IValidation[] = [];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const getDetailProduct = async (id: number) => {
    const response = await ProductService.detail(id);

    if (response.code === 0) {
      const result = response.result;
      setContent(result.content || "");
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    if (data?.id && onShow) {
      getDetailProduct(data.id);
    }
  }, [data, onShow]);

  //! lấy nội dung email
  const [content, setContent] = useState<string>("");

  //! đoạn này thay đổi giá trị văn bản
  const handleChangeContentEmail = (dataConent) => {
    const convertContent = serialize({ children: dataConent });
    setContent(convertContent);
    setValidateContent(false);
    // setFormData({ ...formData, values: { ...formData?.values, content: convertContent } });
  };

  const [validateContent, setValidateContent] = useState<boolean>(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    setIsSubmit(true);

    const body = {
      id: data?.id,
      content: content,
    };

    console.log("body", body);

    const response = await ProductService.updateContent(body);

    if (response.code === 0) {
      showToast("Cập nhật nội dung thành công", "success");
      onHide(true);
      setTimeout(() => {
        setContent("");
      }, 1000);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData.values, values) ? clearForm() : showDialogConfirmCancel();
            },
          },
          {
            title: "Cập nhật",
            type: "submit",
            color: "primary",
            disabled: isSubmit || validateContent,
            //   || (!isDifferenceObj(formData.values, values) && formData.values?.status !== '4' && !percentProp)
            //   || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, formData, validateContent]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        clearForm();
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const clearForm = () => {
    onHide(false);
    setTimeout(() => {
      setContent("");
    }, 1000);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && clearForm()}
        className="modal-detail-product"
        size="xl"
      >
        <form className="form-detail-product" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title="Chi tiết sản phẩm" toggle={() => !isSubmit && clearForm()} />
          <ModalBody>
            <div className="wrapper-detail-product">
              {/* Nội dung chi tiết */}
              <div className="form-group">
                {/* TODO: lỗi phần này do trình soạn thảo */}
                <RebornEditor
                  name="content"
                  fill={true}
                  initialValue={content ? content : ""}
                  // dataText={dataCodeEmail}
                  onChangeContent={(e) => handleChangeContentEmail(e)}
                  error={validateContent}
                  // message="Nội dung của bạn chưa có link thu thập VOC"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
