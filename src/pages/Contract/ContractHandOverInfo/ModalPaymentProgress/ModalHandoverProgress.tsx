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
import "./ModalHandoverProgress.scss";
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
import ContractService from "services/ContractService";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import NummericInput from "components/input/numericInput";

export default function ModalHandoverProgress(props: any) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();

  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataHandoverProgress, setDataHandoverProgress] = useState(null);
  const [sumHandoverQuantity, setSumHandoverQuantity] = useState(0);

  const [isAddHandoverProgress, setIsAddHandoverProgress] = useState(false);
  const [params, setParams] = useState({
    name: "",
    limit: 10,
    contractItemId: 0,
  });

  const [isModalCashBook, setIsModalCashBook] = useState(false);

  useEffect(() => {
    if (data && onShow) {
      setParams((preState) => ({ ...preState, contractItemId: data?.id }));
    }
  }, [data, onShow]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "đợt bàn giao thực tế",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const [handoverProgressList, setHandoverProgressList] = useState([]);

  const abortController = new AbortController();

  const getListHandoverProgress = async (paramsSearch: any) => {
    setIsLoading(true);
    let sumQuantity = 0;
    const response = await ContractService.listHandoverProgress(paramsSearch, abortController.signal);

    if (response.code == 0) {
      const result = response.result;
      setHandoverProgressList(result.items);

      result.items?.map((el) => {
        sumQuantity += el.quantity;
      });

      setSumHandoverQuantity(sumQuantity);

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
    getListHandoverProgress(params);
  }, [params]);

  const titles = ["Đợt bàn giao", "Ngày bàn giao thực tế", "Số lượng bàn giao thực tế"];
  const dataFormat = ["text-center", "text-center", "text-center", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    // getPageOffset(params) + index + 1,
    item.name,
    item.handoverAt ? moment(item.handoverAt).format("DD/MM/YYYY") : "",
    formatCurrency(item.quantity, "", ""),
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
      // {
      //     title: "Sửa",
      //     icon: <Icon name="Pencil" />,
      //     callback: () => {
      //         setDataHandoverProgress(item);
      //         setIsAddHandoverProgress(true);
      //     },
      // },
      // {
      //     title: "Xóa",
      //     icon: <Icon name="Trash" className="icon-error" />,
      //     callback: () => {
      //         showDialogConfirmDelete(item);
      //     },
      // },
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
          Bạn có chắc chắn muốn xóa đợt bàn giao đã chọn
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
        const response = await ContractService.deleteHandoverProgress(item.id);
        if (response.code === 0) {
          showToast("Xóa đợt bàn giao thành công", "success");
          getListHandoverProgress(params);
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

  ////Thêm đợt bàn giao

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialogAdd, setShowDialogAdd] = useState<boolean>(false);
  const [contentDialogAdd, setContentDialogAdd] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
      ({
        id: dataHandoverProgress?.id ?? null,
        contractItemId: data?.id,
        // name: dataHandoverProgress?.name,
        name: handoverProgressList?.length + 1,
        handoverAt: dataHandoverProgress?.handoverAt ?? "",
        quantity: dataHandoverProgress?.quantity ?? 0,
      } as any),
    [data, onShow, dataHandoverProgress, handoverProgressList]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
  ];

  //* ngày bắt đầu
  const [checkFieldQuantity, setCheckFieldQuantity] = useState<boolean>(false);
  const handleChangeValueQuantity = (e) => {
    const value = e.floatValue;
    setCheckFieldQuantity(false);
    setFormData({ ...formData, values: { ...formData?.values, quantity: value } });
  };

  const listFieldBasic = useMemo(
    () =>
      [
        {
          label: "Đợt bàn giao",
          name: "name",
          type: "number",
          fill: true,
          required: true,
          disabled: true,
        },

        {
          label: "Ngày bàn giao thực tế",
          name: "handoverAt",
          type: "date",
          fill: true,
          required: true,
          // isMaxDate: true,
          placeholder: "Chọn ngày bàn giao",
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
        },

        // {
        //   name: "handoverAt",
        //   type: "custom",
        //   snippet: (
        //     <DatePickerCustom
        //       label= "Ngày bàn giao thực tế"
        //       name="handoverAt"
        //       fill={true}
        //       value={formData?.values?.handoverAt}
        //       onChange={(e) => handleChangeValueHandoverAt(e)}
        //       placeholder="Chọn ngày bàn giao"
        //       required={true}
        //       iconPosition="left"
        //       icon={<Icon name="Calendar" />}
        //       error={checkFieldHandoverAt || data?.quantity > form}
        //       message={startDay > endDay ? "Ngày bắt đầu nhỏ hơn ngày kết thúc" : "Vui lòng chọn ngày bắt đầu"}
        //     />
        //   ),
        // },

        // {
        //     label: "Số lượng bàn giao",
        //     name: "quantity",
        //     type: "number",
        //     fill: true,
        //     required: true,
        //     disabled: false,
        // },

        {
          name: "quantity",
          type: "custom",
          snippet: (
            <NummericInput
              name="minute"
              label="Số lượng bàn giao"
              value={formData.values?.quantity}
              fill={true}
              placeholder="Số lượng bàn giao"
              // suffixes="Phút"
              onValueChange={(e) => handleChangeValueQuantity(e)}
              error={checkFieldQuantity || formData.values?.quantity > data?.quantity - sumHandoverQuantity}
              message={
                formData.values?.quantity > data?.quantity - sumHandoverQuantity
                  ? `Số lượng bàn giao không được lớn hơn số lượng còn lại (${data?.quantity - sumHandoverQuantity})`
                  : "Vui lòng nhập số lượng bàn giao"
              }
            />
          ),
        },
      ] as IFieldCustomize[],
    [formData?.values, checkFieldQuantity, data, sumHandoverQuantity]
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

    if (!formData.values.quantity) {
      setCheckFieldQuantity(true);
      return;
    }

    setIsSubmit(true);

    const body = {
      ...(formData.values as any),
      // ...(data ? { id: data.id } : {}),
    };

    const response = await ContractService.updateHandoverProgress(body);

    if (response.code === 0) {
      showToast(`${dataHandoverProgress ? "Cập nhật" : "Thêm"} đợt bào giao thực tế thành công`, "success");
      setIsSubmit(false);
      setIsAddHandoverProgress(false);
      getListHandoverProgress(params);
      setDataHandoverProgress(null);
      setFormData({ ...formData, values: values, errors: {} });
      onHide("no_close");
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
            disabled:
              isSubmit ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0) ||
              checkFieldQuantity ||
              formData.values.quantity > data?.quantity - sumHandoverQuantity,
            is_loading: isSubmit,
            callback: () => {
              onSubmit();
            },
          },
        ],
      },
    }),
    [formData, values, isSubmit, data, sumHandoverQuantity]
  );

  const cancelAdd = () => {
    setIsAddHandoverProgress(false);
    setDataHandoverProgress(null);
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
        className="modal-handover-progress"
        size="xl"
      >
        <div className="container-handover-progress">
          <ModalHeader
            title={isAddHandoverProgress ? `${dataHandoverProgress ? "Chỉnh sửa" : "Thêm "} đợt bàn giao thực tế` : `Đợt bàn giao thực tế`}
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
                {isAddHandoverProgress || data?.quantity === sumHandoverQuantity ? null : (
                  <Button
                    // type="submit"
                    color="primary"
                    // disabled={}
                    onClick={() => {
                      setIsAddHandoverProgress(true);
                    }}
                  >
                    Thêm đợt bàn giao thực tế
                  </Button>
                )}
              </div>

              {!isAddHandoverProgress && (
                <div>
                  {!isLoading && handoverProgressList && handoverProgressList.length > 0 ? (
                    <BoxTable
                      name="Đợt bàn giao thực tế"
                      titles={titles}
                      items={handoverProgressList}
                      isPagination={false}
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
                    <SystemNotification description={<span>Hiện tại chưa có đợt bàn giao nào.</span>} type="no-item" />
                  )}
                </div>
              )}

              {isAddHandoverProgress && (
                <div className="box-add-handover-progress">
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
            </div>
          </ModalBody>
          <ModalFooter actions={isAddHandoverProgress ? actionsAdd : actions} />
        </div>
      </Modal>
      <Dialog content={isAddHandoverProgress ? contentDialogAdd : contentDialog} isOpen={isAddHandoverProgress ? showDialogAdd : showDialog} />
    </Fragment>
  );
}
