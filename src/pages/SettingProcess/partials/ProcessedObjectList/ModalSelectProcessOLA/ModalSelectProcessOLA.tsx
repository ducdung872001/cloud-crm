import React, { Fragment, useCallback, useContext, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { IActionModal } from "model/OtherModel";
import SelectCustom from "components/selectCustom/selectCustom";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import "./ModalSelectProcessOLA.scss";
import WorkOrderService from "services/WorkOrderService";
import { ContextType, UserContext } from "contexts/userContext";
import BusinessProcessService from "services/BusinessProcessService";
import { ExportExcel } from "exports";
import moment from "moment";

export default function ModalSelectProcessOLA(props: any) {
  const { onShow, onHide, data } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  //   useEffect(() => {
  //     if(onShow && data && data?.employeeId){
  //         setValueProcess({value: data?.employeeId, label: data?.employeeName})
  //     }
  //   }, [onShow, data])

  const values = useMemo(
    () => ({
      potId: data?.id ?? null,
      processId: null,
    }),
    [onShow, data]
  );

  const [formData, setFormData] = useState(values);
  // console.log('formData', formData);

  useEffect(() => {
    setFormData(values);
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  //   const [validateFieldEmployee, setValidateFieldEmployee] = useState<boolean>(false);
  const [valueProcess, setValueProcess] = useState(null);

  const loadedOptionProcess = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await BusinessProcessService.list(param);

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

  const handleChangeValueProcess = (e) => {
    setValueProcess(e);
    setFormData({ ...formData, processId: e.value });
  };

  const handleClearForm = (acc) => {
    onHide(acc);
    setFormData(values);
    setValueProcess(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    exportCallback(formData, "excel", "ola");
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
              handleClearForm(false);
            },
          },
          {
            title: "Áp dụng",
            type: "submit",
            color: "primary",
            disabled: isSubmit || _.isEqual(formData, values),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, formData, values]
  );

  const titlesExcelOLA = [
    "STT",
    "Tên nhân viên",
    "Bộ phận",
    "ID công việc",
    "Công việc",
    "Dự án",
    "Gói thầu",
    "Quy trình",
    "OLA phản hồi cài đặt theo quy trình",
    "OLA xử lý cài đặt theo quy trình",
    "Thời điểm xuất hiện công việc",
    "Thời điểm click chuột lần đầu tiên",
    "Thời điểm phản hồi xác nhận/ từ chối công việc",
    "Thời điểm hoàn thành công việc (lần đầu)",
    "Thời điểm hoàn thành công việc lần cuối (trường hợp hồ sơ quay vòng)",
    "Số lần hồ sơ quay vòng (lặp lại)",
    "Thời gian phản hồi thực tế",
    "Thời gian xử lý hoàn thành công việc thực tế",
    "Trạng thái vi phạm OLA phản hồi",
    "Trạng thái vi phạm OLA xử lý",
    "Nguyên nhân vi phạm OLA",
  ];

  const formatExportOLA = [
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
  ];

  const dataMappingArray_OLA_SLA = (item: any, index: number, type?: string) =>
    type === "ola"
      ? [
          index + 1,
          item.employeeName,
          item.departmentName,
          item.potId,
          item.nodeName,
          item.projectName,
          item.bidPackpage,
          item.processName,
          `${item.planResponseDay || 0} ngày, ${item.planResponseHour < 10 ? `0${item.planResponseHour || 0}` : item.planResponseHour}:${
            item.planResponseMinute < 10 ? `0${item.planResponseMinute || 0}` : item.planResponseMinute
          }`,
          `${item.planExecutionDay || 0} ngày, ${item.planExecutionHour < 10 ? `0${item.planExecutionHour || 0}` : item.planExecutionHour}:${
            item.planExecutionMinute < 10 ? `0${item.planExecutionMinute || 0}` : item.planExecutionMinute
          }`,
          item.transitTime ? moment(item.transitTime).format("DD/MM/YYYY HH:mm:ss") : "",
          item.firstSeenTime ? moment(item.firstSeenTime).format("DD/MM/YYYY HH:mm:ss") : "",
          item.receivedTime ? moment(item.receivedTime).format("DD/MM/YYYY HH:mm:ss") : "",
          item.processedTime ? moment(item.processedTime).format("DD/MM/YYYY HH:mm:ss") : "",
          item.lastProcessedTime ? moment(item.lastProcessedTime).format("DD/MM/YYYY HH:mm:ss") : "",
          item.repeatNumber,
          `${item.actualResponseDay || 0} ngày, ${item.actualResponseHour < 10 ? `0${item.actualResponseHour || 0}` : item.actualResponseHour}:${
            item.actualResponseMinute < 10 ? `0${item.actualResponseMinute}` : item.actualResponseMinute
          }`,
          `${item.actualExecutionDay || 0} ngày, ${item.actualExecutionHour < 10 ? `0${item.actualExecutionHour || 0}` : item.actualExecutionHour}:${
            item.actualExecutionMinute < 10 ? `0${item.actualExecutionMinute}` : item.actualExecutionMinute
          }`,
          item.responseTimeViolation === 1 ? "Vi phạm" : "",
          item.executionTimeViolation === 1 ? "Vi phạm" : "",
          item.reason,
        ]
      : [
          index + 1,
          item.nodeName,
          item.bidPackpage,
          item.projectName,
          // item.lstSLADepartmentResponse
        ];
  const exportCallback = useCallback(async (data, extension, type) => {
    let response;
    if (type === "ola") {
      response = await WorkOrderService.exportOLA({
        page: 1,
        limit: 10000,
        potId: data.potId,
        processId: data.processId,
        // employeeId: data.employeeId
      });
    } else if (type === "sla") {
      response = await WorkOrderService.exportSLA({
        page: 1,
        limit: 10000,
        processId: data.id,
        // employeeId: data.employeeId
      });
    }

    if (response.code === 0) {
      const result = response.result;

      if (type === "sla") {
        const headerFormatSLA: any = [
          {
            merge: {
              row: 2,
            },
          },
          {
            merge: {
              row: 2,
            },
          },
          {
            merge: {
              row: 2,
            },
          },
          {
            merge: {
              row: 2,
            },
          },
        ];
        const formatExportSLA = ["center", "center", "center", "center"];
        const titleSLA = ["STT", "Mã gói thầu", "Gói thầu", "Dự án"];
        const titleChildSLA = ["", "", "", ""];
        const newtitleSale = result.value && result.value.length > 0 ? result.value.filter((el) => el.parentId) : [];

        newtitleSale.map((item) => {
          titleSLA.push(item.name || item.id.toString(), "", "", "", "", "");
          titleChildSLA.push(
            "SLA phản hồi tiêu chuẩn",
            "SLA phản hồi thực tế",
            "Trạng thái vi phạm SLA phản hồi",
            "SLA xử lý tiêu chuẩn",
            "SLA xử lý thực tế",
            "Trạng thái vi phạm SLA thực tế"
          );
          headerFormatSLA.push(
            {
              merge: {
                col: 6,
              },
            },
            {},
            {},
            {},
            {},
            {}
          );
          formatExportSLA.push("center", "center", "center", "center", "center", "center");
        });

        const headerTotalSLA = [headerFormatSLA];
        const titleTotalSLA = [titleSLA, titleChildSLA];

        if (extension === "excel") {
          ExportExcel({
            fileName: "Export SLA",
            title: "Export SLA",
            header: titleTotalSLA,
            formatExcel: formatExportSLA,
            // data: result.key.map((item, idx) => dataMappingArray(item, idx, type)),
            data: result.key.map((item, idx) => dataMappingArray_OLA_SLA(item, idx, type)),
            info: { name },
            headerFormat: headerTotalSLA,
          });
        }
      }

      if (type === "ola") {
        if (extension === "excel") {
          ExportExcel({
            fileName: "Export OLA",
            title: "Export OLA",
            header: titlesExcelOLA,
            formatExcel: formatExportOLA,
            data: result.map((item, idx) => dataMappingArray_OLA_SLA(item, idx, type)),
            info: { name },
          });
          handleClearForm(false);
        }
      }

      showToast("Xuất file thành công", "success");
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }
  }, []);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-select-process-ola"
      >
        <form className="form-select-process-ola" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Chọn quy trình`} toggle={() => !isSubmit && handleClearForm(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <SelectCustom
                  name="processId"
                  value={valueProcess}
                  label="Chọn quy trình"
                  fill={true}
                  required={true}
                  options={[]}
                  isAsyncPaginate={true}
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionProcess}
                  placeholder="Chọn quy trình"
                  onChange={(e) => handleChangeValueProcess(e)}
                  //   error={validateFieldEmployee}
                  //   message="Người nhận việc không được bỏ trống"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
    </Fragment>
  );
}
