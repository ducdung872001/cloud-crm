import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IAction, IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { convertToId, formatCurrency, getPageOffset, isDifferenceObj } from "reborn-util";
import "./PaymentProgress.scss";
import Icon from "components/icon";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Loading from "components/loading";
import { SelectOptionData } from "utils/selectCommon";
import moment from "moment";
import { uploadDocumentFormData } from "utils/document";
import ContractAttachmentService from "services/ContractAttachmentService";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import Button from "components/button/button";
import BoxTable from "components/boxTable/boxTable";
import { useNavigate } from "react-router-dom";
import ContractPaymentService from "services/ContractPaymentService";
import Badge from "components/badge/badge";
import AddCashBookModal from "./AddCashBookModal/AddCashBookModal";

export default function PaymentProgress(props: any) {
  const { onShow, onHide, data } = props;
  const focusedElement = useActiveElement();

  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataPaymentProgress, setDataPaymentProgress] = useState(null);

  const [isAddPaymentProgress, setIsAddPaymentProgress] = useState(false);
  const [params, setParams] = useState({
    name: "",
    limit: 10,
  });

  const [isModalCashBook, setIsModalCashBook] = useState(false);

  useEffect(() => {
    if (data && onShow) {
      setParams((preState) => ({ ...preState, contractId: data?.contractId }));
    }
  }, [data, onShow]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "đợt thanh toán",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const [paymentProgressList, setPaymentProgressList] = useState([]);

  const abortController = new AbortController();

  const getListPaymentProgress = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await ContractPaymentService.list(paramsSearch, abortController.signal);

    if (response.code == 0) {
      const result = response.result;
      setPaymentProgressList(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (onShow) {
      getListPaymentProgress(params);
    }
  }, [params, onShow]);

  const titles = ["Đợt", "Ngày thanh toán", "Cần thanh toán", "Thực trả", "Trạng thái"];
  const dataFormat = ["text-center", "text-center", "text-right", "text-right", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    // getPageOffset(params) + index + 1,
    item.paymentBatch,
    item.paymentDate ? moment(item.paymentDate).format("DD/MM/YYYY") : "",
    formatCurrency(item.amount),
    item.realAmount,

    <Badge
      key={index}
      variant={item.status === 1 ? "success" : item.status === 0 ? "warning" : item.status === 2 ? "error" : "transparent"}
      text={item.status === 1 ? "Đã thanh toán" : item.status === 0 ? "Chưa thanh toán" : item.status === 2 ? "Còn nợ" : ""}
    />,
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
      ...(item.status !== 1
        ? [
            {
              title: "Thanh toán",
              icon: <Icon name="ReceiveMoney" />,
              callback: () => {
                setDataPaymentProgress(item);
                // setIsAddPaymentProgress(true);
                setIsModalCashBook(true);
              },
            },
          ]
        : []),
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataPaymentProgress(item);
          setIsAddPaymentProgress(true);
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className="icon-error" />,
        callback: () => {
          showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const showDialogConfirmDelete = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa đợt thanh toán đã chọn
          {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: async () => {
        const response = await ContractPaymentService.delete(item.id);
        if (response.code === 0) {
          showToast("Xóa đợt thanh toán thành công", "success");
          getListPaymentProgress(params);
        } else {
          showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        }
        setShowDialog(false);
        setContentDialog(null);
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
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => {
              onHide();
            },
          },
          //   {
          //     title:  "Xác nhận",
          //     // type: "submit",
          //     color: "primary",
          //     disabled: lstAttributeSelected?.length > 0 ? false : true,
          //     // is_loading: isSubmit,
          //     callback: () => {
          //       handleSubmit(lstAttributeSelected)
          //     },
          //   },
        ],
      },
    }),
    []
  );

  ////Thêm đợt thanh toán

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialogAdd, setShowDialogAdd] = useState<boolean>(false);
  const [contentDialogAdd, setContentDialogAdd] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
      ({
        id: dataPaymentProgress?.id ?? 0,
        paymentDate: dataPaymentProgress?.paymentDate ?? "",
        amount: dataPaymentProgress?.amount ?? 0,
        paymentBatch: dataPaymentProgress?.paymentBatch ?? "",
        attachments: dataPaymentProgress?.attachments ?? "",
        status: dataPaymentProgress?.status?.toString() ?? "0",
        type: dataPaymentProgress?.type?.toString() ?? "1",
        contractId: data?.contractId,
      } as any),
    [data, onShow, dataPaymentProgress]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const validations: IValidation[] = [
    {
      name: "paymentBatch",
      rules: "required",
    },
    {
      name: "paymentDate",
      rules: "required",
    },
    {
      name: "amount",
      rules: "required|min:0",
    },
  ];

  const listFieldBasic = useMemo(
    () =>
      [
        {
          label: "Kế hoạch thanh toán",
          name: "paymentBatch",
          type: "number",
          fill: true,
          required: true,
        },

        {
          label: "Ngày thanh toán",
          name: "paymentDate",
          type: "date",
          fill: true,
          required: true,
          // isMaxDate: true,
          placeholder: "Chọn ngày thanh toán",
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
        },

        {
          label: "Số tiền thanh toán",
          name: "amount",
          type: "number",
          fill: true,
          required: true,
          disabled: false,
        },
        // {
        //   label: "Loại thanh toán",
        //   name: "type",
        //   type: "radio",
        //   options: [
        //     {
        //       value: '1',
        //       label: "Thu",
        //     },
        //     {
        //       value: '2',
        //       label: "Chi",
        //     },
        //   ],
        //   fill: true,
        // },

        // {
        //     label: "Trạng thái",
        //     name: "status",
        //     type: "radio",
        //     options: [
        //       {
        //         value: '0',
        //         label: "Chưa thanh toán",
        //       },
        //       {
        //         value: '1',
        //         label: "Đã thanh toán",
        //       },
        //       {
        //         value: '2',
        //         label: "Còn nợ",
        //       },
        //     ],
        //     fill: true,
        //   },
      ] as IFieldCustomize[],
    [formData?.values]
  );

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async () => {
    const errors = Validate(validations, formData, [...listFieldBasic]);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmit(true);

    const body = {
      ...(formData.values as any),
      // ...(data ? { id: data.id } : {}),
    };

    const response = await ContractPaymentService.update(body);

    if (response.code === 0) {
      showToast(`${dataPaymentProgress ? "Cập nhật" : "Thêm"} kế hoạch thanh toán thành công`, "success");
      setIsSubmit(false);
      setIsAddPaymentProgress(false);
      getListPaymentProgress(params);
      setDataPaymentProgress(null);
      setFormData({ ...formData, values: values, errors: {} });
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const actionsAdd = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Quay lại",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData.values, values) ? cancelAdd() : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
            callback: () => {
              onSubmit();
            },
          },
        ],
      },
    }),
    [formData, values, isSubmit]
  );

  const cancelAdd = () => {
    setIsAddPaymentProgress(false);
    setDataPaymentProgress(null);
    setFormData({ ...formData, values: values, errors: {} });
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
        setShowDialogAdd(false);
        setContentDialogAdd(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        cancelAdd();
        setShowDialogAdd(false);
        setContentDialogAdd(null);
      },
    };
    setContentDialogAdd(contentDialog);
    setShowDialogAdd(true);
  };

  const checkKeyDown = useCallback(
    (e) => {
      const { keyCode } = e;
      if (keyCode === 27 && !showDialogAdd) {
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

  ///Tạo phiếu thu

  const [isAddCashbook, setIsAddCashbook] = useState(false);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => {
          if (!isSubmit) {
            cancelAdd();
            onHide();
          }
        }}
        className="modal-payment-progress"
        size="lg"
      >
        <div className="container-payment-progress">
          <ModalHeader
            title={isAddPaymentProgress ? `${dataPaymentProgress ? "Chỉnh sửa" : "Thêm "} kế hoạch thanh toán` : `Tiến độ thanh toán`}
            toggle={() => {
              if (!isSubmit) {
                cancelAdd();
                onHide();
              }
            }}
          />
          <ModalBody>
            <div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10, marginRight: 10 }}>
                {isAddPaymentProgress ? null : (
                  <Button
                    // type="submit"
                    color="primary"
                    // disabled={}
                    onClick={() => {
                      setIsAddPaymentProgress(true);
                    }}
                  >
                    Thêm kế hoạch thanh toán
                  </Button>
                )}
              </div>

              {!isAddPaymentProgress && (
                <div>
                  {!isLoading && paymentProgressList && paymentProgressList.length > 0 ? (
                    <BoxTable
                      name="Tiến độ thanh toán"
                      titles={titles}
                      items={paymentProgressList}
                      isPagination={true}
                      dataPagination={pagination}
                      dataMappingArray={(item, index) => dataMappingArray(item, index)}
                      dataFormat={dataFormat}
                      // listIdChecked={listIdChecked}
                      isBulkAction={true}
                      // bulkActionItems={bulkActionList}
                      striped={true}
                      // setListIdChecked={(listId) => setListIdChecked(listId)}
                      actions={actionsTable}
                      actionType="inline"
                    />
                  ) : isLoading ? (
                    <Loading />
                  ) : (
                    <SystemNotification description={<span>Hiện tại chưa có đợt thanh toán nào.</span>} type="no-item" />
                  )}
                </div>
              )}

              {isAddPaymentProgress && (
                <div className="box-add-payment-progress">
                  <div className="list-form-group">
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
              )}

              {isAddCashbook && <div className="box-add-cashbook"></div>}
            </div>
          </ModalBody>
          <ModalFooter actions={isAddPaymentProgress ? actionsAdd : actions} />
        </div>
      </Modal>
      <AddCashBookModal
        onShow={isModalCashBook}
        dataCashBook={null}
        dataContractPayment={dataPaymentProgress}
        type={1}
        onHide={(reload) => {
          if (reload) {
            // getListCashBook(params);
          }
          setIsModalCashBook(false);
        }}
      />
      <Dialog content={isAddPaymentProgress ? contentDialogAdd : contentDialog} isOpen={isAddPaymentProgress ? showDialogAdd : showDialog} />
    </Fragment>
  );
}
