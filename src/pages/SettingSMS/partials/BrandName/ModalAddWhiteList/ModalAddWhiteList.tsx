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
import "./ModalAddWhiteList.scss";
import Icon from "components/icon";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Loading from "components/loading";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import Button from "components/button/button";
import BoxTable from "components/boxTable/boxTable";
import moment from "moment";
import BrandNameService from "services/BrandNameService";
import { PHONE_REGEX } from "utils/constant";

export default function ModalAddWhiteList(props: any) {
  const { onShow, onHide, data } = props;
  const focusedElement = useActiveElement();

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataWhiteList, setDataWhiteList] = useState(null);
  console.log("dataWhiteList", dataWhiteList);

  const [isAddWhiteList, setIsAddWhiteList] = useState(false);
  const [params, setParams] = useState({
    name: "",
    limit: 10,
  });

  useEffect(() => {
    if (data && onShow) {
      setParams((preState) => ({ ...preState, whitelistId: data?.whitelist?.id }));
    }
  }, [data, onShow]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "số điện thoại",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const [phoneNumberList, setPhoneNumberList] = useState([]);

  const abortController = new AbortController();

  const getListPhoneNumber = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await BrandNameService.listWhiteList(paramsSearch, abortController.signal);

    if (response.code == 0) {
      const result = response.result;
      setPhoneNumberList(result.items);

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
    getListPhoneNumber(params);
  }, [params]);

  const titlesWhiteList = ["STT", "Số điện thoại"];
  const dataFormatWhiteList = ["text-center"];

  const dataMappingArray = (item: any, index: number) => [getPageOffset(params) + index + 1, item.contact];

  const actionsTable = (item: any): IAction[] => {
    return [
      {
        title: "Sửa",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataWhiteList(item);
          setIsAddWhiteList(true);
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
          Bạn có chắc chắn muốn xóa số điện thoại đã chọn {item ? <strong>{item.phone}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: async () => {
        const response = await BrandNameService.deleteWhiteList(item.id);
        if (response.code === 0) {
          showToast("Xóa số điện thoại thành công", "success");
          getListPhoneNumber(params);
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

  ////Thêm whitelist

  const [isSubmitWhiteList, setIsSubmitWhiteList] = useState(false);
  const [showDialogAdd, setShowDialogAdd] = useState<boolean>(false);
  const [contentDialogAdd, setContentDialogAdd] = useState<IContentDialog>(null);

  const valueWhiteList = useMemo(
    () =>
      ({
        id: dataWhiteList?.id ?? 0,
        contact: dataWhiteList?.contact ?? "",
        uatWhitelistId: dataWhiteList?.uatWhitelistId ?? data?.whitelist?.id ?? "",
      } as any),
    [dataWhiteList, isAddWhiteList, data]
  );

  const validationsWhiteList: IValidation[] = [
    {
      name: "contact",
      rules: "required",
    },
  ];

  const [formDataWhiteList, setFormDataWhiteList] = useState<IFormData>({ values: valueWhiteList });

  const listFieldWhiteList = useMemo(
    () =>
      [
        {
          label: "Số điện thoại",
          name: "contact",
          type: "text",
          fill: true,
          regex: new RegExp(PHONE_REGEX),
          messageErrorRegex: "Số điện thoại không đúng định dạng",
          // iconPosition: "right",
          // icon: data?.id && (!isShowPhone ? <Icon name="EyeSlash" /> : <Icon name="Eye" />),
          // iconClickEvent: () => setIsShowPhone(!isShowPhone),
          required: true,
        },
      ] as IFieldCustomize[],
    [formDataWhiteList?.values]
  );

  useEffect(() => {
    setFormDataWhiteList({ ...formDataWhiteList, values: valueWhiteList, errors: {} });
    setIsSubmitWhiteList(false);

    return () => {
      setIsSubmitWhiteList(false);
    };
  }, [valueWhiteList]);

  const onSubmitWhiteList = async () => {
    // e.preventDefault();

    const errors = Validate(validationsWhiteList, formDataWhiteList, [...listFieldWhiteList]);
    if (Object.keys(errors).length > 0) {
      setFormDataWhiteList((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmitWhiteList(true);

    const body = {
      ...(formDataWhiteList.values as any),
      // ...(data ? { id: data.id } : {}),
    };

    const response = await BrandNameService.updateWhiteList(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm"} số điện thoại thành công`, "success");
      setIsSubmitWhiteList(false);
      getListPhoneNumber(params);
      cancelAdd();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmitWhiteList(false);
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
            disabled: isSubmitWhiteList,
            callback: () => {
              !isDifferenceObj(formDataWhiteList.values, valueWhiteList) ? cancelAdd() : showDialogConfirmCancel();
            },
          },
          {
            title: dataWhiteList ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmitWhiteList ||
              !isDifferenceObj(formDataWhiteList.values, valueWhiteList) ||
              (formDataWhiteList.errors && Object.keys(formDataWhiteList.errors).length > 0),
            is_loading: isSubmitWhiteList,
            callback: () => {
              onSubmitWhiteList();
            },
          },
        ],
      },
    }),
    [formDataWhiteList, valueWhiteList, isSubmitWhiteList]
  );

  const handleClearForm = () => {
    onHide(false);
    setIsAddWhiteList(false);
    setDataWhiteList(null);
    setFormDataWhiteList({ values: valueWhiteList, errors: {} });
  };

  const cancelAdd = () => {
    setIsAddWhiteList(false);
    setDataWhiteList(null);
    setFormDataWhiteList({ values: valueWhiteList, errors: {} });
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
        if (isDifferenceObj(formDataWhiteList.values, valueWhiteList)) {
          showDialogConfirmCancel();
          if (focusedElement instanceof HTMLElement) {
            focusedElement.blur();
          }
        } else {
          onHide(false);
        }
      }
    },
    [formDataWhiteList]
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
          if (!isSubmitWhiteList) {
            handleClearForm();
          }
        }}
        className="modal-add-WhiteList"
      >
        <div className="container-add-WhiteList">
          <ModalHeader
            title={isAddWhiteList ? `${dataWhiteList ? "Chỉnh sửa số điện thoại" : "Thêm mới số điện thoại"}` : `Danh sách WhiteList`}
            toggle={() => {
              if (!isSubmitWhiteList) {
                handleClearForm();
              }
            }}
          />
          <ModalBody>
            <div>
              {isAddWhiteList ? null : (
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10, marginBottom: 10, marginRight: 10 }}>
                  <Button
                    // type="submit"
                    color="primary"
                    // disabled={}
                    onClick={() => {
                      setIsAddWhiteList(true);
                    }}
                  >
                    Thêm số điện thoại
                  </Button>
                </div>
              )}

              {!isAddWhiteList ? (
                <div style={{ maxHeight: "42rem", overflow: "auto" }}>
                  {!isLoading && phoneNumberList && phoneNumberList.length > 0 ? (
                    <BoxTable
                      name="Danh sách WhiteList"
                      titles={titlesWhiteList}
                      items={phoneNumberList}
                      isPagination={true}
                      dataPagination={pagination}
                      dataMappingArray={(item, index) => dataMappingArray(item, index)}
                      dataFormat={dataFormatWhiteList}
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
                    <SystemNotification description={<span>Hiện tại chưa có số điện thoại nào nào.</span>} type="no-item" />
                  )}
                </div>
              ) : (
                <div className="list-form-group-WhiteList">
                  {listFieldWhiteList.map((field, index) => (
                    <FieldCustomize
                      key={index}
                      field={field}
                      handleUpdate={(value) =>
                        handleChangeValidate(value, field, formDataWhiteList, validationsWhiteList, listFieldWhiteList, setFormDataWhiteList)
                      }
                      formData={formDataWhiteList}
                    />
                  ))}
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={isAddWhiteList ? actionsAdd : actions} />
        </div>
      </Modal>
      <Dialog content={isAddWhiteList ? contentDialogAdd : contentDialog} isOpen={isAddWhiteList ? showDialogAdd : showDialog} />
    </Fragment>
  );
}
