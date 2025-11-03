import React, { useState, useEffect, useMemo, Fragment, useCallback } from "react";
import { IAction, IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IAddWarrantyModelProps } from "model/warranty/PropsModel";
import { IWarrantyRequestModel } from "model/warranty/WarrantyRequestModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { IWarrantyCategoryFilterRequest } from "model/warrantyCategory/WarrantyCategoryRequestModel";
import Icon from "components/icon";
import SelectCustom from "components/selectCustom/selectCustom";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import { showToast } from "utils/common";
import { getPageOffset, isDifferenceObj } from "reborn-util";
import { SelectOptionData } from "utils/selectCommon";
import WarrantyService from "services/WarrantyService";
import EmployeeService from "services/EmployeeService";
import WarrantyCategoryService from "services/WarrantyCategoryService";
// import { uploadImageFromFiles } from "utils/image";
import FileService from "services/FileService";
import ImageThirdGender from "assets/images/third-gender.png";
import "./WarrantyModal.scss";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { IWarrantyResponseModel } from "model/warranty/WarrantyResponseModel";
import Badge from "components/badge/badge";
import Button from "components/button/button";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";

export default function WarrantyModal(props: IAddWarrantyModelProps) {
  const { onShow, onHide, idCustomer, saleflowId, sieId } = props;
  
  const focusedElement = useActiveElement();

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataWarranty, setDataWarranty] = useState(null);

  const [isAddWarranty, setIsAddWarranty] = useState(false);
  const [params, setParams] = useState({
      name: "",
      limit: 10,
  });

    useEffect(() => {
        if(sieId && onShow){
            setParams((preState) => ({...preState, sieId: sieId}))
        }
    }, [sieId, onShow])

    const [pagination, setPagination] = useState<PaginationProps>({
        ...DataPaginationDefault,
        name: "bảo hành",
        isChooseSizeLimit: true,
        setPage: (page) => {
            setParams((prevParams) => ({ ...prevParams, page: page }));
        },
        chooseSizeLimit: (limit) => {
            setParams((prevParams) => ({ ...prevParams, limit: limit }));
        },
    });

    const [warrantyList, setWarrantyList] = useState([]);
    const abortController = new AbortController();

    const getListWarranty = async (paramsSearch: any) => {
        setIsLoading(true);

        const response = await WarrantyService.list(paramsSearch, abortController.signal);

        if (response.code == 0) {
            const result = response.result;
            setWarrantyList(result.items);

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
        getListWarranty(params)
    }, [params]);


    const titles = ["STT", "Mã phiếu", "Tên khách hàng", "Dịch vụ bảo hành", "Lí do bảo hành", "Trạng thái xử lý",];
    const dataFormat = ["text-center", "text-center", "", "", "", "", "text-center", "text-center", "text-center"];

    const dataMappingArray = (item: IWarrantyResponseModel, index: number) => [
        getPageOffset(params) + index + 1,
        item.code,
        <span
          key={item.id}
          style={{ cursor: "pointer" }}
        //   onClick={() => {
        //     navigate(`/detail_warranty/warrantyId/${item.id}`);
        //   }}
        >
          {item.customerName}
        </span>,
        item.serviceName,
        <span key={item.id} style={{ color: "#dc3545" }}>
          {item.reasonName}
        </span>,
        // item.employeeName,
        // item.createdTime ? moment(item.createdTime).format("DD/MM/YYYY") : "",
        // item.endDate ? moment(item.endDate).format("DD/MM/YYYY") : "",
        <Badge
          key={item.id}
          text={!item.status ? "Chưa thực hiện" : item.status === 1 ? "Đang thực hiện" : item.status === 2 ? "Đã hoàn thành" : "Đã hủy"}
          variant={!item.status ? "secondary" : item.status === 1 ? "warning" : item.status === 2 ? "success" : "error"}
        />,
      ];

    const actionsTable = (item: any): IAction[] => {
        
        return [
          
          {
            title: "Sửa",
            icon: <Icon name="Pencil" />,
            callback: () => {
                setDataWarranty(item);
                setIsAddWarranty(true);
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
              Bạn có chắc chắn muốn xóa phiếu bảo hành cho khách hàng {item ? <strong>{item.customerName}</strong> : ""}? Thao tác này không thể khôi phục.
            </Fragment>
          ),
          cancelText: "Hủy",
          cancelAction: () => {
            setShowDialog(false);
            setContentDialog(null);
          },
          defaultText: "Xóa",
          defaultAction: async () => {
            const response = await WarrantyService.delete(item.id);
            if (response.code === 0) {
                showToast("Xóa bảo hành thành công", "success");
                getListWarranty(params)
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
                  handleClearForm();
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



/////Thêm bảo hành
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialogAdd, setShowDialogAdd] = useState<boolean>(false);
  const [contentDialogAdd, setContentDialogAdd] = useState<IContentDialog>(null);

  const [listReason, setListReason] = useState<IOption[]>(null);
  const [isLoadingReason, setIsLoadingReason] = useState<boolean>(false);

  const [listCustomer, setListCustomer] = useState<IOption[]>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);

  const [listDepartment, setListDepartment] = useState<IOption[]>(null);
  const [isLoadingDepartment, setIsLoadingDepartment] = useState<boolean>(false);

  const [listService, setListService] = useState<IOption[]>(null);
  const [isLoadingService, setIsLoadingService] = useState<boolean>(false);

  const [listImageWarranty, setListImageWarranty] = useState([]);


  // Chọn lý do bảo hành
  const onSelectOpenReason = async () => {
    const param: IWarrantyCategoryFilterRequest = {
      type: 2,
    };

    if (!listReason || listReason.length === 0) {
      setIsLoadingReason(true);
      const response = await WarrantyCategoryService.list(param);
      if (response.code === 0) {
        const dataOption = response.result;
        setListReason([
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                };
              })
            : []),
        ]);
      }
      setIsLoadingReason(false);
    }
  };

  useEffect(() => {
    if (dataWarranty?.reasonId) {
      onSelectOpenReason();
    }

    if (dataWarranty?.reasonId === null) {
      setListReason([]);
    }
  }, [dataWarranty]);

  // Chọn khách hàng cần bảo hành
  const onSelectOpenCustomer = async () => {
    if (!listCustomer || listCustomer.length === 0) {
      setIsLoadingCustomer(true);
      const dataOption = await SelectOptionData("customerId");
      if (dataOption) {
        setListCustomer([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingCustomer(false);
    }
  };

  useEffect(() => {
    if (dataWarranty?.customerId || idCustomer) {
      onSelectOpenCustomer();
    }

    if (dataWarranty?.customerId === null) {
      setListCustomer([]);
    }
  }, [dataWarranty, idCustomer]);

  // Chọn dịch vụ được bảo hành
  const onSelectOpenService = async () => {
    if (!listService || listService.length === 0) {
      setIsLoadingService(true);
      const dataOption = await SelectOptionData("serviceId");
      if (dataOption) {
        setListService([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingService(false);
    }
  };

  useEffect(() => {
    if (dataWarranty?.serviceId) {
      onSelectOpenService();
    }

    if (dataWarranty?.serviceId === null) {
      setListService([]);
    }
  }, [dataWarranty]);

  const values = useMemo(
    () =>
      ({
        // executorId: data?.executorId ?? null,
        // departmentId: data?.departmentId ?? null,
        customerId: dataWarranty?.customerId ?? idCustomer ?? null,
        serviceId: dataWarranty?.serviceId ?? null,
        startDate: dataWarranty?.startDate ?? new Date(),
        endDate: dataWarranty?.endDate ?? "",
        reasonId: dataWarranty?.reasonId ?? null,
        docLink: dataWarranty?.docLink ?? "[]",
        solution: dataWarranty?.solution ?? "",
        note: dataWarranty?.note ?? "",
        statusId: dataWarranty?.statusId ?? null,
      } as IWarrantyRequestModel),
    [onShow, dataWarranty]
  );

  const validations: IValidation[] = [
    {
      name: "startDate",
      rules: "required",
    },
    {
      name: "endDate",
      rules: "required",
    },
    {
      name: "reasonId",
      rules: "required",
    },
    {
      name: "customerId",
      rules: "required",
    },
    {
      name: "serviceId",
      rules: "required",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({
    values: values,
  });

  const listFieldWarrantyService = useMemo(
    () =>
      [
        {
          label: "Bảo hành cho khách hàng",
          name: "customerId",
          type: "select",
          fill: true,
          required: true,
          disabled: idCustomer ? true : false,
          options: listCustomer,
          onMenuOpen: onSelectOpenCustomer,
          isLoading: isLoadingCustomer,
        },
        {
          label: "Dịch vụ bảo hành",
          name: "serviceId",
          type: "select",
          fill: true,
          required: true,
          options: listService,
          onMenuOpen: onSelectOpenService,
          isLoading: isLoadingService,
        },
        {
          label: "Lý do bảo hành",
          name: "reasonId",
          type: "select",
          fill: true,
          required: true,
          options: listReason,
          onMenuOpen: onSelectOpenReason,
          isLoading: isLoadingReason,
        },
      ] as IFieldCustomize[],
    [listReason, isLoadingReason, listCustomer, isLoadingCustomer, listService, isLoadingService]
  );

  const [changeValueExecutor, setChangeValueExecutor] = useState(null);

  const listFieldReceptionDepartment = useMemo(
    () =>
      [
        {
          label: "Ngày tiếp nhận",
          name: "startDate",
          type: "date",
          fill: true,
          required: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          maxDate: new Date(formData?.values?.endDate),
        },
        {
          label: "Ngày dự kiến kết thúc",
          name: "endDate",
          type: "date",
          fill: true,
          required: true,
          icon: <Icon name="Calendar" />,
          iconPosition: "left",
          minDate: new Date(formData?.values?.startDate),
        },
        {
          label: "Giải pháp",
          name: "solution",
          type: "textarea",
          fill: true,
        },
        {
          label: "Ghi chú",
          name: "note",
          type: "textarea",
          fill: true,
        },
      ] as IFieldCustomize[],
    [listDepartment, isLoadingDepartment, formData?.values, changeValueExecutor]
  );

  useEffect(() => {
    const result = JSON.parse(formData.values.docLink || []).map((item: any) => item.url);
    setListImageWarranty(result);
  }, [formData.values.docLink]);

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const onSubmit = async () => {
    // e.preventDefault();

    const errors = Validate(validations, formData, [...listFieldWarrantyService, ...listFieldReceptionDepartment]);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    setIsSubmit(true);

    const body: IWarrantyRequestModel = {
      ...(dataWarranty ? { id: dataWarranty?.id } : {}),
      ...(formData.values as IWarrantyRequestModel),
      ...(saleflowId ? {saleflowId: saleflowId} : {}),
      ...(sieId ? {sieId: sieId} : {})
    };

    const response = await WarrantyService.update(body);

    if (response.code === 0) {
      showToast(`${dataWarranty ? "Cập nhật" : "Thêm mới"} bảo hành thành công`, "success");
    //   onHide(true);
      setChangeValueExecutor(null);
      handleBack();
      getListWarranty(params);
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
            title: dataWarranty ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
            callback: () => {
                onSubmit()
            }
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
      title: <Fragment>{`Hủy bỏ thao tác ${dataWarranty ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialogAdd(false);
        setContentDialogAdd(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        // onHide(false);
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

  // xử lý hình ảnh
  const handleImageUpload = (e) => {
    e.preventDefault();

    if (e.target.files && e.target.files.length > 0) {
      const maxSize = 1048576;

      if (e.target.files[0].size > maxSize) {
        showToast("Ảnh tải lên giới hạn dung lượng không quá 2MB", "warning");
        e.target.value = "";
      } else {
        // uploadImageFromFiles(e.target.files, showImage, false);
        handUploadFile(e.target.files[0]);

        e.target.value = null;
      }
    }
  };

  const showImage = (url, filekey) => {
    setListImageWarranty([...listImageWarranty, url]);
  };

  const handUploadFile = async (file) => {
    await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess });
  };

  const processUploadSuccess = (data) => {
    const result = data?.fileUrl;
    setListImageWarranty([...listImageWarranty, result]);
  };

  useEffect(() => {
    const merge = listImageWarranty.map((item) => {
      return {
        type: "image",
        url: item,
      };
    });
    setFormData({ ...formData, values: { ...formData.values, docLink: JSON.stringify(merge) } });
  }, [listImageWarranty]);

  const handleRemoveImageItem = (idx) => {
    const result = JSON.parse(formData.values.docLink);
    result.splice(idx, 1);
    setFormData({ ...formData, values: { ...formData.values, docLink: JSON.stringify(result) } });
  };

  const handleClearForm = () => {
    onHide(false);
    setIsAddWarranty(false);
    setFormData({ ...formData, values: values });
    setDataWarranty(null)
  }

  const handleBack = () => {
    setIsAddWarranty(false);
    setFormData({ ...formData, values: values });
    setDataWarranty(null);
  }
  return (
    <Fragment>
      <Modal
        isOpen={onShow}
        isFade={true}
        staticBackdrop={true}
        isCentered={true}
        toggle={() => !isSubmit && handleClearForm()}
        className="modal-add-warranty-saleflow"
        size="lg"
      >
        {/* <form className="form-warranty-group" onSubmit={(e) => onSubmit(e)}> */}
        <div className="form-warranty-group">
          <ModalHeader title={isAddWarranty ? `${dataWarranty ? "Chỉnh sửa" : "Thêm mới"} bảo hành` : 'Danh sách bảo hành'} toggle={() => !isSubmit && handleClearForm()} />
          <ModalBody>
            <div>
                <div style={{display:'flex', justifyContent:'flex-end', marginTop: 10, marginRight: 10}}>
                    {isAddWarranty ? 
                    null
                    :
                    <Button
                        // type="submit"
                        color="primary"
                        // disabled={}
                        onClick = {() => {
                            setIsAddWarranty(true)
                        }}
                    >
                        Thêm mới
                    </Button>
                    }
                </div>

                {!isAddWarranty ?
                    <div className="table-warranty">
                        {!isLoading && warrantyList && warrantyList.length > 0 ? (
                            <BoxTable
                                name="Danh sách phiếu bảo hành"
                                titles={titles}
                                items={warrantyList}
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
                            <SystemNotification description={<span>Hiện tại chưa có phiếu bảo hành nào.</span>} type="no-item" />
                        )}
                    </div>
                    :
                    <div className="list-form-group">
                        <div className="wrapper-field-warranty-service">
                            <div className="list-field">
                            {listFieldWarrantyService.map((field, index) => (
                                <FieldCustomize
                                key={index}
                                field={field}
                                handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldWarrantyService, setFormData)}
                                formData={formData}
                                />
                            ))}
                            </div>
                            <div className="attachments">
                            <label className="title-attachment">Tải ảnh lên</label>
                            <div className={listImageWarranty.length >= 5 ? "list-image-scroll" : "wrapper-list-image"}>
                                {JSON.parse(formData.values.docLink).length === 0 ? (
                                <label htmlFor="imageUpload" className="action-upload-image">
                                    <div className="wrapper-upload">
                                    <Icon name="Upload" />
                                    Tải ảnh lên
                                    </div>
                                </label>
                                ) : (
                                <Fragment>
                                    <div className="d-flex align-items-center">
                                    {JSON.parse(formData.values.docLink).map((item, idx) => (
                                        <div key={idx} className="image-item">
                                        <img src={item.url} alt="image-warranty" />
                                        <span className="icon-delete" onClick={() => handleRemoveImageItem(idx)}>
                                            <Icon name="Trash" />
                                        </span>
                                        </div>
                                    ))}
                                    <label htmlFor="imageUpload" className="add-image">
                                        <Icon name="PlusCircleFill" />
                                    </label>
                                    </div>
                                </Fragment>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/gif,image/jpeg,image/png,image/jpg"
                                className="d-none"
                                id="imageUpload"
                                onChange={(e) => handleImageUpload(e)}
                            />
                            </div>
                        </div>
                        <div className="wrapper-field-reception-department">
                            {listFieldReceptionDepartment.map((field, index) => (
                            <FieldCustomize
                                key={index}
                                field={field}
                                handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldReceptionDepartment, setFormData)}
                                formData={formData}
                            />
                            ))}
                        </div>
                    </div>
                }
            </div>
          </ModalBody>
          <ModalFooter actions={isAddWarranty ? actionsAdd : actions} />
        </div>
        {/* </form> */}
      </Modal>
      <Dialog content={isAddWarranty ? contentDialogAdd : contentDialog} isOpen={isAddWarranty ? showDialogAdd : showDialog} />
    </Fragment>
  );
}
