import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { AddContractPipelineModalProps } from "model/contractPipeline/PropsModel";
import { IContractPipelineRequest } from "model/contractPipeline/ContractPipelineRequestModel";
import ContractPipelineService from "services/ContractPipelineService";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import "./ModalAddHandOver.scss";
import Icon from "components/icon";
import ContractService from "services/ContractService";
import ContractPaymentService from "services/ContractPaymentService";
import SelectCustom from "components/selectCustom/selectCustom";

export default function ModalAddHandover(props: any) {
  const { onShow, onHide, data, contractId, detailContractData } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [serviceListOtion, setServiceListOption] = useState([]);

  // useEffect(() => {
  //   if(detailContractData?.products && detailContractData?.products.length > 0){
  //     const products = detailContractData.products.map(item => {
  //       return {
  //         value: item.item?.id,
  //         label: item.item?.code,
  //         nameProduct: item.item.name
  //       }
  //     });

  //     setServiceListOption(products);
  //   }
  // }, [detailContractData])

  const values = useMemo(
    () =>
      ({
        id: data?.id ?? 0,
        nameProduct: data?.item?.name ?? "",
        codeProduct: data?.item?.code ?? "",
        handoverExpectedAt: data?.handoverExpectedAt ?? "",
      } as any),
    [data, contractId]
  );

  const validations: IValidation[] = [
    {
      name: "codeProduct",
      rules: "required",
    },
    {
      name: "handoverExpectedAt",
      rules: "required",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const [dataCode, setDataCode] = useState(null);
  const [checkFieldCode, setCheckFieldCode] = useState(false);

  const loadedOptionCode = async (search, loadedOptions, { page }) => {
    const param: any = {
      keyword: search,
      page: page,
      limit: 10,
    };

    const response = await ContractService.listCodeService(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.code,
                  name: item.name,
                };
              })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const handleChangeCode = (e) => {
    setCheckFieldCode(false);
    setDataCode(e);
    setFormData({ ...formData, values: { ...formData.values, id: e.value, codeProduct: e.label, nameProduct: e.nameProduct } });
  };

  const listFieldBasic = useMemo(
    () =>
      [
        // {
        //   name: "code",
        //   type: "custom",
        //   snippet: (
        //     <SelectCustom
        //       id="code"
        //       name="productId"
        //       label="Mã mặt hàng/dịch vụ"
        //       options={serviceListOtion}
        //       fill={true}
        //       special={true}
        //       value={dataCode}
        //       required={true}
        //       onChange={(e) => handleChangeCode(e)}
        //       // isAsyncPaginate={true}
        //       // isFormatOptionLabel={true}
        //       placeholder="Chọn mã mặt hàng/dịch vụ"
        //       // additional={{
        //       //   page: 1,
        //       // }}
        //       // loadOptionsPaginate={loadedOptionCode}
        //       error={checkFieldCode}
        //       message="Vui lòng chọn mã mặt hàng/dịch vụ"
        //       // isLoading={data?.customerId ? isLoadingCustomer : null}
        //     />
        //   ),
        // },
        {
          label: "Mã mặt hàng/dịch vụ",
          name: "codeProduct",
          type: "text",
          fill: true,
          disabled: true,
          required: true,
        },
        {
          label: "Tên mặt hàng/dịch vụ",
          name: "nameProduct",
          type: "text",
          fill: true,
          disabled: true,
          required: true,
        },

        {
          label: "Ngày bàn giao dự kiến",
          name: "handoverExpectedAt",
          type: "date",
          fill: true,
          required: true,
          // isMaxDate: true,
          placeholder: "Chọn ngày bàn giao dự kiến",
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
        },

        // {
        //     label: "Ngày hiệu lực",
        //     name: "affectedDate",
        //     type: "date",
        //     fill: true,
        //     required: true,
        //     // isMaxDate: true,
        //     placeholder: "Chọn ngày hiệu lực",
        //     icon: <Icon name="Calendar" />,
        //     iconPosition: "left",
        // },

        // {
        //     label: "Số lượng cần nhận",
        //     name: "amount",
        //     type: "number",
        //     fill: true,
        //     required: false,
        //     disabled: false,
        // },
      ] as IFieldCustomize[],
    [formData?.values, dataCode, checkFieldCode, serviceListOtion]
  );

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

    // if(!dataCode){
    //   setCheckFieldCode(true);
    //   return
    // }

    if (!formData.values.handoverExpectedAt) {
      showToast("Vui lòng chọn ngày bàn giao dự kiến", "error");
      return;
    }

    setIsSubmit(true);

    const body = {
      ...(formData.values as any),
      // ...(data ? { id: data.id } : {}),
    };
    console.log("body", body);

    const response = await ContractService.updateHandover(body);

    if (response.code === 0) {
      showToast(`Thêm hạng mục bàn giao thành công`, "success");
      setIsSubmit(false);
      onHide(true);
      setFormData({ values: values, errors: {} });
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
            title: "Huỷ",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData.values, values) ? handleClearForm() : showDialogConfirmCancel();
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
        handleClearForm();
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const handleClearForm = () => {
    onHide(false);
    setDataCode(null);
    setCheckFieldCode(false);
    setFormData({ values: values, errors: {} });
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

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm()}
        className="modal-add-handover"
        size="xl"
      >
        <form className="form-handover-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title={`${data ? "Chỉnh sửa" : "Thêm mới"} hạng mục bàn giao`}
            toggle={() => {
              !isSubmit && handleClearForm();
            }}
          />
          <ModalBody>
            <div className="list-form-group-handover">
              {listFieldBasic.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldBasic, setFormData)}
                  formData={formData}
                />
              ))}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
