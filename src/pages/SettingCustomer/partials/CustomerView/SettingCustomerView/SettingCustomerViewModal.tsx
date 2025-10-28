import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IAction, IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { handDownloadFileOrigin, showToast } from "utils/common";
import { convertToId, getPageOffset, isDifferenceObj } from "reborn-util";
import "./SettingCustomerViewModal.scss";
import Icon from "components/icon";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Loading from "components/loading";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import Button from "components/button/button";
import BoxTable from "components/boxTable/boxTable";
import CustomerFieldService from "services/CustomerFieldService";
import SelectCustom from "components/selectCustom/selectCustom";
import CustomerService from "services/CustomerService";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";

export default function SettingCustomerViewModal(props: any) {
  const { onShow, onHide, dataCustomerView} = props;
  const focusedElement = useActiveElement();

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataAttribute, setDataAttribute] = useState(null);
  console.log('dataAttribute', dataAttribute);
  
  const [isAddAttribute, setIsAddAttribute] = useState(false);
  const [params, setParams] = useState({
      name: "",
      limit: 10,
  });

  useEffect(() => {
      if(dataCustomerView && onShow){
          setParams((preState) => ({...preState, viewId: dataCustomerView?.id}))
      }
  }, [dataCustomerView, onShow])

    const [pagination, setPagination] = useState<PaginationProps>({
        ...DataPaginationDefault,
        name: "trường",
        isChooseSizeLimit: true,
        setPage: (page) => {
            setParams((prevParams) => ({ ...prevParams, page: page }));
        },
        chooseSizeLimit: (limit) => {
            setParams((prevParams) => ({ ...prevParams, limit: limit }));
        },
    });


    const [attributeList, setAttributeList] = useState([])

    const abortController = new AbortController();

    const getListAttribute = async (paramsSearch: any) => {
        setIsLoading(true);

        const response = await CustomerFieldService.list(paramsSearch, abortController.signal);

        if (response.code == 0) {
            const result = response.result;
            setAttributeList(result.items);

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
        getListAttribute(params)
    }, [params])

    const titles = ["STT", "Tên trường", "Thứ tự hiển thị"];
    const dataFormat = ["text-center", "", "text-center",];

    const dataMappingArray = (item: any, index: number) => [
        getPageOffset(params) + index + 1,
        item.attributeLabel,
        item.position,
    ];

    const actionsTable = (item: any): IAction[] => {
        
        return [
          {
            title: "Sửa",
            icon: <Icon name="Pencil" />,
            callback: () => {
                setDataAttribute(item);
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
              Bạn có chắc chắn muốn xóa trường đã chọn
              {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
            </Fragment>
          ),
          cancelText: "Hủy",
          cancelAction: () => {
            setShowDialog(false);
            setContentDialog(null);
          },
          defaultText: "Xóa",
          defaultAction: async () => {
            const response = await CustomerFieldService.delete(item.id);
            if (response.code === 0) {
                showToast("Xóa trường thành công", "success");
                getListAttribute(params)
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
  const [valueAttribute, setValueAttribute] = useState(null);

  useEffect(() => {
    if(dataAttribute){
        if(dataAttribute.attributeId){
            setValueAttribute({value: dataAttribute.attributeId, label: dataAttribute.attributeLabel})
        } else {
            setValueAttribute({value: dataAttribute.attributeName, label: dataAttribute.attributeLabel})

        }
    }
  }, [dataAttribute])
  

  const values = useMemo(
    () =>
    ({
      id: dataAttribute?.id ??  0,
      viewId: dataAttribute?.viewId ?? dataCustomerView?.id ?? 0,
      attributeId: dataAttribute?.attributeId ?? "",
      attributeName: dataAttribute?.attributeName ?? '',
      attributeLabel: dataAttribute?.attributeLabel ?? '',
      position: dataAttribute?.position ?? 0,

    } as any),
    [onShow, dataAttribute, dataCustomerView]
  );  


  const [formData, setFormData] = useState<IFormData>({ values: values });
  
  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    
  ];

  const loadedOptionAttribute = async (search, loadedOptions, { page }) => {

    const response = await CustomerService.customerAttributes();

    if (response.code === 0) {
      const dataOption = response.result?.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.attId || item.name,
                  label: item.title,
                  type: item.attId ? 1 : 0 // = 1 là trường động, 0 là trường tĩnh
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


  const handleChangeValueAttribute = (e) => {
    setValueAttribute(e);

    if(e.type === 1){
        setFormData({ ...formData, values: { ...formData?.values, attributeId: e.value, attributeLabel: e.label, attributeName: '' } });
    } else {
        setFormData({ ...formData, values: { ...formData?.values, attributeName: e.value, attributeLabel: e.label, attributeId: 0 } });
    }
    
  };


  const listFieldBasic = useMemo(
    () =>
      [
        {
            name: "datasourceId",
            type: "custom",
            snippet: (
                <SelectCustom
                    id="attributeId"
                    name="attributeId"
                    label= "Trường thông tin"
                    fill={true}
                    options={[]}
                    isMulti={false}
                    value={valueAttribute}
                    onChange={(e) => handleChangeValueAttribute(e)}
                    isAsyncPaginate={true}
                    isFormatOptionLabel={true}
                    loadOptionsPaginate={loadedOptionAttribute}
                    placeholder="Chọn trường thông tin"
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
       
      ] as IFieldCustomize[],
    [formData?.values, valueAttribute]
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

    const response = await CustomerFieldService.update(body);

    if (response.code === 0) {
        showToast(`Thêm trường thông tin thành công`, "success");
        setIsSubmit(false);
        setIsAddAttribute(false);
        getListAttribute(params);
        setDataAttribute(null);
        setFormData({ ...formData, values: values, errors: {} });

    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handClearForm = () => {
    onHide(false);
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
            title: dataAttribute ? "Cập nhật" : "Thêm mới",
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
    [formData, values, isSubmit, dataAttribute]
  );

  const cancelAdd = () => {
    setIsAddAttribute(false);
    setDataAttribute(null);
    setValueAttribute(null);
    setFormData({ ...formData, values: values, errors: {} });
  }

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${dataAttribute ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
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
        className="modal-setting-customer-view"
        size="lg"
      >
        <div className="container-setting-customer-view">
          <ModalHeader
            title={isAddAttribute ? `${dataAttribute? 'Chỉnh sửa trường thông tin' : 'Thêm mới trường thông tin'}` : `Danh sách trường thông tin`} 
            toggle={() => {
                if(!isSubmit){
                    cancelAdd();
                    onHide();
                }
            }}
          />
          <ModalBody>
            <div className="form-setting-customer-view">
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
                          Thêm trường thông tin
                      </Button>
                  </div>
                 }

                {!isAddAttribute ? 
                    <div>
                        {!isLoading && attributeList && attributeList.length > 0 ? (
                            <BoxTable
                                name="Danh sách trường thông tin"
                                titles={titles}
                                items={attributeList}
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
                        <SystemNotification description={<span>Hiện tại chưa có trường thông tin nào.</span>} type="no-item" />
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
