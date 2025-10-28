import React, { Fragment, useEffect, useMemo, useState } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import FSQuoteService from "services/FSQuoteService";
import Loading from "components/loading";
import { formatCurrency } from "reborn-util";
import { showToast } from "utils/common";
import SheetFieldQuoteFormService from "services/SheetFieldQuoteFormService";

import "./index.scss";
import { SystemNotification } from "components/systemNotification/systemNotification";

interface IViewDetailFsModalProps {
  onShow: boolean;
  data: any;
  onHide: () => void;
}

export default function ViewDetailFsModal(props: IViewDetailFsModalProps) {
  const { onShow, onHide, data } = props;

  const [dataFs, setDataFs] = useState(null);
  const [dataFormFS, setDataFormFS] = useState([]);
  const [lstField, setLstField] = useState(null);
  const [lstFieldConfig, setLstFieldConfig] = useState(null);
  const [defaultFieldConfig, setDefaultFieldConfig] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const handleGetField = async (sheetId) => {
    setIsLoading(true);

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
    } else {
      showToast(response.message || "Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }

    setIsLoading(false);
  };

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

  const handDetailFormFS = async (id: number) => {
    if (!id) return;

    const response = await FSQuoteService.detail(id);

    if (response.code === 0) {
      const result = response.result;
      setDataFs({
        value: result.id,
        label: result.name,
      });
      handleGetFormFS(result.id);
      handleGetField(result.sheetId);
    } else {
      showToast("Chi tiết fs đang bị lỗi. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (data && onShow) {
      handDetailFormFS(data.fsId);
    }
  }, [data, onShow]);

  const handleClearForm = () => {
    onHide();
    setDataFormFS([]);
    setDataFs(null);
    setLstField(null);
    setLstFieldConfig(null);
    setDefaultFieldConfig(null);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => handleClearForm(),
          },
        ],
      },
    }),
    []
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => handleClearForm()}
        className="modal-view-fs-quote"
        size="lg"
      >
        <div className="box-view-fs-quote">
          <ModalHeader title={`Chi tiết FS`} toggle={() => handleClearForm()} />
          <ModalBody>
            {!isLoading && dataFs && lstField ? (
              <div className="info__fs">
                <h3 className="namefs">{dataFs.label}</h3>

                <table className="table__form-fs">
                  <thead>
                    <tr>
                      {lstField.lstThead.map((item, idx) => {
                        return (
                          <th key={idx} style={{ textAlign: `${item.type === "number" ? "right" : item.type === "select" ? "center" : "left"}` }}>
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
                              <td key={index} style={{ textAlign: `${el.type === "number" ? "right" : el.type === "select" ? "center" : "left"}` }}>
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
            ) : isLoading ? (
              <Loading />
            ) : (
              <SystemNotification description={<span>Bạn chưa chọn fs nào.</span>} type="no-item" />
            )}
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
    </Fragment>
  );
}
