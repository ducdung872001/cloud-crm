import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IBeautyBranchRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import { showToast } from "utils/common";
import { createArrayFromTo, getMaxDay, isDifferenceObj } from "reborn-util";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import "./AddCxmQuestion.scss";
import BuildingFloorService from "services/BuildingFloorService";
import CxmQuestionService from "services/CxmQuestionService";

export default function AddCxmQuestion(props: any) {
  const { onShow, onHide, data, dataSurvey } = props;

  const focusedElement = useActiveElement();
  const checkUserRoot = localStorage.getItem("user.root");
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  // + text
  // + single_choice
  // + multiple_choice
  // + rating
  // + yes/no
  // + dropdown
  // + date
  // + file_upload
  const optionQuestionType = [
    {
      value: "text",
      label: "Bằng văn bản",
    },
    {
      value: "single_choice",
      label: "Chọn một đáp án",
    },
    {
      value: "multiple_choice",
      label: "Chọn nhiều đáp án",
    },
    {
      value: "rating",
      label: "Đánh giá trên thang điểm",
    },
    {
      value: "yes/no",
      label: "Có/Không",
    },
    {
      value: "dropdown",
      label: "Dropdown",
    },
    {
      value: "date",
      label: "Ngày",
    },
    {
      value: "file_upload",
      label: "File upload",
    },
  ];

  const values = useMemo(
    () =>
      ({
        questionText: data?.questionText ?? "",
        questionType: data?.questionType ?? "",
        surveyId: dataSurvey?.id ?? "",
      } as any),
    [data, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "questionText",
      rules: "required",
    },
    {
      name: "questionType",
      rules: "required",
    },
  ];

  const listFieldBasic = useMemo(
    () =>
      [
        {
          label: "Nội dung câu hỏi",
          name: "questionText",
          type: "textarea",
          fill: true,
          required: true,
        },
        {
          label: "Dạng câu hỏi",
          name: "questionType",
          type: "select",
          options: optionQuestionType,
          fill: true,
          required: true,
        },
      ] as IFieldCustomize[],
    []
  );

  //! đoạn này xử lý lấy ngày
  const [days, setDays] = useState<any[]>(
    createArrayFromTo(1, 28).map((item, idx) => {
      if (item < 10) {
        return {
          value: +`0${item}`,
          label: `0${item}`,
        };
      }

      return {
        value: +item,
        label: item,
      };
    })
  );
  const [formData, setFormData] = useState<IFormData>({ values: values });

  //* Nếu như mà đã chọn tháng hoặc năm rồi thì fill lại lựa chọn ngày theo tháng hoặc năm đó
  useEffect(() => {
    if (+formData?.values?.foundingMonth > 0 || formData.values.foundingYear > 0) {
      const result = createArrayFromTo(1, getMaxDay(+formData?.values?.foundingYear, +formData?.values?.foundingMonth)).map((item, idx) => {
        if (item < 10) {
          return {
            value: +`0${item}`,
            label: `0${item}`,
          };
        }

        return {
          value: +item,
          label: item,
        };
      });

      setDays(result);
    }
  }, [formData.values.foundingMonth, formData?.values?.foundingYear]);

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, [...listFieldBasic]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);
    const body: IBeautyBranchRequest = {
      ...(formData.values as IBeautyBranchRequest),
      ...(data ? { id: data.id } : {}),
    };

    const response = await CxmQuestionService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} câu hỏi thành công`, "success");
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${data ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        onHide(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const checkKeyDown = useCallback(
    (e) => {
      const { keyCode } = e;
      if (keyCode === 27 && !showDialog) {
        if (isDifferenceObj(formData.values, values)) {
          showDialogConfirmCancel();
          if (focusedElement instanceof HTMLElement) {
            focusedElement.blur();
          }
        } else {
          onHide(false);
        }
      }
    },
    [formData]
  );

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);

    return () => {
      window.removeEventListener("keydown", checkKeyDown);
    };
  }, [checkKeyDown]);

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
              !isDifferenceObj(formData.values, values) ? onHide(false) : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-cxm_question"
      >
        <form className="form-cxm_question-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} câu hỏi ${dataSurvey?.name || ""}`} toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-basic-info-cxm_question">
                {listFieldBasic.map((field, index) => (
                  <FieldCustomize
                    key={index}
                    field={field}
                    handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBasic, setFormData)}
                    formData={formData}
                  />
                ))}
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
