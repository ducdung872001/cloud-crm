import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import SelectCustom from "components/selectCustom/selectCustom";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { formatCurrency, isDifferenceObj } from "reborn-util";
import QuoteService from "services/QuoteService";
import FSQuoteService from "services/FSQuoteService";

import "./index.scss";
import SheetFieldQuoteFormService from "services/SheetFieldQuoteFormService";
import AddFile from "./partials/AddFile";
import { uploadDocumentFormData } from "utils/document";
import Icon from "components/icon";

interface IAddQuoteProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  data: any;
  contractId?: number;
}

export default function AddQuote(props: IAddQuoteProps) {
  const { onShow, onHide, data, contractId } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const focusedElement = useActiveElement();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [valueFS, setValueFS] = useState(null);
  const [showMore, setShowMore] = useState<boolean>(false);
  const [dataFormFS, setDataFormFS] = useState([]);
  const [defaultFieldConfig, setDefaultFieldConfig] = useState(null);
  const [lstFieldConfig, setLstFieldConfig] = useState(null);
  const [lstField, setLstField] = useState({
    lstThead: [],
    lstTbody: [],
  });
  const [infoFile, setInfoFile] = useState(null);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [showProgress, setShowProgress] = useState(0);

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        fsId: data?.fsId ?? "",
        quoteDate: data?.quoteDate ?? new Date(),
        expiredDate: data?.expiredDate ?? "",
        quoteAttachment: data?.quoteAttachment ?? null,
        quoteType: data?.quoteType?.toString() ?? "2",
      } as any),
    [data, onShow]
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

  useEffect(() => {
    if (+formData.values.quoteType === 2) {
      setFormData({ ...formData, values: { ...formData.values, quoteAttachment: "" } });
      setInfoFile(null);
    }
  }, [formData.values.quoteType]);

  const loadedOptionSMS = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
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
                  sheetId: item.sheetId,
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
        sheetId: response.sheetId,
      });
    } else {
      showToast("Chi tiết fs đang bị lỗi. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (data && onShow) {
      handDetailFormFS(data.fsId);

      if (data.quoteAttachment) {
        setInfoFile({
          fileUrl: data.quoteAttachment,
          extension: data.quoteAttachment.includes(".docx")
            ? "docx"
            : data.quoteAttachment.includes(".xlsx")
            ? "xlsx"
            : data.quoteAttachment.includes(".pdf") || data.quoteAttachment.includes(".PDF")
            ? "pdf"
            : data.quoteAttachment.includes(".pptx")
            ? "pptx"
            : data.quoteAttachment.includes(".zip")
            ? "zip"
            : "rar",
        });
      }
    }
  }, [onShow, data]);

  const transformArray = (data) => {
    return data.map((item) => {
      let dataTbodyArray = JSON.parse(item.dataTbody) || [];

      dataTbodyArray = dataTbodyArray.map((subItem) => {
        return { ...subItem, id: item.id };
      });

      return dataTbodyArray;
    });
  };

  const handleGetFormFS = async (id: number) => {
    const params = {
      fsId: id,
    };

    const response = await FSQuoteService.fsFormLst(params);

    if (response.code === 0) {
      const result = transformArray(response.result);
      setDataFormFS(result);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const handleGetField = async (sheetId: number) => {
    const params = {
      sheetId: sheetId,
      limit: 20,
    };

    const response = await SheetFieldQuoteFormService.lst(params);

    if (response.code === 0) {
      const result = response.result.items;

      const changeResult = result.map((item) => {
        const newItem: any = {
          [item.code]: "",
          type: item.type,
          placeholder: item.name.toLowerCase(),
          formula: item.formula,
          id: null,
        };

        if (item.type === "select") {
          newItem.options = JSON.parse(item.options);
        }

        return newItem;
      });

      const resultTitle = result.map((item) => {
        return {
          name: item.name,
          type: item.type,
        };
      });

      setDefaultFieldConfig(changeResult);
      setLstFieldConfig({ lstTbody: [changeResult], lstThead: resultTitle });
    }
  };

  useEffect(() => {
    if (showMore && valueFS) {
      handleGetFormFS(valueFS.value);
      handleGetField(valueFS.sheetId);
    }
  }, [showMore, valueFS]);

  const mergeArrays = (originalArray, targetArray) => {
    return targetArray.map((targetItem) => {
      // Tạo một mảng mới để lưu trữ các trường sau khi lọc và merge
      const mergedItem = [];

      // Lấy danh sách các keys từ originalArray để so sánh
      const originalFields = originalArray[0].map((field) => Object.keys(field)[0]);

      // Duyệt qua mỗi phần tử của targetItem
      targetItem.forEach((targetField) => {
        // Tìm tên của trường từ danh sách originalFields
        const targetFieldName = originalFields.find((fieldName) => fieldName in targetField);
        if (targetFieldName) {
          // Nếu có, tìm trường tương ứng trong originalArray
          const originalField = originalArray[0].find((field) => Object.keys(field)[0] === targetFieldName);

          // Merge các trường từ originalField và targetField
          const mergedField = { ...originalField, ...targetField };
          mergedItem.push(mergedField);
        }
      });

      // Thêm các trường từ originalArray mà targetItem không có
      originalArray[0].forEach((originalField) => {
        const originalFieldName = Object.keys(originalField)[0];

        // Kiểm tra xem trường này đã tồn tại trong mergedItem chưa
        if (!mergedItem.some((field) => Object.keys(field)[0] === originalFieldName)) {
          // Nếu không, thêm trường này vào mảng mergedItem
          mergedItem.push(originalField);
        }
      });

      return mergedItem;
    });
  };

  useEffect(() => {
    if (lstFieldConfig) {
      const mergeConditionData = mergeArrays(lstFieldConfig.lstTbody, dataFormFS && dataFormFS.length > 0 ? dataFormFS : [defaultFieldConfig]);

      setLstField({ lstTbody: mergeConditionData, lstThead: lstFieldConfig.lstThead });
    }
  }, [lstFieldConfig, defaultFieldConfig, dataFormFS]);

  const listField: IFieldCustomize[] = [
    {
      label: "Chọn loại báo giá",
      name: "quoteType",
      type: "radio",
      fill: true,
      required: true,
      options: [
        {
          value: "2",
          label: "Nhập trực tiếp",
        },
        {
          value: "1",
          label: "Nhập từ ngoài vào",
        },
      ],
    },
    {
      label: "Tên báo giá",
      name: "name",
      type: "text",
      fill: true,
      maxLength: 300,
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
          loadOptionsPaginate={loadedOptionSMS}
          onChange={(e) => handleChangeValueSMS(e)}
        />
      ),
    } as any,
  ];

  const handleClearForm = (acc) => {
    onHide(acc);
    setValueFS(null);
    setShowMore(false);
    setDataFormFS([]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    setIsSubmit(true);
    const body = {
      ...formData.values,
      ...(data ? { id: data.id } : {}),
      ...(contractId ? { contractId: +contractId } : {}),
    };

    const response = await QuoteService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} báo giá thành công`, "success");
      handleClearForm(true);
    } else {
      showToast(response.error ?? response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
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
              !isDifferenceObj(formData.values, values) ? handleClearForm(false) : showDialogConfirmCancel();
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
        handleClearForm(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
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

  //Tải mẫu báo giá
  const takeFileAdd = (data) => {
    if (data) {
      setIsLoadingFile(true);
      uploadDocumentFormData(data, onSuccess, onError, onProgress);
    }
  };

  const onProgress = (percent) => {
    if (percent) {
      setShowProgress(percent.toFixed(0));
      // if (percent = 100) {
      //   setShowProgress(0);
      // }
    }
  };

  //* Đoạn này nhận link file đã chọn
  const onSuccess = (data) => {
    if (data) {
      setIsLoadingFile(false);
      setInfoFile(data);
      setFormData({ ...formData, values: { ...formData.values, quoteAttachment: data.fileUrl } });
    }
  };

  //* Đoạn này nếu như mà lỗi không tải lên được thì bắn ra thông báo
  const onError = (message) => {
    setIsLoadingFile(false);
    showToast(message.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
  };

  useEffect(() => {
    if (!isLoadingFile === false) {
      setShowProgress(0);
    }
  }, [isLoadingFile]);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-add-quote"
        size="lg"
      >
        <form className="form-quote-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${data ? "Chỉnh sửa" : "Thêm mới"} báo giá`} toggle={() => !isSubmit && handleClearForm(false)} />
          <ModalBody>
            <div className="container-quote">
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

                    {showMore && lstField && (
                      <div className="info__fs">
                        <table className="table__fs">
                          <thead>
                            <tr>
                              {lstField.lstThead.map((item, idx) => {
                                return (
                                  <th
                                    key={idx}
                                    style={{ textAlign: `${item.type === "number" ? "right" : item.type === "select" ? "center" : "left"}` }}
                                  >
                                    {item.name}
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            {lstField.lstTbody.map((item, idx) => {
                              return (
                                <tr key={idx}>
                                  {item.map((el, index) => {
                                    return (
                                      <td
                                        key={index}
                                        style={{ textAlign: `${el.type === "number" ? "right" : el.type === "select" ? "center" : "left"}` }}
                                      >
                                        {el.type === "number" ? formatCurrency(Object.values(el)[0], ",", "") : Object.values(el)[0]}
                                      </td>
                                    );
                                  })}
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
              {formData.values.quoteType === "1" ? (
                <div className="container_template_contract">
                  <div>
                    <span className="title_template">
                      File báo giá<span style={{ color: "red" }}>*</span>
                    </span>
                  </div>
                  <div className="box_template">
                    <div className="box__update--attachment">
                      {/* {isLoadingFile ? ( */}
                      <div className={`is__loading--file ${isLoadingFile ? "" : "d-none"}`}>
                        <Icon name="Refresh" />
                        <span className="name-loading">Đang tải...{showProgress}%</span>
                      </div>
                      {/* ) : ( */}
                      <div className={isLoadingFile ? "d-none" : ""}>
                        <AddFile
                          takeFileAdd={takeFileAdd}
                          infoFile={infoFile}
                          setInfoFile={setInfoFile}
                          // setIsLoadingFile={setIsLoadingFile}
                          // dataAttachment={data}
                        />
                      </div>
                      {/* )} */}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
