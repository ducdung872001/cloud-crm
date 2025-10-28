import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import { IAction, IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { handDownloadFileOrigin, showToast } from "utils/common";
import { convertToId, formatCurrency, getPageOffset, isDifferenceObj } from "reborn-util";
import "./MarketingReport.scss";
import Icon from "components/icon";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Loading from "components/loading";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import Button from "components/button/button";
import BoxTable from "components/boxTable/boxTable";
import moment from "moment";
import CampaignMarketingService from "services/CampaignMarketingService";

export default function MarketingReport(props: any) {
  const { onShow, onHide, data} = props;
  const focusedElement = useActiveElement();

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataReport, setDataReport] = useState(null);
  
  const [isAddReport, setIsAddReport] = useState(false);
  const [params, setParams] = useState({
      name: "",
      limit: 10,
  });

  useEffect(() => {
      if(data && onShow){
          setParams((preState) => ({...preState, mbtId: data?.id}))
      }
  }, [data, onShow])

    const [pagination, setPagination] = useState<PaginationProps>({
        ...DataPaginationDefault,
        name: "báo cáo",
        isChooseSizeLimit: true,
        setPage: (page) => {
            setParams((prevParams) => ({ ...prevParams, page: page }));
        },
        chooseSizeLimit: (limit) => {
            setParams((prevParams) => ({ ...prevParams, limit: limit }));
        },
    });


    const [reportList, setReportList] = useState([])

    const abortController = new AbortController();

    const getListReport = async (paramsSearch: any) => {
        setIsLoading(true);

        const response = await CampaignMarketingService.listMAReport(paramsSearch, abortController.signal);

        if (response.code == 0) {
            const result = response.result;
            setReportList(result.items);

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
        getListReport(params)
    }, [params])

    const titlesReport = ["STT","Tên đợt báo cáo", "Ngân sách chi tiêu", "Ngày báo cáo"];
    const dataFormatReport = [ "text-center", "", "text-right", "text-center"];

    const dataMappingArray = (item: any, index: number) => [
        getPageOffset(params) + index + 1,
        item.name,
        formatCurrency(item.budget || 0),
        item.reportDate ? moment(item.reportDate).format('DD/MM/YYYY') : '',
    ];

    const actionsTable = (item: any): IAction[] => {
        
        return [
            {
                title: "Tải danh sách khách hàng",
                icon: <Icon name="Upload" />,
                callback: () => {
                    // setDataReport(item);
                    // setIsAddReport(true);
                },
            },
            {
                title: "Sửa",
                icon: <Icon name="Pencil" />,
                callback: () => {
                    setDataReport(item);
                    setIsAddReport(true);
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
              Bạn có chắc chắn muốn xóa báo cáo {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
            </Fragment>
          ),
          cancelText: "Hủy",
          cancelAction: () => {
            setShowDialog(false);
            setContentDialog(null);
          },
          defaultText: "Xóa",
          defaultAction: async () => {
            const response = await CampaignMarketingService.detailMAReport(item.id);
            if (response.code === 0) {
                showToast("Xóa báo cáo thành công", "success");
                getListReport(params)
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

  const [isSubmitReport, setIsSubmitReport] = useState(false);
  const [showDialogAdd, setShowDialogAdd] = useState<boolean>(false);
  const [contentDialogAdd, setContentDialogAdd] = useState<IContentDialog>(null);

  const valueReport = useMemo(
    () =>
    ({
      id: dataReport?.id ?? 0,
      name: dataReport?.name ?? "",
      budget: dataReport?.budget ?? '',
      reportDate: dataReport?.reportDate ?? new Date(),
      mbtId: data?.id ?? null
    } as any),
    [dataReport, isAddReport, data]
  );  

  const validationsAppendx: IValidation[] = [
    {
        name: "name",
        rules: "required",
    },
    {
        name: "budget",
        rules: "requited"
    }
    
  ];

  const [formDataReport, setFormDataReport] = useState<IFormData>({ values: valueReport });  

  const listFieldReport = useMemo(
    () =>
      [
        {
            label: "Tên đợt báo cáo",
            name: "name",
            type: "text",
            fill: true,
            required: true,
        },
        {
            label: "Ngân sách chi tiêu",
            name: "budget",
            type: "number",
            fill: true,
            required: true,
        },

        {
            label: "Ngày báo cáo",
            name: "reportDate",
            type: "date",
            fill: true,
            required: true,
            isMaxDate: true,
            placeholder: "Chọn ngày báo cáo",
            icon: <Icon name="Calendar" />,
            iconPosition: "left",
        },
       
      ] as IFieldCustomize[],
    [formDataReport?.values]
  );

  useEffect(() => {
    setFormDataReport({ ...formDataReport, values: valueReport, errors: {} });
    setIsSubmitReport(false);

    return () => {
      setIsSubmitReport(false);
    };
  }, [valueReport]);

  const onSubmitReport = async () => {
    // e.preventDefault();

    const errors = Validate(validationsAppendx, formDataReport, [...listFieldReport]);
    if (Object.keys(errors).length > 0) {
      setFormDataReport((prevState) => ({ ...prevState, errors: errors }));
      return;
    }

    setIsSubmitReport(true);

    const body = {
        ...(formDataReport.values as any),
        // ...(data ? { id: data.id } : {}),
    };

    const response = await CampaignMarketingService.updateMAReport(body);

    if (response.code === 0) {
        showToast(`${data ? 'Cập nhật' : 'Thêm'} báo cáo thành công`, "success");
        setIsSubmitReport(false);
        getListReport(params);
        cancelAdd();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmitReport(false);
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
            disabled: isSubmitReport,
            callback: () => {
                !isDifferenceObj(formDataReport.values, valueReport) ? cancelAdd() : showDialogConfirmCancel();
            },
          },
          {
            title: dataReport ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmitReport || !isDifferenceObj(formDataReport.values, valueReport) || (formDataReport.errors && Object.keys(formDataReport.errors).length > 0),
            is_loading: isSubmitReport,
            callback: () => {
                onSubmitReport();
            },
          },
        ],
      },
    }),
    [formDataReport, valueReport, isSubmitReport]
  );

  const handleClearForm = () => {
    onHide(false);
    setIsAddReport(false);
    setDataReport(null)
    setFormDataReport({ values: valueReport, errors: {} });
    
  };

  const cancelAdd = () => {
    setIsAddReport(false);
    setDataReport(null)
    setFormDataReport({ values: valueReport, errors: {} });
  }

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
        if (isDifferenceObj(formDataReport.values, valueReport)) {
          showDialogConfirmCancel();
          if (focusedElement instanceof HTMLElement) {
            focusedElement.blur();
          }
        } else {
          onHide(false);
        }
      }
    },
    [formDataReport]
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
            if(!isSubmitReport){
                handleClearForm();
            }
        }}
        className="modal-add-marketing-report"
        size='lg'
      >
        <div className="container-add-marketing-report">
          <ModalHeader
            title={isAddReport? `${dataReport ? 'Chỉnh sửa báo cáo' : 'Thêm mới báo cáo'}` : `Danh sách báo cáo`} 
            toggle={() => {
                if(!isSubmitReport){
                    handleClearForm();
                }
            }}
          />
          <ModalBody>
            <div>
                {isAddReport? 
                    null
                    :
                    <div style={{display:'flex', justifyContent:'flex-end', marginTop: 10, marginBottom: 10, marginRight: 10}}>
                        
                        <Button
                            // type="submit"
                            color="primary"
                            // disabled={}
                            onClick = {() => {
                                setIsAddReport(true)
                            }}
                        >
                            Thêm báo cáo
                        </Button>
                    
                    </div>
                }

                {!isAddReport ? 
                    <div style={{maxHeight:'42rem', overflow:'auto'}}>
                        {!isLoading && reportList && reportList.length > 0 ? (
    
                        <BoxTable
                            name="Danh sách báo cáo"
                            titles={titlesReport}
                            items={reportList}
                            isPagination={true}
                            dataPagination={pagination}
                            dataMappingArray={(item, index) => dataMappingArray(item, index)}
                            dataFormat={dataFormatReport}
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
                        <SystemNotification description={<span>Hiện tại chưa có báo cáo nào.</span>} type="no-item" />
                        )}
                    </div>
                    :
                    <div className="list-form-group-marketing-report">
                        {listFieldReport.map((field, index) => (
                            <FieldCustomize
                                key={index}
                                field={field}
                                handleUpdate={(value) => handleChangeValidate(value, field, formDataReport, validationsAppendx, listFieldReport, setFormDataReport)}
                                formData={formDataReport}
                            />
                        ))}
                    </div>
                }
            </div>

          </ModalBody>
          <ModalFooter actions={isAddReport ? actionsAdd : actions} />
        </div>
      </Modal>
      <Dialog content={isAddReport ? contentDialogAdd : contentDialog} isOpen={isAddReport ? showDialogAdd : showDialog} />
      
    </Fragment>
  );
}
