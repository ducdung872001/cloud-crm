import React, { Fragment, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import { handleChangeValidate } from "utils/validate";
import "./ModalAddNameFilter.scss";
import _, { lowerCase } from "lodash";
import { showToast } from "utils/common";

export default function ModalAddNameFilter(props: any) {
  const { 
    onShow, 
    onHide,
    listFilterOption,
    setListFilterOption,
    employeeId,
    dataFilter,
    dataStatusCashloan,
    dataStatusCreditline
} = props;
  
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  useEffect(() => {
   
  }, [onShow])

  const values = useMemo(
    () => ({
        name: '',
    }),
    [ onShow]
  );

  const validations: IValidation[] = [];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const listField = useMemo(
    () =>
      [
        {
            label: "",
            name: "name",
            type: "text",
            placeholder: "Nhập tên bộ lọc",
            fill: true,
        },
       
      ] as IFieldCustomize[],
    [ formData]
  );

  useEffect(() => {
    setFormData({ ...formData, values: values });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = (e) => {
    e && e.preventDefault();
    // setListFilterOption()
    if(listFilterOption.filter(el => _.isEqual(lowerCase(el.name), lowerCase(formData?.values.name))).length > 0 ){
        showToast("Tên bộ lọc đã tồn tại trong hệ thống", "error");
        return;
    }
    if(listFilterOption.filter(el => _.isEqual(el.data, dataFilter)).length > 0 ){
        showToast("Bộ lọc đã tồn tại trong hệ thống", "error");
        return;
    }

    const newDataCashloan = dataStatusCashloan.map(item => {
      return {
        fieldName: 'Trangthaikhoanvaycashloan',
        attributeValue: item.value
      }
    })

    const newDataCreditline = dataStatusCreditline.map(item => {
      return  {
        fieldName: 'Trangthaikhoanvaycreditline',
        attributeValue: item.value
      }
    })

    const dataFilterAdvance = {
      ...dataFilter,
      ...((dataStatusCashloan?.length > 0 || dataStatusCreditline?.length > 0) ? {customerExtraInfo: [...newDataCashloan, ...newDataCreditline]} : {}), 
    }
    
    const dataFilterNew = {
        employeeId: employeeId,
        name: formData?.values.name,
        data: dataFilterAdvance
    }
   
    const listFilter = [...listFilterOption, dataFilterNew];
   
    setListFilterOption(listFilter);
    
    // localStorage.setItem("employeeId_local", JSON.stringify(employeeId));
    localStorage.setItem(`listFilterOption_${employeeId}`, JSON.stringify(listFilter));
    showToast(`Thêm mới bộ lọc thành công`,"success");
    clearForm();
  };

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>Hủy bỏ thao tác tìm kiếm</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        setShowDialog(false);
        setContentDialog(null);
        clearForm();
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
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
              !isDifferenceObj(formData.values, values) ? clearForm() : showDialogConfirmCancel();
            },
          },
          {
            title: "Lưu",
            type: "submit",
            color: "primary",
            disabled: isSubmit || (!isDifferenceObj(formData.values, values) && !formData.values.branchId),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
  );

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
          clearForm();
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

  const clearForm = () => {
    onHide();
  }

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => {
          if (!isSubmit) {
            clearForm()
          }
        }}
        className="modal-add-name-filter"
        // size="lg"
      >
        <form className="form-add-name-filter" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title="Tên bộ lọc"
            toggle={() => {
              if (!isSubmit) {
                clearForm()
              }
            }}
          />
          <ModalBody>
            <div className="list-form-group">
              {listField.map((field, index) => (
                <FieldCustomize
                  key={index}
                  field={field}
                  handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
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
