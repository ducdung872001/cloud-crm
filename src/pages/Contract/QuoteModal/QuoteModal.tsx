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
import "./QuoteModal.scss";
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
import QuoteService from "services/QuoteService";
import Badge from "components/badge/badge";
import SendEmailModal from "./partials/SendEmailModal";
import FSQuoteService from "services/FSQuoteService";
import SelectCustom from "components/selectCustom/selectCustom";
import ModalAddQuote from "./ModalAddQuote/ModalAddQuote";

export default function QuoteModal(props: any) {
  const { onShow, onHide, data } = props;

  const focusedElement = useActiveElement();

  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataQuote, setDataQuote] = useState(null);

  const [isAddQuote, setIsAddQuote] = useState(false);
  const [params, setParams] = useState({
    name: "",
    limit: 100,
  });

  useEffect(() => {
    if (data && onShow) {
      setParams((preState) => ({ ...preState, contractId: data?.contractId }));
    }
  }, [data, onShow]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "báo giá",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const [quoteList, setQuoteList] = useState([]);

  const abortController = new AbortController();

  const getListQuote = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await QuoteService.listQuoteContract(paramsSearch, abortController.signal);

    if (response.code == 0) {
      const result = response.result;
      setQuoteList(result);

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
      getListQuote(params);
    }
  }, [params, onShow]);

  const titles = ["STT", "Tên báo giá", "Ngày ban hàng", "Trạng thái"];
  const dataFormat = ["text-center", "", "text-center", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    <div>
      <span style={{ fontSize: 14, fontWeight: "400" }}>{item.name}</span>
    </div>,
    item.approvedDate ? moment(item.approvedDate).format("DD/MM/YYYY") : "",
    <Badge
      key={item.id}
      text={!item.status ? "Chưa phê duyệt" : item.status === 1 ? "Đang xử lý" : item.status === 2 ? "Đã phê duyệt" : "Từ chối duyệt"}
      variant={!item.status ? "secondary" : item.status === 1 ? "primary" : item.status === 2 ? "success" : "error"}
    />,
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
      ...(item.status === 2
        ? [
            {
              title: "Gửi Email",
              icon: <Icon name="SendEmail" />,
              callback: () => {
                if (!data?.emailMasked) {
                  showToast("Khách hàng chưa có Email", "error");
                } else {
                  setDataQuote(item);
                  setShowModalSendEmail(item);
                }
              },
            },
          ]
        : []),

      // {
      //   title: "Sửa",
      //   icon: <Icon name="Pencil" />,
      //   callback: () => {
      //       setDataQuote(item);
      //       setIsAddQuote(true);
      //   },
      // },

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
        <Fragment>Bạn có chắc chắn muốn xóa tài liệu đã chọn {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.</Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: async () => {
        const response = await QuoteService.deleteQuoteContract(item.quoteId, data.contractId);
        if (response.code === 0) {
          showToast("Xóa báo giá thành công", "success");
          getListQuote(params);
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
              handleClearForm(false);
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

  const [showModalSendEmail, setShowModalSendEmail] = useState(false);

  ///thêm báo giá
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialogAdd, setShowDialogAdd] = useState<boolean>(false);
  const [contentDialogAdd, setContentDialogAdd] = useState<IContentDialog>(null);

  const [valueFS, setValueFS] = useState(null);
  const [showMore, setShowMore] = useState<boolean>(false);
  const [dataFormFS, setDataFormFS] = useState([]);

  const values = useMemo(
    () =>
      ({
        name: dataQuote?.name ?? "",
        fsId: dataQuote?.fsId ?? "",
        quoteDate: dataQuote?.quoteDate ?? new Date(),
        expiredDate: dataQuote?.expiredDate ?? "",
      } as any),
    [dataQuote, onShow]
  );

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
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

  const loadedOptionFs = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
      status: 2,
    };

    const response = await FSQuoteService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
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

  const handleChangeValueSMS = (e) => {
    setDataFormFS([]);
    setValueFS(e);
  };

  useEffect(() => {
    if (valueFS) {
      setFormData({ ...formData, values: { ...formData.values, fsId: valueFS.value } });
    }
  }, [valueFS]);

  const handDetailFormFS = async (id: number) => {
    if (!id) return;

    const response = await FSQuoteService.detail(id);

    if (response.code === 0) {
      const result = response.result;
      setValueFS({
        value: result.id,
        label: result.name,
      });
    } else {
      showToast("Chi tiết fs đang bị lỗi. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (data && onShow) {
      handDetailFormFS(data.fsId);
    }
  }, [onShow, data]);

  const handleGetFormFS = async (id: number) => {
    const params = {
      fsId: id,
    };

    const response = await FSQuoteService.fsFormLst(params);

    if (response.code === 0) {
      const result = response.result;
      setDataFormFS(result);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (showMore && valueFS && dataFormFS.length === 0) {
      handleGetFormFS(valueFS.value);
    }
  }, [showMore, valueFS, dataFormFS]);

  const listField: IFieldCustomize[] = [
    {
      label: "Tên báo giá",
      name: "name",
      type: "text",
      fill: true,
      required: true,
    },
    {
      label: "Ngày báo giá",
      name: "quoteDate",
      type: "date",
      fill: true,
      required: true,
      maxDate: new Date(formData?.values?.expiredDate),
    },
    {
      label: "Ngày hết hạn",
      name: "expiredDate",
      type: "date",
      fill: true,
      required: true,
      minDate: new Date(formData?.values?.quoteDate),
      placeholder: "Nhập ngày hết hạn",
    },
    {
      name: "fsId",
      type: "custom",
      snippet: (
        <SelectCustom
          id="fsId"
          name="fsId"
          label="Chọn FS"
          options={[]}
          fill={true}
          value={valueFS}
          isAsyncPaginate={true}
          placeholder="Chọn fs"
          additional={{
            page: 1,
          }}
          loadOptionsPaginate={loadedOptionFs}
          onChange={(e) => handleChangeValueSMS(e)}
        />
      ),
    } as any,
  ];

  const onSubmit = async () => {
    // e.preventDefault();

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    setIsSubmit(true);
    const body = {
      ...formData.values,
      ...(dataQuote ? { id: dataQuote.id } : {}),
      ...(data ? { contractId: data?.contractId } : {}),
    };

    const response = await QuoteService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} báo giá thành công`, "success");
      // handleClearForm(true);
      getListQuote(params);
      handleBack();
      setIsSubmit(false);
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
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              !isDifferenceObj(formData.values, values) ? handleBack() : showDialogConfirmCancel();
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

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${dataQuote ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialogAdd(false);
        setContentDialogAdd(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        handleBack();
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
      if (keyCode === 27 && !showDialog) {
        if (isDifferenceObj(formData.values, values)) {
          showDialogConfirmCancel();
          if (focusedElement instanceof HTMLElement) {
            focusedElement.blur();
          }
        } else {
          handleClearForm(false);
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

  const lstTitle = ["STT", "Nội dung", "Đơn vị", "Số lượng", "Đơn giá", "Giá trị kế hoạch", "Diễn giải"];

  const dataFormmat = ["center", "", "", "text-right", "text-right", "text-right", ""];

  const handleClearForm = (acc) => {
    onHide(acc);
    setValueFS(null);
    setShowMore(false);
    setDataFormFS([]);
    setFormData({ ...formData, values: values });
    setIsAddQuote(false);
  };

  const handleBack = () => {
    setValueFS(null);
    setShowMore(false);
    setDataFormFS([]);
    setFormData({ ...formData, values: values });
    setIsAddQuote(false);
  };

  const [showModalAddQuote, setShowModalAddQuote] = useState(false);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => handleClearForm(false)}
        className="modal-quote"
        size="lg"
      >
        <div className="container-quote">
          <ModalHeader
            title={isAddQuote ? `${dataQuote ? "Chỉnh sửa báo giá" : "Thêm mới báo giá"}` : `Danh sách báo giá`}
            toggle={() => handleClearForm(false)}
          />
          <ModalBody>
            <div>
              {isAddQuote ? null : (
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10, marginBottom: 10, marginRight: 10 }}>
                  <Button
                    // type="submit"
                    color="primary"
                    // disabled={}
                    onClick={() => {
                      // setIsAddQuote(true)
                      setShowModalAddQuote(true);
                      // navigate(`/quote?contractId=${data?.contractId}`);
                    }}
                  >
                    Thêm báo giá
                  </Button>
                </div>
              )}

              {!isAddQuote ? (
                <div className="table-quote">
                  {!isLoading && quoteList && quoteList.length > 0 ? (
                    <BoxTable
                      name="Danh sách báo giá"
                      titles={titles}
                      items={quoteList}
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
                    <SystemNotification description={<span>Hiện tại chưa có tài liệu nào.</span>} type="no-item" />
                  )}
                </div>
              ) : (
                <div className="list-form-group" style={showMore ? { minHeight: "41rem", maxHeight: "42rem", overflow: "auto" } : {}}>
                  {listField.map((field, index) => (
                    <FieldCustomize
                      key={index}
                      field={field}
                      handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                      formData={formData}
                    />
                  ))}

                  {valueFS && (
                    <div className="action__show-more">
                      <span className="__more" onClick={(e) => setShowMore(!showMore)}>
                        {showMore ? "Thu gọn" : "Xem chi tiết FS"}
                      </span>

                      {showMore && dataFormFS && dataFormFS.length > 0 && (
                        <div className="info__fs">
                          <table className="table__fs">
                            <thead>
                              <tr>
                                {lstTitle.map((title, idx) => {
                                  return (
                                    <th key={idx} className={`${dataFormmat ? dataFormmat[idx] : ""}`}>
                                      {title}
                                    </th>
                                  );
                                })}
                              </tr>
                            </thead>
                            <tbody>
                              {dataFormFS.map((item, idx) => {
                                return (
                                  <tr
                                    key={idx}
                                    style={
                                      item.level === 1
                                        ? { background: "#FFFF00", fontWeight: 600 }
                                        : item.level === 2
                                        ? { fontWeight: 600 }
                                        : { fontStyle: "italic" }
                                    }
                                  >
                                    <td className={`${dataFormmat ? dataFormmat[0] : ""}`}>{item.orderLabel}</td>
                                    <td className={`${dataFormmat ? dataFormmat[1] : ""}`}>{item.content}</td>
                                    <td className={`${dataFormmat ? dataFormmat[2] : ""}`}>{item.unit}</td>
                                    <td className={`${dataFormmat ? dataFormmat[3] : ""}`}>{item.quantity}</td>
                                    <td className={`${dataFormmat ? dataFormmat[4] : ""}`}>
                                      {item.price ? formatCurrency(item.price, ",", "") : ""}
                                    </td>
                                    <td className={`${dataFormmat ? dataFormmat[5] : ""}`}>{item.fee ? formatCurrency(item.fee, ",", "") : ""}</td>
                                    <td className={`${dataFormmat ? dataFormmat[6] : ""}`}>{item.note}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={isAddQuote ? actionsAdd : actions} />
        </div>
      </Modal>
      <Dialog content={isAddQuote ? contentDialogAdd : contentDialog} isOpen={isAddQuote ? showDialogAdd : showDialog} />

      <SendEmailModal
        onShow={showModalSendEmail}
        dataQuote={dataQuote}
        customerIdlist={data?.id ? [data?.id] : []}
        onHide={(reload) => {
          // onReload(true)
          // if (reload) {
          //     onReload(true)
          // } else {
          //     // handleUpdateStatusFail(dataWork);
          // }
          setShowModalSendEmail(false);
          setDataQuote(null);
        }}
      />

      <ModalAddQuote
        onShow={showModalAddQuote}
        data={data}
        onHide={(reload) => {
          if (reload) {
            getListQuote(params);
          }
          setShowModalAddQuote(false);
        }}
      />
    </Fragment>
  );
}
