/* eslint-disable prefer-const */
import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import _ from "lodash";
import Tippy from "@tippyjs/react";
import { useSearchParams } from "react-router-dom";
import { IActionModal, IFilterItem } from "model/OtherModel";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import CustomScrollbar from "components/customScrollbar";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { ITemplateSMSResponse } from "model/templateSMS/TemplateSMSResponse";
import { ITemplateSMSFilterRequest } from "model/templateSMS/TemplateSMSRequest";
import TemplateSMSService from "services/TemplateSMSService";
import { showToast } from "utils/common";
import { trimContent, isDifferenceObj, isObjEmpty } from "reborn-util";
import "tippy.js/animations/scale.css";
import "./SendSMS.scss";
import MarketingAutomationService from "services/MarketingAutomationService";
import Input from "components/input/input";
import Button from "components/button/button";
import NummericInput from "components/input/numericInput";

export default function SendSMS(props: any) {
  const { onShow,  onHide, dataNode, setDataNode, statusMA } = props;  
  console.log('dataNodeSMS', dataNode);
  
  const isMounted = useRef(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const [listCategorySMS, setListCategorySMS] = useState<ITemplateSMSResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [idCategorySMS, setIdCategorySMS] = useState<number>(null);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [tab, setTab] = useState(1);
  const [dataTemplate, setDataTemplate] = useState(null);
  // console.log('dataTemplate', dataTemplate);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  
  const [nodeName, setNodeName] = useState(null);
  const [nodePoint, setNodePoint] = useState(null);
  useEffect(() => {
    if(dataNode?.name){
      setNodeName(dataNode.name)
    }

    if(dataNode?.point){
      setNodePoint(dataNode.point)
    } else {
      setNodePoint(null);
    }
    
  }, [dataNode])

  const tabData = [
    {
        value: 1,
        label: 'Mẫu SMS đã chọn'
    },
  ]
  
  const getDetailTemplate = async (id: number) => {
    setIsLoadingTemplate(true)
    const response = await TemplateSMSService.detail(id);

    if (response.code === 0) {
      const result = response.result;
      setDataTemplate(result);
      
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
    setIsLoadingTemplate(false);
  };

  useEffect(() => {
    if(dataNode && dataNode.configData?.templateId){
        getDetailTemplate(dataNode.configData?.templateId);
    } else {
        setDataTemplate(null);
    }
  }, [dataNode?.configData?.templateId])

  const [params, setParams] = useState<ITemplateSMSFilterRequest>({
    name: "",
    page: page,
  });

  useEffect(() => {
    setParams({ ...params, page: page });
  }, [page]);

  useEffect(() => {
    setIdCategorySMS(null);
  }, [params]);

//   const [body, setBody] = useState<ICustomerSendSMSRequestModel>({
//     templateId: 0,
//     customerId: idCustomer,
//   });

  const customerFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "brandnameId",
        name: "Đầu số tin nhắn",
        type: "select",
        is_featured: true,
        value: searchParams.get("brandnameId") ?? "",
      },
      {
        key: "tcyId",
        name: "Chủ đề tin nhắn",
        type: "select",
        is_featured: true,
        value: searchParams.get("tcyId") ?? "",
      },
    ],
    [searchParams]
  );

