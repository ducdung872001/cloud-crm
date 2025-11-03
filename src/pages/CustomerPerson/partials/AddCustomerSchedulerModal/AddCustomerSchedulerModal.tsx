import React, { useState, useEffect, useMemo, Fragment, useCallback } from "react";
import moment from "moment";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { AddSchedulerModalProps } from "model/customer/PropsModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { ITreatmentHistoryRequestModel } from "model/treatmentHistory/TreatmentHistoryRequestModel";
import Icon from "components/icon";
import NummericInput from "components/input/numericInput";
import CustomScrollbar from "components/customScrollbar";
import FileUpload from "components/fileUpload/fileUpload";
import SelectCustom from "components/selectCustom/selectCustom";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import { isDifferenceObj } from "reborn-util";
import { showToast } from "utils/common";
import ImageThirdGender from "assets/images/third-gender.png";
import CustomerService from "services/CustomerService";
import EmployeeService from "services/EmployeeService";
import TreatmentHistoryService from "services/TreatmentHistoryService";
import BoughtServiceService from "services/BoughtServiceService";
import "./AddCustomerSchedulerModal.scss";

interface IDataServiceOption {
  value: number;
  serviceId: number;
  label: string;
  avatar: string;
  isCombo: number;
  treatmentNum: number;
  totalTreatment: number;
  cardNumber: string;
  serviceNumber: string;
}

export default function AddCustomerSchedulerModal(props: AddSchedulerModalProps) {
  const { onShow, onHide, dataCustomer } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [detailCustomer, setDetailCustomer] = useState(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);

  const [detailEmployee, setDetailEmployee] = useState(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);

  const [detailService, setDetailService] = useState(null);

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
      } as ITreatmentHistoryRequestModel),
    [detailCustomer, onShow, detailCustomer?.phoneMasked]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const formatOptionLabelCustomer = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const getDetailCustomer = async () => {
    setIsLoadingCustomer(true);

    const response = await CustomerService.detail(dataCustomer?.id);

    console.log("chi tiết 1 khách hàng : ", response);

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
  }, [dataCustomer?.id, onShow]);

  const [listBuyService, setListBuyService] = useState<IDataServiceOption[]>([]);
  const [isLoadingBuyService, setIsLoadingBuyService] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề lấy ra danh sách thẻ dịch vụ đã mua
  const onSelectOpenBuyService = async (idCustomer?: number) => {
    if (!idCustomer) return;

    setIsLoadingBuyService(true);

    const response = await BoughtServiceService.getByCustomerId(idCustomer);

    if (response.code === 0) {
      const dataOption = (response.result || []).filter((item) => item.totalTreatment <= item.treatmentNum);

      setListBuyService([
        ...(dataOption.length > 0
          ? dataOption.map((item) => {
              return {
                value: item.id,
                serviceId: item.serviceId,
                label: item.serviceName,
                avatar: item.serviceAvatar,
                isCombo: item.isCombo,
                treatmentNum: item.treatmentNum,
                totalTreatment: item.totalTreatment,
                serviceNumber: item.serviceNumber,
                cardNumber: item.cardNumber,
              };
            })
          : []),
      ]);

      // const takeDetailService = dataOption.find(
      //   (item) =>
      //     (item.serviceNumber && item.serviceNumber == dataCustomer?.serviceNumber) ||
      //     (item.cardNumber && item.cardNumber == dataCustomer?.cardNumber)
      // );

      // if (takeDetailService?.isCombo >= 1) {
      //   setDetailService({
      //     value: takeDetailService?.id,
      //     serviceId: takeDetailService?.serviceId,
      //     label: takeDetailService.serviceName,
      //     avatar: takeDetailService.serviceAvatar,
      //     isCombo: takeDetailService.isCombo,
      //     treatmentNum: takeDetailService.treatmentNum,
      //     totalTreatment: takeDetailService.totalTreatment,
      //     serviceNumber: dataCustomer?.serviceNumber ? dataCustomer?.serviceNumber : takeDetailService.serviceNumber,
      //     cardNumber: dataCustomer?.cardNumber ? dataCustomer?.cardNumber : takeDetailService.cardNumber,
      //   });
      // }
    }

    setIsLoadingBuyService(false);
  };

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
