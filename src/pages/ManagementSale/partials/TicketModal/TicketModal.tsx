import React, { useState, useEffect, useMemo, Fragment, useCallback } from "react";
import { IAction, IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IAddTicketModalProps } from "model/ticket/PropsModel";
import { ITicketRequestModel } from "model/ticket/TicketRequestModel";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import Icon from "components/icon";
import SelectCustom from "components/selectCustom/selectCustom";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Validate, { handleChangeValidate } from "utils/validate";
import { useActiveElement } from "utils/hookCustom";
import { showToast } from "utils/common";
import { getPageOffset, isDifferenceObj } from "reborn-util";
// import { uploadImageFromFiles } from "utils/image";
import FileService from "services/FileService";
import TicketService from "services/TicketService";
import TicketCategoryService from "services/TicketCategoryService";
import CustomerService from "services/CustomerService";
import EmployeeService from "services/EmployeeService";
import { SelectOptionData } from "utils/selectCommon";
import ImageThirdGender from "assets/images/third-gender.png";
import "./TicketModal.scss";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { ITicketResponseModel } from "model/ticket/TicketResponseModel";
import Badge from "components/badge/badge";
import Button from "components/button/button";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";

interface IOptionDataCustomer {
  value: number;
  label: string;
  employeeId: number;
  employeePhone: string;
  employeeName: string;
}

export default function TicketModal(props: IAddTicketModalProps) {
  const { onShow, onHide, data, idCustomer, saleflowId, sieId } = props;

  const focusedElement = useActiveElement();

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataTicket, setDataTicket] = useState(null);

  const [isAddTicket, setIsAddTicket] = useState(false);
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
    name: "hỗ trợ",
    isChooseSizeLimit: true,
    setPage: (page) => {
        setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
        setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
});

const [ticketList, setTicketList] = useState([]);
const abortController = new AbortController();

const getListTicket = async (paramsSearch: any) => {
    setIsLoading(true);

    const response = await TicketService.list(paramsSearch, abortController.signal);

    if (response.code == 0) {
        const result = response.result;
        setTicketList(result.items);

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
    getListTicket(params)
}, [params]);

const titles = ["STT", "Mã phiếu", "Tên phiếu", "Tên khách hàng", "Danh mục hỗ trợ", "Trạng thái xử lý",];
const dataFormat = ["text-center", "", "", "", "", "text-center", "text-center", "", "", "text-center"];


