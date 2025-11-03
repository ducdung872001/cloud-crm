import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IAction, IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { handDownloadFileOrigin, showToast } from "utils/common";
import { convertToId, getPageOffset, isDifferenceObj } from "reborn-util";
import "./SettingReportModal.scss";
import Icon from "components/icon";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Loading from "components/loading";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import Button from "components/button/button";
import BoxTable from "components/boxTable/boxTable";
import SelectCustom from "components/selectCustom/selectCustom";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import ReportChartService from "services/ReportChartService";

export default function SettingReportModal(props: any) {
  const { onShow, onHide, dataReportDashboard} = props;
  const focusedElement = useActiveElement();

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataChart, setDataChart] = useState(null);
  
  const [isAddAttribute, setIsAddAttribute] = useState(false);
  const [params, setParams] = useState({
      name: "",
      limit: 10,
  });

  useEffect(() => {
      if(dataReportDashboard && onShow){
          setParams((preState) => ({...preState, dashboardId: dataReportDashboard?.id}))
      }
  }, [dataReportDashboard, onShow])

    const [pagination, setPagination] = useState<PaginationProps>({
        ...DataPaginationDefault,
        name: "biểu đồ",
        isChooseSizeLimit: true,
        setPage: (page) => {
            setParams((prevParams) => ({ ...prevParams, page: page }));
        },
        chooseSizeLimit: (limit) => {
            setParams((prevParams) => ({ ...prevParams, limit: limit }));
        },
    });


    const [chartList, setChartList] = useState([])

    const abortController = new AbortController();

    const getListChart = async (paramsSearch: any) => {
        setIsLoading(true);

        const response = await ReportChartService.listArtifactByDashboard(paramsSearch, abortController.signal);

        if (response.code == 0) {
            const result = response.result;
            setChartList(result);

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
        getListChart(params)
    }, [params])

    const titles = ["STT", "Tên biểu đồ", "Thứ tự hiển thị", "Độ rộng (%)"];
    const dataFormat = ["text-center", "", "text-center", "text-right"];

    const dataMappingArray = (item: any, index: number) => [
        getPageOffset(params) + index + 1,
        item.name,
        item.position,
        <span style={{fontSize: 14}}>{item.width}%</span>
    ];

    const actionsTable = (item: any): IAction[] => {
        
        return [
          {
            title: "Sửa",
            icon: <Icon name="Pencil" />,
            callback: () => {
                setDataChart(item);
                setIsAddAttribute(true);
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
              Bạn có chắc chắn muốn xóa biểu đồ đã chọn {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
            </Fragment>
          ),
          cancelText: "Hủy",
          cancelAction: () => {
            setShowDialog(false);
            setContentDialog(null);
          },
          defaultText: "Xóa",
          defaultAction: async () => {
            const response = await ReportChartService.deleteReportConfig(item.configId);
            if (response.code === 0) {
                showToast("Xóa biểu đồ thành công", "success");
                getListChart(params)
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

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialogAdd, setShowDialogAdd] = useState<boolean>(false);
  const [contentDialogAdd, setContentDialogAdd] = useState<IContentDialog>(null);
  const [valueChart, setValueChart] = useState(null);

  useEffect(() => {
    if(dataChart?.id){
        setValueChart({value: dataChart.id, label: dataChart.name})
    }
  }, [dataChart])
  

  const values = useMemo(
    () =>
    ({
      id: dataChart?.configId ??  0,
      dashboardId: dataChart?.dashboardId ?? dataReportDashboard?.id ?? 0,
      artifactId: dataChart?.id ?? 0,
      position: dataChart?.position ?? 0,
      width: dataChart?.width?.toString() ?? '50',
    } as any),
    [onShow, dataChart, dataReportDashboard]
  );  

  const [formData, setFormData] = useState<IFormData>({ values: values });
  
  const validations: IValidation[] = [
    {
        name: "name",
        rules: "required",
    },

    {
        name: "position",
        rules: "required|min:0",
    }
    
  ];

  const loadedOptionArtifact = async (search, loadedOptions, { page }) => {

    const params = {
        name: search,
        limit: 10,
        page: 1
    }

    const response = await ReportChartService.listReportArtifact(params);

    if (response.code === 0) {
      const dataOption = response.result?.items;

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


  const handleChangeValueArtifact = (e) => {
    setValueChart(e);
    setFormData({ ...formData, values: { ...formData?.values, artifactId: e.value } });

  };


  const listFieldBasic = useMemo(
    () =>
      [
        {
            name: "artifactId",
            type: "custom",
            snippet: (
                <SelectCustom
                    id="artifactId"
                    name="artifactId"
                    label= "Biểu đồ"
                    fill={true}
                    options={[]}
                    isMulti={false}
                    value={valueChart}
                    onChange={(e) => handleChangeValueArtifact(e)}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={true}
                    loadOptionsPaginate={loadedOptionArtifact}
                    placeholder="Chọn biểu đồ"
                    additional={{
                        page: 1,
                    }}
                />
            ),
        },
        
        {
            label: "Thứ tự hiển thị",
            name: "position",
            type: "number",
            fill: true,
        },

        {
            label: "Độ rộng",
            name: "width",
            type: "radio",
            options: [
              {
                value: "50",
                label: "50%",
              },
              {
                value: "100",
                label: "100%",
              },
            
            ],
        },
       
      ] as IFieldCustomize[],
    [formData?.values, valueChart]
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

    const response = await ReportChartService.updateReportConfig(body);

    if (response.code === 0) {
        showToast(`Thêm biểu đồ thành công`, "success");
        setIsSubmit(false);
        getListChart(params);
        cancelAdd();

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
            title: dataChart ? "Cập nhật" : "Thêm mới",
            type: "submit",
            color: "primary",
            disabled:
              isSubmit ||
              !isDifferenceObj(formData.values, values) ||
              (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
            callback: () => {
              onSubmit();
            },
          },
        ],
      },
    }),
    [formData, values, isSubmit, dataChart]
  );

  const cancelAdd = () => {
    setIsAddAttribute(false);
    setDataChart(null);
    setValueChart(null);
    if(!dataChart){
      setFormData({ ...formData, values: values, errors: {} });
    }
    
  }

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${dataChart ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
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
            if(!isSubmit){
                cancelAdd();
                onHide();
            }
        }}
        className="modal-setting-report"
        size="lg"
      >
        <div className="container-setting-report">
          <ModalHeader
            title={isAddAttribute ? `${dataChart? 'Chỉnh sửa biểu đồ' : 'Thêm mới biểu đồ'}` : `Danh sách biểu đồ`} 
            toggle={() => {
                if(!isSubmit){
                    cancelAdd();
                    onHide();
                }
            }}
          />
          <ModalBody>
            <div className="form-setting-report">
                {isAddAttribute ? 
                  null
                  :
                  <div style={{display:'flex', justifyContent:'flex-end', marginBottom: 10}}>
                      <Button
                          // type="submit"
                          color="primary"
                          // disabled={}
                          onClick = {() => {
                              setIsAddAttribute(true)
                          }}
                      >
                          Thêm biểu đồ
                      </Button>
                  </div>
                 }

                {!isAddAttribute ? 
                    <div>
                        {!isLoading && chartList && chartList.length > 0 ? (
                            <BoxTable
                                name="Danh sách biểu đồ"
                                titles={titles}
                                items={chartList}
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
                        <SystemNotification description={<span>Hiện tại chưa có biểu đồ nào nào.</span>} type="no-item" />
                        )}
                    </div>
                    : 
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
                }
            </div>

          </ModalBody>
          <ModalFooter actions={isAddAttribute ? actionsAdd : actions} />
        </div>
      </Modal>
      <Dialog content={isAddAttribute ? contentDialogAdd : contentDialog} isOpen={isAddAttribute ? showDialogAdd : showDialog} />
      
    </Fragment>
  );
}