//   useEffect(() => {
//     setBody({ ...body, templateId: idCategorySMS, customerId: idCustomer });
//   }, [idCustomer, idCategorySMS]);

  const getListCategoryTemplateSMS = async (paramsSearch: ITemplateSMSFilterRequest) => {
    setIsLoading(true);

    const response = await TemplateSMSService.list(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setHasMore(result.loadMoreAble);

      const newData = page == 1 ? [] : listCategorySMS;

      (result.items || []).map((item) => {
        newData.push(item);
      });

      setListCategorySMS(newData);

      if (+result.total === 0) {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true && onShow) {
      getListCategoryTemplateSMS(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
      if (isDifferenceObj(searchParams, paramsTemp)) {
        if (paramsTemp.page === 1) {
          delete paramsTemp["page"];
        }
        setSearchParams(paramsTemp as unknown as Record<string, string | string[]>);
      }
    }
  }, [params, onShow]);

  const onSubmit = async (e) => {
    e.preventDefault();

    // setIsSubmit(true);
    //Kiểm tra đã setup mẫu placeholder chưa
    console.log('idCategorySMS', idCategorySMS);

    const body: any = {
        ...dataNode,
        configData: {templateId: idCategorySMS}
      };        

      const response = await MarketingAutomationService.addNode(body);
      if (response.code === 0) {
        showToast(`Cài đặt gửi SMS thành công`, "success");
        onHide('not_close');
        setTab(1);
        setDataNode({...dataNode, configData: {templateId: idCategorySMS}});
        setNodePoint(null);
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        setIsSubmit(false);
      }
    
  };

  const onSubmitTab1 = async (dataNode, nodePoint) => {

    const body: any = {
        ...dataNode,
        point: nodePoint
      };        

      const response = await MarketingAutomationService.addNode(body);
      if (response.code === 0) {
        showToast(`Cài đặt điểm gửi SMS thành công`, "success");
        onHide('not_close');
        setDataNode({...dataNode, point: nodePoint})
        
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        setIsSubmit(false);
      }
    
  };

  /**
   * Gửi sms đi luôn mà không bật popup nếu không có custom placeholder nào
   */
//   const sendSms = async () => {
//     const body: ICustomerSendSMSRequestModel = {
//       templateId: idCategorySMS,
//       customerId: idCustomer,
//     };

//     const response = await CustomerService.customerSendSMS(body);

//     if (response.code === 0 && response.result.status !== 2) {
//       showToast("Gửi tin nhắn thành công", "success");
//       setIdCategorySMS(null);
//       setListCategorySMS([]);
//       onHide(true);
//       setIsSubmit(false);
//     } else {
//       showToast(response.result.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
//       setIsSubmit(false);
//       setIdCategorySMS(null);
//     }
//   };

  const notiError = (message) => {
    showToast(message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    setIsSubmit(false);
    setIdCategorySMS(null);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Quay lại",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              setTab(1);
            },
          },
          {
            title: "Xác nhận",
            type: "submit",
            color: "primary",
            disabled: isSubmit || idCategorySMS === null,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, idCategorySMS]
  );

  const actionsTab1 = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
                handleClearForm();
            },
          },

          ...(!_.isEqual(dataNode?.point, nodePoint) ? ([
              {
                title: "Xác nhận",
                // type: "submit",
                color: "primary",
                disabled: isSubmit || !nodeName || statusMA === 1,
                // is_loading: isSubmit,
                callback: () => {
                  if(_.isEqual(nodeName, dataNode?.name)){
                    onSubmitTab1(dataNode, nodePoint)
                  }
                  
                }
              },
            ] as any) 
            : []
          ),
          
        ],
      },
    }),
    [dataNode, nodePoint, nodeName, statusMA]
  );

  const handleScroll = (e) => {
    if (isLoading) {
      return;
    }

    const result = e.target.scrollHeight - Math.round(e.target.scrollTop) === e.target.clientHeight;
    if (result && hasMore) {
      setPage((prevState) => prevState + 1);
    }
  };

  const handleClearForm = () => {
    onHide(false);
    setTab(1);
    setEditName(true);
    setNodePoint(null);
    setNodeName(null);
  }

  const [editName, setEditName] = useState(true);

  const changeNodeName = async () => {

    if(!nodeName){
      showToast("Vui lòng nhập tên hành động", "error");
      return;
    }
    const body: any = {
      ...dataNode,
      name: nodeName,
      point: nodePoint
    };        

    const response = await MarketingAutomationService.addNode(body);
    if (response.code === 0) {
      showToast(`Đổi tên hành động thành công`, "success");
      onHide('not_close');
      setEditName(true);
      setDataNode({...dataNode, name: nodeName})
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  }

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm()}
        className="modal-send-sms"
        size="lg"
      >
        <form className="form-send-sms" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={dataNode?.name}  toggle={() => !isSubmit && handleClearForm()} />
          {/* <ModalHeader 
            custom={true}
          >
            <div className="container-header">
                {!editName ? 
                  <div className="box-title">
                    <h4>{nodeName || ''}</h4>
                    <Tippy content="Đổi tên điều kiện">
                      <div 
                        onClick={() => {
                          setEditName(true);
                        }}
                      >
                        <Icon 
                            name="Pencil" 
                            style={{ width: 18, height: 18,  fill: '#015aa4', cursor: 'pointer', marginBottom: 3 }} 
                        />
                      </div>
                    </Tippy>
                  </div>
                  :
                  <div className="edit-name">
                    <div style={{flex: 1}}>
                      <Input
                        name="search_field"
                        value={nodeName}
                        fill={true}
                        iconPosition="right"
                        icon={<Icon name="Times" />}
                        // onBlur={() => {
                        //   setEditName(false);
                        //   setNodeName(dataNode?.name)
                        // }}
                        iconClickEvent={() => {
                          setEditName(false);
                          setNodeName(dataNode?.name)
                        }}
                        onChange={(e) => {
                          const value = e.target.value;
                          setNodeName(value);
                        }}
                        placeholder="Nhập tên hành động"
                      />
                    </div>
                    <div 
                      className={_.isEqual(nodeName, dataNode?.name) || !nodeName ? "button-save-inactive" : "button-save-active"}
                      onClick={() => {
                        if(!_.isEqual(nodeName, dataNode?.name)){
                          changeNodeName()
                        }
                      }}
                    >
                      <span style={{fontSize: 16, fontWeight:'500'}}>Lưu</span>
                    </div>
                  </div>
                }
                <Button onClick={() => !isSubmit && handleClearForm()} type="button" className="btn-close" color="transparent" onlyIcon={true}>
                  <Icon name="Times" />
                </Button>
            </div>
          </ModalHeader> */}
          <ModalBody>
            {tab === 1 &&
                <div>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                      <div className="container-name">
                        <div className="box-name">
                          <span className="name-group">Tên hành động</span>
                          <Tippy content="Đổi tên hành động">
                            <div 
                              onClick={() => {
                                if(statusMA !== 1){
                                  setEditName(false);
                                }
                              }}
                            >
                              <Icon 
                                  name="Pencil" 
                                  style={{ width: 18, height: 18, fill: statusMA === 1 ? 'var(--extra-color-20)' : '#015aa4', cursor: 'pointer', marginBottom: 3 }} 
                              />
                            </div>
                          </Tippy>
                        </div>

                        <div className="edit-name">
                          <div style={{flex: 1}}>
                            <Input
                              name="search_field"
                              value={nodeName}
                              fill={true}
                              iconPosition="right"
                              
                              disabled={editName}
                              onBlur={() => {
                                if(!_.isEqual(nodeName, dataNode?.name)){
                                  changeNodeName()
                                } else {
                                  setEditName(true);
                                }
                              }}
                              // icon={<Icon name="Times" />}
                              // iconClickEvent={() => {
                              //   setEditName(false);
                              //   setNodeName(dataNode?.name)
                              // }}
                              onChange={(e) => {
                                const value = e.target.value;
                                setNodeName(value);
                              }}
                              placeholder="Nhập tên điều kiện"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="container-point">
                        <div className="box-name">
                          <span className="name-group">Điểm hành động</span>
                        </div>

                        <div className="edit-point">
                          <div style={{flex: 1}}>
                            <NummericInput
                              name="point_field"
                              value={nodePoint}
                              fill={true}                                  
                              // onBlur={() => {
                              //   if(!_.isEqual(nodeName, dataNode?.name)){
                              //     changeNodeName()
                              //   } else {
                              //     setEditName(true);
                              //   }
                              // }}
                              onChange={(e) => {
                                const value = e.target.value;
                                setNodePoint(value);
                              }}
                              placeholder="Nhập điểm điều kiện"
                            />
                          </div>
                        </div>

                      </div>
                    </div>

                    <div className="header-sms">
                        <div className="title-sms">
                            <span style={{fontSize: 16}}>Mẫu SMS đã chọn</span>
                        </div>
                        <div className="button-select-template"
                            onClick={() => {
                              setTab(2);
                            }}
                        >
                            <span style={{fontSize: 14, color: 'blue'}}>Chọn mẫu</span>
                        </div>
                    </div>
                    <div style={{height: '36rem', overflow:'auto'}}>
                    {!isLoadingTemplate && dataTemplate ?
                        <div className="info-template-sms">
                            <h3 className="title">{dataTemplate.title}</h3>
                            <span style={{fontSize: 14}}>{dataTemplate.content}</span>
                        </div>
                        : isLoadingTemplate ? (
                            <Loading />
                        ) :  (
                            <SystemNotification
                                description={
                                    <span>
                                        Chưa có mẫu SMS nào được chọn.
                                    <br />
                                        Bạn hãy chọn mẫu gửi SMS nhé!
                                    </span>
                                }
                                type="no-item"
                            />
                        )
                    }
                    </div>
                </div>
            }
            {tab !== 1 &&
                <div>
                    <div className="search-option">
                    <SearchBox params={params} isFilter={true} listFilterItem={customerFilterList} updateParams={(paramsNew) => setParams(paramsNew)} />
                    </div>
                    <CustomScrollbar width="100%" height="42rem" handleScroll={handleScroll}>
                    <div className="box__template--sms">
                        <div className="list-template-sms">
                        {listCategorySMS &&
                            listCategorySMS.length > 0 &&
                            listCategorySMS.map((item, idx) => {
                            return (
                                <div key={idx} className={`${idCategorySMS === item.id ? "active-template-sms" : "item-template-sms"}`}>
                                {idCategorySMS === item.id ? (
                                    <span className="iconCheck">
                                    <Icon name="CheckedCircle" />
                                    </span>
                                ) : (
                                    ""
                                )}
                                <div className="info-template-sms">
                                    <h3 className="title">{item.title}</h3>
                                    <Tippy content={item.content} delay={[120, 100]} animation="scale">
                                    <p className="content">{trimContent(item.content, 100, true, true)}</p>
                                    </Tippy>
                                </div>
                                <div
                                    className="icon-action"
                                    onClick={() => {
                                    setIdCategorySMS(item.id);

                                    if (item.id === idCategorySMS) {
                                        setIdCategorySMS(null);
                                    }
                                    }}
                                >
                                    <div className="action-left">
                                    {/* <Icon name="Mail" /> */}
                                    <h4 className="action-item">Chọn</h4>
                                    </div>
                                </div>
                                </div>
                            );
                            })}

                        {isLoading && <Loading />}

                        {!isLoading && listCategorySMS.length === 0 && (
                            <Fragment>
                            {isNoItem && (
                                <SystemNotification
                                description={
                                    <span>
                                    Không có dữ liệu trùng khớp.
                                    <br />
                                    Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                                    </span>
                                }
                                type="no-result"
                                />
                            )}
                            </Fragment>
                        )}
                        </div>
                    </div>
                    </CustomScrollbar>
                </div>
            }
          </ModalBody>
          <ModalFooter actions={tab === 1 ? actionsTab1 :  actions} />
        </form>
      </Modal>
    </Fragment>
  );
}
