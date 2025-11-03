import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { IAction, IActionModal } from "model/OtherModel";
import Icon from "components/icon";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { isDifferenceObj, convertToId, getPageOffset } from "reborn-util";

import "./index.scss";
import RadioList from "components/radio/radioList";
import Input from "components/input/input";
import Tippy from "@tippyjs/react";
import SelectCustom from "components/selectCustom/selectCustom";
import { showToast } from "utils/common";
import BusinessProcessService from "services/BusinessProcessService";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import Button from "components/button/button";
import BoxTable from "components/boxTable/boxTable";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import TextArea from "components/textarea/textarea";

export default function ModalSetting({ onShow, onHide, dataNode, processId }) {
  
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [dataVariableDeclare, setDataVariableDeclare] = useState(null);
  
  const [isAddVariable, setIsAddVariable] = useState(false);
  const [params, setParams] = useState({
      name: "",
      limit: 10,
      processId: '',
      // nodeId: dataNode?.id
  });  

  useEffect(() => {
      if(dataNode && onShow && processId){
          setParams((preState) => ({...preState, 
                                      processId: processId, 
                                      // nodeId: dataNode.id
                                    }))
      }
  }, [dataNode, onShow, processId])

  const [pagination, setPagination] = useState<PaginationProps>({
      ...DataPaginationDefault,
      name: "biến",
      isChooseSizeLimit: true,
      setPage: (page) => {
          setParams((prevParams) => ({ ...prevParams, page: page }));
      },
      chooseSizeLimit: (limit) => {
          setParams((prevParams) => ({ ...prevParams, limit: limit }));
      },
  });


  const [variableList, setVariableList] = useState([])

  const abortController = new AbortController();

  const getListVariable = async (paramsSearch: any) => {
      setIsLoading(true);

      const response = await BusinessProcessService.listVariableDeclare(paramsSearch, abortController.signal);

      if (response.code == 0) {
          const result = response.result;
          setVariableList(result.items);

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
    if(onShow && params.processId){
      getListVariable(params)
    }
      
  }, [params, onShow, processId, dataNode])

  const titlesVariable = ["STT","Tên biến", "Mô tả"];
  const dataFormatVariable = [ "text-center", "", "", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
      getPageOffset(params) + index + 1,
      item.name,
      item.description,
      // item.affectedDate ? moment(item.affectedDate).format('DD/MM/YYYY') : '',
  ];

  const actionsTable = (item: any): IAction[] => {
      
      return [
          {
              title: "Sửa",
              icon: <Icon name="Pencil" />,
              callback: () => {
                  setDataVariableDeclare(item);
                  setIsAddVariable(true);
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
            Bạn có chắc chắn muốn xóa biến đã chọn {item ? <strong>{item.name}</strong> : ""}? Thao tác này không thể khôi phục.
          </Fragment>
        ),
        cancelText: "Hủy",
        cancelAction: () => {
          setShowDialog(false);
          setContentDialog(null);
        },
        defaultText: "Xóa",
        defaultAction: async () => {
          const response = await BusinessProcessService.deleteVariableDeclare(item.id);
          if (response.code === 0) {
              showToast("Xóa biến thành công", "success");
              getListVariable(params)
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


  const [isSubmitVariable, setIsSubmitVariable] = useState(false);
  const [showDialogAdd, setShowDialogAdd] = useState<boolean>(false);
  const [contentDialogAdd, setContentDialogAdd] = useState<IContentDialog>(null);
  const [listAttribute, setListAttribute] = useState([
    {
      name: '',
      type: null,
      description: '',
      value:''
    }
  ]);  

  const dataType = [
    {
      value: 'Vô hướng',
      label: 'Vô hướng'
    },
    {
      value: 'Đối tượng',
      label: 'Đối tượng'
    },
  ]


  const values = useMemo(
    () => ({
      // type: 'Vô hướng',
      id: dataVariableDeclare?.id ?? 0,
      name: dataVariableDeclare?.name ?? '',
      description: dataVariableDeclare?.description ?? '',
      body: '[]',
      nodeId: dataVariableDeclare?.nodeId ?? dataNode?.id,
      processId: dataVariableDeclare?.processId ?? processId
    }),
    [dataVariableDeclare, dataNode, processId]
  );

  const [formData, setFormData] = useState(values);

  useEffect(() => {
    setFormData(values);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  useEffect(() => {
    if(dataVariableDeclare){
      const body =  dataVariableDeclare.body && JSON.parse(dataVariableDeclare.body) || [];
      setListAttribute(body);
    }
  }, [dataVariableDeclare ])


  const onSubmit = async () => {
    // e.preventDefault();

    setIsSubmit(true);
      
    const body = {
      ...formData,
      body: JSON.stringify(listAttribute)
    }
    
    const response = await BusinessProcessService.updateVariableDeclare(body);

    if (response.code === 0) {
      showToast(`Cập nhật biểu mẫu thành công`, "success");
      setIsSubmitVariable(false);
      getListVariable(params);
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
            disabled: isSubmitVariable,
            callback: () => {
                !isDifferenceObj(formData, values) ? cancelAdd() : showDialogConfirmCancel();
            },
          },
          {
            title: dataVariableDeclare ? "Cập nhật" : "Tạo mới",
            // type: "submit",
            color: "primary",
            disabled: isSubmitVariable,
            // || !isDifferenceObj(formData, values),
            is_loading: isSubmitVariable,
            callback: () => {
                onSubmit();
            },
          },
        ],
      },
    }),
    [formData, values, isSubmitVariable, listAttribute]
  );


  const handleClearForm = () => {
    onHide(false);
    cancelAdd();
    setVariableList([]);
    setParams({
      name: "",
      limit: 10,
      processId: '',
    })
  };

  const cancelAdd = () => {
    setIsAddVariable(false);
    setDataVariableDeclare(null)
    setFormData(values);
    setListAttribute([
      {
        name: '',
        type: null,
        description: '',
        value: ''
      }
    ]);
  }

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${dataVariableDeclare ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialogAdd(false);
        setContentDialogAdd(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        handleClearForm();
        setShowDialogAdd(false);
        setContentDialogAdd(null);
      },
    };
    setContentDialogAdd(contentDialog);
    setShowDialogAdd(true);
  };

  const toCamelCase = (str) => {
    return str
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase());
  }

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        size="xl"
        toggle={() => !isSubmit && handleClearForm()}
        className="modal-setting"
      >
        <form className="form-setting">
          <ModalHeader title={`Cài đặt biến`} toggle={() => !isSubmit && handleClearForm()} />
          <ModalBody>
            <div>
              {isAddVariable? 
                  null
                  :
                  <div style={{display:'flex', justifyContent:'flex-end', marginTop: 10, marginBottom: 10, marginRight: 10}}>
                    <Button
                        // type="submit"
                        color="primary"
                        // disabled={}
                        onClick = {() => {
                            setIsAddVariable(true)
                        }}
                    >
                        Thêm biến
                    </Button>
                  </div>
                }
                {!isAddVariable ? 
                    <div style={{maxHeight:'42rem', overflow:'auto'}}>
                        {!isLoading && variableList  && variableList.length > 0 ? (
    
                        <BoxTable
                            name="Danh sách biến"
                            titles={titlesVariable}
                            items={variableList}
                            isPagination={true}
                            dataPagination={pagination}
                            dataMappingArray={(item, index) => dataMappingArray(item, index)}
                            dataFormat={dataFormatVariable}
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
                        <SystemNotification description={<span>Hiện tại chưa có biến nào.</span>} type="no-item" />
                        )}
                    </div>
                    :
                    <div className="list-form-group">
                      {/* <div >
                        <RadioList
                          options={dataType}
                          // className="options-auth"
                          required={true}
                          title=""
                          name="authentication"
                          value={formData.type}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData({...formData, type: value})       
                          }}
                        />
                      </div> */}
                      <div className="form-group">
                          <Input
                              id="name"
                              name="name"
                              label="Tên biến"
                              fill={true}
                              required={true}
                              placeholder={"Nhập tên biến"}
                              value={formData.name}
                              onChange={(e) => {
                                  // const value = e.target.value;
                                  let fieldName = convertToId(e.target.value) || "";
                                  fieldName = fieldName.replace(new RegExp(`[^A-Za-z0-9]`, 'g'), '');
                                  const value = fieldName.charAt(0).toLowerCase() + fieldName.slice(1);
                                  setFormData({...formData, name: value})
                              }}
                          />
                      </div>
                      <div className="form-group">
                          <TextArea
                              id="description"
                              name="description"
                              label="Mô tả"
                              fill={true}
                              required={false}
                              placeholder={"Nhập mô tả"}
                              value={formData.description}
                              onChange={(e) => {
                                  const value = e.target.value;
                                  setFormData({...formData, description: value})
                              }}
                          />
                      </div>
                      <div className="list-attribute">
                        <div style={{marginBottom: 10}}>
                          <span style={{fontSize: 16, fontWeight:'600'}}>Trường dữ liệu</span>
                        </div>
                        {listAttribute && listAttribute.length > 0 ? 
                          listAttribute.map((item, index) => (
                            <div key={index} className="item-attribute">
                              <div className="box-attribute">
                                <div className="name-attribute">
                                  <Input
                                    id="name"
                                    name="name"
                                    // label={index === 0 ? "Tên trường" : ''}
                                    fill={true}
                                    required={true}
                                    placeholder={"Nhập tên trường"}
                                    value={item.name}
                                    onChange={(e) => {
                                        // const value = (e.target.value);
                                        let fieldName = convertToId(e.target.value) || "";
                                        fieldName = fieldName.replace(new RegExp(`[^A-Za-z0-9]`, 'g'), '');
                                        const value = fieldName.charAt(0).toLowerCase() + fieldName.slice(1);
                                        setListAttribute((current) =>
                                            current.map((obj, idx) => {
                                            if (index === idx) {
                                                return { ...obj, name: value };
                                            }
                                            return obj;
                                            })
                                        );
                                    }}
                                  />
                                </div>
                                <div className="type-attribute">
                                  <SelectCustom
                                    id="type"
                                    name="type"
                                    // label={index === 0 ? "Kiểu dữ liệu" : ""}
                                    fill={true}
                                    special={true}
                                    required={true}
                                    options={[
                                      {
                                        value: "text",
                                        label: "Văn bản",
                                      },
                                      {
                                        value: "int",
                                        label: "Số nguyên",
                                      },
                                      {
                                        value: "float",
                                        label: "Số thực",
                                      },
                                      {
                                        value: "date",
                                        label: "Ngày tháng",
                                      },
                                      {
                                        value: "boolean",
                                        label: "Đúng/sai",
                                      },
                                      
                                    ]}
                                    value={item.type}
                                    onChange={(e) => {
                                      setListAttribute((current) =>
                                          current.map((obj, idx) => {
                                          if (index === idx) {
                                              return { ...obj, type: e };
                                          }
                                          return obj;
                                        })
                                      );
                                    }}
                                    isAsyncPaginate={false}
                                    isFormatOptionLabel={false}
                                    placeholder="Chọn kiểu dữ liệu"
                                    // additional={{
                                    //   page: 1,
                                    // }}
                                    // loadOptionsPaginate={loadedOptionWorkflow}
                                />
                                </div>
                                <div className="desc-attribute">
                                  <Input
                                    id="description"
                                    name="description"
                                    // label={index === 0 ? "Mô tả" : ""}
                                    fill={true}
                                    required={true}
                                    placeholder={"Nhập mô tả"}
                                    value={item.description}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setListAttribute((current) =>
                                          current.map((obj, idx) => {
                                            if (index === idx) {
                                                return { ...obj, description: value };
                                            }
                                            return obj;
                                        })
                                      );
                                    }}
                                  />
                                </div>

                                <div className="desc-attribute">
                                  <Input
                                    id="value"
                                    name="value"
                                    // label={index === 0 ? "Mô tả" : ""}
                                    fill={true}
                                    required={true}
                                    placeholder={"Nhập giá trị mặc định"}
                                    value={item.value}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setListAttribute((current) =>
                                          current.map((obj, idx) => {
                                            if (index === idx) {
                                                return { ...obj, value: value };
                                            }
                                            return obj;
                                        })
                                      );
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="button">
                                <span className="add-button" 
                                  // style={ dataHeaderHTTP.length > 1 ? {} : {marginRight: 5}}
                                >
                                    <Tippy content="Thêm" delay={[100, 0]} animation="scale-extreme">
                                        <span
                                            className="icon-add"
                                            onClick={() => {
                                                setListAttribute([
                                                    ...listAttribute,
                                                    { name: "", type: null, description: '', value: '' },
                                                ]);
                                            }}
                                        >
                                            <Icon name="PlusCircleFill" />
                                        </span>
                                    </Tippy>
                                </span>
                                
                                {listAttribute.length > 1 ? 
                                  <span className="remove-button">
                                      <Tippy content="Xóa" delay={[100, 0]} animation="scale-extreme">
                                      <span 
                                          className="icon-remove" 
                                          onClick={() => {
                                              const data = [...listAttribute]
                                              data.splice(index, 1);
                                              setListAttribute(data);
                                          }}
                                      >
                                          <Icon name="Trash" />
                                      </span>
                                      </Tippy>
                                  </span>
                                  : null
                                }
                              </div>
                            </div>
                          ))
                          
                        : null }
                      </div>
                  </div>

                }
            </div>
            
          </ModalBody>
          <ModalFooter actions={isAddVariable ? actionsAdd : actions} />
        </form>
      </Modal>
      <Dialog content={isAddVariable ? contentDialogAdd : contentDialog} isOpen={isAddVariable ? showDialogAdd : showDialog} />
    </Fragment>
  );
}
