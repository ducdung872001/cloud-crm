import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IAction, IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { handDownloadFileOrigin, showToast } from "utils/common";
import { convertToId, getPageOffset, isDifferenceObj } from "reborn-util";
import "./ModalAppendix.scss";
import Icon from "components/icon";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Loading from "components/loading";
import { SelectOptionData } from "utils/selectCommon";
import { uploadDocumentFormData } from "utils/document";
import ContractAttachmentService from "services/ContractAttachmentService";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import Button from "components/button/button";
import BoxTable from "components/boxTable/boxTable";
import ContractService from "services/ContractService";
import moment from "moment";

export default function ModalAppendix(props: any) {
  const { onShow, onHide, data } = props;
  const focusedElement = useActiveElement();

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataAppendix, setDataAppendix] = useState(null);

  const [isAddAppendix, setIsAddAppendix] = useState(false);
  const [params, setParams] = useState({
    name: "",
    limit: 10,
  });

  useEffect(() => {
    if (data && onShow) {
      setParams((preState) => ({ ...preState, contractId: data?.contractId }));
    }
  }, [data, onShow]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "phụ lục",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const [appendixList, setAppendixList] = useState([]);

  const abortController = new AbortController();

  const getListAppendix = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await ContractService.contractAppendixList(paramsSearch, abortController.signal);

    if (response.code == 0) {
      const result = response.result;
      setAppendixList(result.items);

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
      getListAppendix(params);
    }
  }, [params, onShow]);

  const titlesAppendx = ["STT", "Tên phụ lục", "Số phụ lục", "Ngày hiệu lực"];
  const dataFormatAppendix = ["text-center", "", "", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.name,
    item.appendixNo,
    item.affectedDate ? moment(item.affectedDate).format("DD/MM/YYYY") : "",
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataAppendix(item);
          setIsAddAppendix(true);
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
        <Fragment>Bạn có chắc chắn muốn xóa phụ lục đã chọn {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.</Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: async () => {
        const response = await ContractService.contractAppendixDelete(item.id);
        if (response.code === 0) {
          showToast("Xóa phụ lục thành công", "success");
          getListAppendix(params);
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

  ////Thêm tài liệu

  const [isSubmitAppendix, setIsSubmitAppendix] = useState(false);
  const [showDialogAdd, setShowDialogAdd] = useState<boolean>(false);
  const [contentDialogAdd, setContentDialogAdd] = useState<IContentDialog>(null);

  const valueAppendix = useMemo(
    () =>
      ({
        id: dataAppendix?.id ?? 0,
        name: dataAppendix?.name ?? "",
        appendixNo: dataAppendix?.appendixNo ?? "",
        affectedDate: dataAppendix?.affectedDate ?? "",
        content: dataAppendix?.content ?? "",
        changeRequest: dataAppendix?.changeRequest ?? "price",
        attachments: "",
        contractId: dataAppendix?.contractId ?? data?.contractId,
      } as any),
    [dataAppendix, isAddAppendix, data]
  );

  const validationsAppendx: IValidation[] = [
    {
      name: "appendixNo",
      rules: "required",
    },
  ];

  const [formDataAppendix, setFormDataAppendix] = useState<IFormData>({ values: valueAppendix });

  const listFieldAppendix = useMemo(
    () =>
      [
        {
          label: "Tên phụ lục",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Số phụ lục",
          name: "appendixNo",
          type: "text",
          fill: true,
          required: true,
        },

        {
          label: "Ngày hiệu lực",
          name: "affectedDate",
          type: "date",
          fill: true,
          required: true,
          // isMaxDate: true,
          placeholder: "Chọn ngày hiệu lực",
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
        },

        {
          label: "Loại thay đổi",
          name: "changeRequest",
          type: "radio",
          options: [
            {
              value: "price",
              label: "Phụ lục thay đổi giá",
            },
            {
              value: "extend",
              label: "Phụ lục gia hạn hợp đồng",
            },
            {
              value: "other",
              label: "Phụ lục thay đổi thông tin điều khoản",
            },
          ],
          fill: true,
        },

        {
          label: "Nội dung thay đổi",
          name: "content",
          type: "textarea",
          fill: true,
        },
      ] as IFieldCustomize[],
    [formDataAppendix?.values]
  );

  useEffect(() => {
    setFormDataAppendix({ ...formDataAppendix, values: valueAppendix, errors: {} });
    setIsSubmitAppendix(false);

    return () => {
      setIsSubmitAppendix(false);
    };
  }, [valueAppendix]);

  const onSubmitAppendix = async () => {
    // e.preventDefault();

    const errors = Validate(validationsAppendx, formDataAppendix, [...listFieldAppendix]);
    if (Object.keys(errors).length > 0) {
      setFormDataAppendix((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmitAppendix(true);

    const body = {
      ...(formDataAppendix.values as any),
      // ...(data ? { id: data.id } : {}),
    };

    const response = await ContractService.contractAppendixUpdate(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm"} phụ lục hợp đồng thành công`, "success");
      setIsSubmitAppendix(false);
      getListAppendix(params);
      cancelAdd();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmitAppendix(false);
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
            disabled: isSubmitAppendix,
            callback: () => {
              !isDifferenceObj(formDataAppendix.values, valueAppendix) ? cancelAdd() : showDialogConfirmCancel();
            },
          },
          {
            title: dataAppendix ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmitAppendix ||
              !isDifferenceObj(formDataAppendix.values, valueAppendix) ||
              (formDataAppendix.errors && Object.keys(formDataAppendix.errors).length > 0),
            is_loading: isSubmitAppendix,
            callback: () => {
              onSubmitAppendix();
            },
          },
        ],
      },
    }),
    [formDataAppendix, valueAppendix, isSubmitAppendix]
  );

  const handleClearForm = () => {
    onHide(false);
    setIsAddAppendix(false);
    setDataAppendix(null);
    setFormDataAppendix({ values: valueAppendix, errors: {} });
  };

  const cancelAdd = () => {
    setIsAddAppendix(false);
    setDataAppendix(null);
    setFormDataAppendix({ values: valueAppendix, errors: {} });
  };

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${dataAppendix ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
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
        if (isDifferenceObj(formDataAppendix.values, valueAppendix)) {
          showDialogConfirmCancel();
          if (focusedElement instanceof HTMLElement) {
            focusedElement.blur();
          }
        } else {
          onHide(false);
        }
      }
    },
    [formDataAppendix]
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
          if (!isSubmitAppendix) {
            handleClearForm();
          }
        }}
        className="modal-add-appendix-contract"
      >
        <div className="container-add-appendix">
          <ModalHeader
            title={isAddAppendix ? `${dataAppendix ? "Chỉnh sửa phụ lục" : "Thêm mới phụ lục"}` : `Danh sách phụ lục`}
            toggle={() => {
              if (!isSubmitAppendix) {
                handleClearForm();
              }
            }}
          />
          <ModalBody>
            <div>
              {isAddAppendix ? null : (
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10, marginBottom: 10, marginRight: 10 }}>
                  <Button
                    // type="submit"
                    color="primary"
                    // disabled={}
                    onClick={() => {
                      setIsAddAppendix(true);
                    }}
                  >
                    Thêm phụ lục
                  </Button>
                </div>
              )}

              {!isAddAppendix ? (
                <div style={{ maxHeight: "42rem", overflow: "auto" }}>
                  {!isLoading && appendixList && appendixList.length > 0 ? (
                    <BoxTable
                      name="Danh sách phụ lục"
                      titles={titlesAppendx}
                      items={appendixList}
                      isPagination={true}
                      dataPagination={pagination}
                      dataMappingArray={(item, index) => dataMappingArray(item, index)}
                      dataFormat={dataFormatAppendix}
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
                    <SystemNotification description={<span>Hiện tại chưa có phụ lục nào.</span>} type="no-item" />
                  )}
                </div>
              ) : (
                <div className="list-form-group-appendix">
                  {listFieldAppendix.map((field, index) => (
                    <FieldCustomize
                      key={index}
                      field={field}
                      handleUpdate={(value) =>
                        handleChangeValidate(value, field, formDataAppendix, validationsAppendx, listFieldAppendix, setFormDataAppendix)
                      }
                      formData={formDataAppendix}
                    />
                  ))}
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={isAddAppendix ? actionsAdd : actions} />
        </div>
      </Modal>
      <Dialog content={isAddAppendix ? contentDialogAdd : contentDialog} isOpen={isAddAppendix ? showDialogAdd : showDialog} />
    </Fragment>
  );
}
