import React, { useState, useEffect, useMemo, Fragment } from "react";

import { IFormData } from "model/FormModel";
import { AddSchedulerModalProps } from "model/customer/PropsModel";
import Modal, { ModalHeader } from "components/modal/modal";
import CustomerService from "services/CustomerService";
import "./AddCustomerSchedulerModal.scss";

export default function AddCustomerSchedulerModal(props: AddSchedulerModalProps) {
  const { onShow, onHide, dataCustomer } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [detailCustomer, setDetailCustomer] = useState(null);
  const [, setIsLoadingCustomer] = useState<boolean>(false);

  const [, setDetailEmployee] = useState(null);

  const [, setDetailService] = useState(null);

  const values = useMemo(
    () =>
      ({
        customerId: dataCustomer?.id,
        customerPhone: detailCustomer?.phoneMasked ?? "",
        serviceId: detailCustomer?.serviceId ?? null,
        treatmentStart: detailCustomer?.treatmentStart ?? "",
        treatmentEnd: detailCustomer?.treatmentEnd ?? "",
        procDesc: detailCustomer?.procDesc ?? "",
        afterProof: detailCustomer?.afterProof ?? "",
        prevProof: detailCustomer?.prevProof ?? "",
        scheduleNext: detailCustomer?.scheduleNext ?? "",
        employeeId: detailCustomer?.employeeId ?? null,
        note: detailCustomer?.note ?? "",
        treatmentTh: detailCustomer?.treatmentTh + detailCustomer?.treatmentNum ?? 0,
        serviceNumber: detailCustomer?.serviceNumber ?? null,
        cardNumber: detailCustomer?.cardNumber ?? null,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [detailCustomer, onShow, detailCustomer?.phoneMasked]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const getDetailCustomer = async () => {
    setIsLoadingCustomer(true);

    const response = await CustomerService.detail(dataCustomer?.id);

    if (response.code === 0) {
      const result = response.result;

      const detailData = {
        value: result.id,
        label: result.name,
        avatar: result.avatar,
        phoneMasked: result.phoneMasked,
      };

      setDetailCustomer(detailData);
    }

    setIsLoadingCustomer(false);
  };

  useEffect(() => {
    if (dataCustomer?.id && onShow) {
      getDetailCustomer();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataCustomer?.id, onShow]);

  const onSubmit = async (e) => {
    e && e.preventDefault();

    // const errors = Validate(validations, formData, listField);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-scheduler"
      >
        <form className="form-treament-history-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader
            title="Thêm mới lịch điều trị"
            toggle={() => {
              !isSubmit && onHide(false);
              !isSubmit && setDetailCustomer(null);
              !isSubmit && setDetailEmployee(null);
              !isSubmit && setDetailService(null);
            }}
          />
        </form>
      </Modal>
    </Fragment>
  );
}