const dataMappingArray = (item: ITicketResponseModel, index: number) => [
    getPageOffset(params) + index + 1,
    item.code,
    item.name,
    <span
      key={item.id}
      style={{ cursor: "pointer" }}
    //   onClick={() => {
    //     navigate(`/detail_ticket/ticketId/${item.id}`);
    //   }}
    >
      {item.customerName}
    </span>,
    item.supportName,
    // item.createdTime ? moment(item.createdTime).format("DD/MM/YYYY") : "",
    // item.endDate ? moment(item.endDate).format("DD/MM/YYYY") : "",
    // item.employeeName,
    // item.creatorName,
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
                setDataTicket(item);
                setIsAddTicket(true);
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
              Bạn có chắc chắn muốn xóa phiếu hỗ trợ cho khách hàng {item ? <strong>{item.customerName}</strong> : ""}? Thao tác này không thể khôi phục.
            </Fragment>
          ),
          cancelText: "Hủy",
          cancelAction: () => {
            setShowDialog(false);
            setContentDialog(null);
          },
          defaultText: "Xóa",
          defaultAction: async () => {
            const response = await TicketService.delete(item.id);
            if (response.code === 0) {
                showToast("Xóa hỗ trợ thành công", "success");
                getListTicket(params)
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

///Thêm ticket
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialogAdd, setShowDialogAdd] = useState<boolean>(false);
  const [contentDialogAdd, setContentDialogAdd] = useState<IContentDialog>(null);

  const [listCustomer, setListCustomer] = useState<IOptionDataCustomer[]>([]);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);

  const [listDepartment, setListDepartment] = useState<IOption[]>([]);
  const [isLoadingDepartment, setIsLoadingDepartment] = useState<boolean>(false);

  const [listSupport, setListSupport] = useState<IOption[]>(null);
  const [isLoadingSupport, setIsLoadingSupport] = useState<boolean>(false);

  const [listImageTicket, setListImageTicket] = useState([]);

  const [changeValueCustomer, setChangeValueCustomer] = useState(null);
  const [changeValueExecutor, setChangeValueExecutor] = useState(null);

  // Chọn phòng ban tiếp nhận
  const onSelectOpenDepartment = async () => {
    if (!listDepartment || listDepartment.length === 0) {
      setIsLoadingDepartment(true);
      const dataOption = await SelectOptionData("departmentId");
      if (dataOption) {
        setListDepartment([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingDepartment(false);
    }
  };

  // Chọn lý do bảo hành
  const onSelectOpenSupport = async () => {
    const param = {
      type: 2,
    };

    if (!listSupport || listSupport.length === 0) {
      setIsLoadingSupport(true);
      const response = await TicketCategoryService.list(param);
      if (response.code === 0) {
        const dataOption = response.result;
        setListSupport([
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
      setIsLoadingSupport(false);
    }
  };

  useEffect(() => {
    if (dataTicket?.supportId) {
      onSelectOpenSupport();
    }

    if (dataTicket?.supportId === null) {
      setListSupport([]);
    }
  }, [dataTicket]);

  // Chọn khách hàng cần bảo hành
  const onSelectOpenCustomer = async () => {
    const param = {
      limit: 10000,
    };

    if (!listCustomer || listCustomer.length === 0) {
      setIsLoadingCustomer(true);
      const response = await CustomerService.filter(param);

      if (response.code === 0) {
        const dataOption = response.result.items;
        setListCustomer([
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: `${item.name} - ${item.phoneMasked}`,
                  employeeId: item.employeeId,
                  employeePhone: item.employeePhone,
                  employeeName: item.employeeName,
                };
              })
            : []),
        ]);
      }

      setIsLoadingCustomer(false);
    }
  };

  useEffect(() => {
    if (dataTicket?.customerId || idCustomer) {
      onSelectOpenCustomer();
    }

    if (dataTicket?.customerId === null) {
      setListCustomer([]);
    }
  }, [dataTicket, idCustomer]);

  useEffect(() => {
    if (listCustomer.length > 0 && (idCustomer || dataTicket?.id) && onShow) {
      const takeDetailCustomer = listCustomer.find((item) => item.value === (dataTicket?.customerId || idCustomer));
      setChangeValueCustomer(takeDetailCustomer);
    }
  }, [listCustomer, idCustomer, onShow]);

  const values = useMemo(
    () =>
      ({
        employeeId: dataTicket?.employeeId ?? null,
        // departmentId: data?.departmentId ?? null,
        customerId: dataTicket?.customerId ?? idCustomer ?? null,
        startDate: dataTicket?.startDate ?? new Date(),
        endDate: dataTicket?.endDate ?? "",
        name: dataTicket?.name ?? "",
        phone: dataTicket?.phone ?? "",
        supportId: dataTicket?.supportId ?? null,
        content: dataTicket?.content ?? "",
        docLink: dataTicket?.docLink ?? "[]",
        statusId: dataTicket?.statusId ?? null,
        // executorId: data?.executorId ?? null,
      } as ITicketRequestModel),
    [onShow, dataTicket]
  );

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "startDate",
      rules: "required",
    },
    {
      name: "endDate",
      rules: "required",
    },
    {
      name: "supportId",
      rules: "required",
    },
    // {
    //   name: "phone",
    //   rules: "nullable|regex",
    // },
    {
      name: "customerId",
      rules: "required",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({
    values: values,
  });

  const listFieldVoteInfo = useMemo(
    () =>
      [
        {
          label: "Tên phiếu",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Khách hàng",
          name: "customerId",
          type: "select",
          fill: true,
          required: true,
          options: listCustomer,
          onMenuOpen: onSelectOpenCustomer,
          isLoading: isLoadingCustomer,
          onChange: (e) => handleChangeValueCustomer(e),
          disabled: idCustomer ? true : false,
        },
        ...((dataTicket?.customerId || formData?.values?.customerId) && changeValueCustomer?.employeeId
          ? ([
              {
                type: "custom",
                name: "employeeId",
                snippet: (
                  <SelectCustom
                    id="employeeId"
                    name="employeeId"
                    label="Nhân viên phụ trách"
                    fill={true}
                    options={[]}
                    special={true}
                    value={{ value: changeValueCustomer.employeeId, label: changeValueCustomer.employeeName }}
                    disabled={true}
                    placeholder="Chọn nhân viên phụ trách"
                  />
                ),
              },
              {
                label: "SĐT nhân viên phụ trách",
                name: "phone",
                type: "text",
                fill: true,
                disabled: true,
              },
            ] as IFieldCustomize[])
          : []),
        {
          label: "Danh mục hỗ trợ",
          name: "supportId",
          type: "select",
          fill: true,
          required: true,
          options: listSupport,
          onMenuOpen: onSelectOpenSupport,
          isLoading: isLoadingSupport,
        },
      ] as IFieldCustomize[],
    [listCustomer, isLoadingCustomer, listSupport, isLoadingSupport, changeValueCustomer, dataTicket, idCustomer, formData?.values]
  );


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
          placeholder: "Chọn ngày dự kiến kết thúc",
          minDate: new Date(formData?.values?.startDate),
        },
        {
          label: "Nội dung hỗ trợ",
          name: "content",
          type: "textarea",
          fill: true,
        },
      ] as IFieldCustomize[],
    [listDepartment, isLoadingDepartment, changeValueExecutor, formData?.values]
  );

  // change value customer
  const handleChangeValueCustomer = (e) => {
    setChangeValueCustomer(e);
  };

  useEffect(() => {
    setFormData({
      ...formData,
      values: { ...formData.values, employeeId: changeValueCustomer?.employeeId, phone: changeValueCustomer?.employeePhone },
    });
  }, [changeValueCustomer]);

  // change value executor
  const handleChangeValueExecutor = (e) => {
    setChangeValueExecutor(e);

    setFormData({ ...formData, values: { ...formData?.values, executorId: e.value } });
  };

  useEffect(() => {
    const result = JSON.parse(formData.values.docLink).map((item) => item.url);
    setListImageTicket(result);
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

    const errors = Validate(validations, formData, [...listFieldVoteInfo, ...listFieldReceptionDepartment]);

    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    setIsSubmit(true);

    const body: ITicketRequestModel = {
      ...(dataTicket ? { id: dataTicket?.id } : {}),
      ...(formData.values as ITicketRequestModel),
      ...(saleflowId ? {saleflowId: saleflowId} : {}),
      ...(sieId ? {sieId: sieId} : {})
    };

    const response = await TicketService.update(body);

    if (response.code === 0) {
      showToast(`${dataTicket ? "Cập nhật" : "Thêm mới"} hỗ trợ thành công`, "success");
    //   onHide(true);
      setChangeValueExecutor(null);
      handleBack();
      getListTicket(params);
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
            title: dataTicket ? "Cập nhật" : "Tạo mới",
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
      title: <Fragment>{`Hủy bỏ thao tác ${dataTicket ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        // onHide(false);
        handleBack();
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
    setListImageTicket([...listImageTicket, url]);
  };

  const handUploadFile = async (file) => {
    await FileService.uploadFile({ data: file, onSuccess: processUploadSuccess });
  };

  const processUploadSuccess = (data) => {
    const result = data?.fileUrl;
    setListImageTicket([...listImageTicket, result]);
  };

  useEffect(() => {
    const result = listImageTicket.map((item) => {
      return {
        type: "image",
        url: item,
      };
    });
    setFormData({ ...formData, values: { ...formData.values, docLink: JSON.stringify(result) } });
  }, [listImageTicket]);

  const handleRemoveImageItem = (idx) => {
    const result = JSON.parse(formData.values.docLink);
    result.splice(idx, 1);
    setFormData({ ...formData, values: { ...formData.values, docLink: JSON.stringify(result) } });
  };

  const handleClearForm = () => {
    onHide(false);
    setIsAddTicket(false);
    setFormData({ ...formData, values: values });
    setDataTicket(null)
  }

  const handleBack = () => {
    setIsAddTicket(false);
    setFormData({ ...formData, values: values });
    setDataTicket(null);
  }

  return (
    <Fragment>
      <Modal
        isOpen={onShow}
        isFade={true}
        staticBackdrop={true}
        isCentered={true}
        toggle={() => !isSubmit && handleClearForm()}
        className="modal-add-ticket-saleflow"
        size="lg"
      >
        {/* <form className="form-ticket-group" onSubmit={(e) => onSubmit(e)}> */}
        <div className="form-ticket-group">
          <ModalHeader title={`${dataTicket ? "Chỉnh sửa" : "Thêm mới"} hỗ trợ`} toggle={() => !isSubmit && handleClearForm()} />
          <ModalBody>
            <div>
                <div style={{display:'flex', justifyContent:'flex-end', marginTop: 10, marginRight: 10}}>
                    {isAddTicket ? 
                    null
                    :
                    <Button
                        // type="submit"
                        color="primary"
                        // disabled={}
                        onClick = {() => {
                            setIsAddTicket(true)
                        }}
                    >
                        Thêm mới
                    </Button>
                    }
                </div>
                {!isAddTicket ?
                    <div className="table-ticket">
                        {!isLoading && ticketList && ticketList.length > 0 ? (
                            <BoxTable
                                name="Danh sách phiếu hỗ trợ"
                                titles={titles}
                                items={ticketList}
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
                    <div className="wrapper-field-ticket-service">
                        <div className="list-field">
                        {listFieldVoteInfo.map((field, index) => (
                            <FieldCustomize
                            key={index}
                            field={field}
                            handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listFieldVoteInfo, setFormData)}
                            formData={formData}
                            />
                        ))}
                        </div>
                        <div className="attachments">
                        <label className="title-attachment">Tải ảnh lên</label>
                        <div className={JSON.parse(formData.values.docLink).length >= 5 ? "list-image-scroll" : "wrapper-list-image"}>
                            {JSON.parse(formData.values.docLink || "[]").length === 0 ? (
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
          <ModalFooter actions={isAddTicket ? actionsAdd : actions} />
        </div>
        {/* </form> */}
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
