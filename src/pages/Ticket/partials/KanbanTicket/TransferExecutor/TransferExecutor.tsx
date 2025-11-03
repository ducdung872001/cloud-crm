import React, { Fragment, useState, useEffect, useMemo, useContext } from "react";
import { ContextType, UserContext } from "contexts/userContext";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { ITransferExecutorProps } from "model/ticket/PropsModel";
import { ITicketProcessRequestModel } from "model/ticket/TicketRequestModel";
import EmployeeService from "services/EmployeeService";
import TicketService from "services/TicketService";
import { showToast } from "utils/common";
import Validate, { handleChangeValidate } from "utils/validate";

export default function TransferExecutor(props: ITransferExecutorProps) {
  const { onShow, onHide, data, idStatusTicket, idTicket } = props;

  const { name } = useContext(UserContext) as ContextType;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [listEmployee, setListEmployee] = useState<IOption[]>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);

  // Chọn nhân viên tiếp nhận
  const onSelectOpenEmployee = async () => {
    const param = {
      limit: 10000,
    };
    if (!listEmployee || listEmployee.length === 0) {
      setIsLoadingEmployee(true);

      const response = await EmployeeService.list(param);
      if (response.code === 0) {
        const result = response.result.items;
        const dataOption = (result || []).filter((item) => item.name !== name);
        setListEmployee([
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                };
              })
            : []),
        ]);
      }

      setIsLoadingEmployee(false);
    }
  };

  useEffect(() => {
    if (onShow) {
      onSelectOpenEmployee();
    }
  }, [onShow]);

  const values = useMemo(
    () =>
      ({
        id: idStatusTicket ?? 0,
        executorId: data?.executorId ?? null,
        statusId: data?.statusId ?? 0,
        ticketId: idTicket ?? 0,
      } as ITicketProcessRequestModel),
    [onShow, data, idStatusTicket, idTicket]
  );

  const validations: IValidation[] = [
    {
      name: "executorId",
      rules: "required",
    },
  ];

  const listField: IFieldCustomize[] = [
    {
      label: "Người thực hiện tiếp theo",
      name: "executorId",
      type: "select",
      fill: true,
      required: true,
      options: listEmployee,
      onMenuOpen: onSelectOpenEmployee,
      isLoading: isLoadingEmployee,
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);

    const body: ITicketProcessRequestModel = {
      ...(formData.values as ITicketProcessRequestModel),
    };

    const response = await TicketService.ticketProcessUpdate(body);

    if (response.code === 0) {
      showToast("Chuyển người thực hiện thành công", "success");
      onHide(true);
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
              onHide(true);
            },
          },
          {
            title: "Xác nhận",
            type: "submit",
            color: "primary",
            disabled: isSubmit || formData.values.executorId === 0,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, formData.values]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-transfer-executor"
      >
        <form className="form-transfer-executor" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title="Chọn người thực hiện tiếp theo" toggle={() => !isSubmit && onHide(false)} />
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
    </Fragment>
  );
}
