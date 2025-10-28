import React, { Fragment, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "components/icon";
import Loading from "components/loading";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import CustomerService from "services/CustomerService";
import { getPermissions, showToast } from "utils/common";
import "./DetailProject.scss";
import moment from "moment";
import { convertToId, formatCurrency } from "reborn-util";
// import ProjectAttributeService from "services/ProjectAttributeService";
// import ProjectExtraInfoService from "services/ProjectExtraInfoService";
import { Parser } from "formula-functionizer";

import Tippy from "@tippyjs/react";
import ModalEditCustomer from "./ModalEditCustomer/ModalEditCustomer";
import AddCustomerPersonModal from "pages/CustomerPerson/partials/AddCustomerPersonModal";
import AddCustomerCompanyModal from "pages/CustomerPerson/partials/AddCustomerCompanyModal";
import ModalAddPartner from "pages/PartnerList/partials/ModalAddPartner";
import PartnerService from "services/PartnerService";
import ProjectService from "services/ProjectService";
import ProjectAttachment from "../ProjectAttachment/ProjectAttachment";
import AddFile from "../partials/AddFile";

export default function DetailProject() {
  document.title = "Chi tiết dự án";

  const { id } = useParams();
  const parser = new Parser();

  const takeUrlProjectLocalStorage = localStorage.getItem("backUpUrlProject") ? JSON.parse(localStorage.getItem("backUpUrlProject") || "") : "";
  // console.log("takeUrlProjectLocalStorage", takeUrlProjectLocalStorage);

  const navigate = useNavigate();
  const [permissions, setPermissions] = useState(getPermissions());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detailProject, setDetailProject] = useState(null);
  const [detailCustomer, setDetailCustomer] = useState(null);

  const [infoFile, setInfoFile] = useState(null);
  const [detailPartner, setDetailPartner] = useState(null);

  const [projectExtraInfos, setProjectExtraInfos] = useState<any>([]);
  const [mapProjectAttribute, setMapProjectAttribute] = useState<any>(null);
  // console.log('projectExtraInfos', projectExtraInfos);

  const [tabProject, setTabProject] = useState(1);
  const [editInfoCustomer, setEditInfoCustomer] = useState(false);
  const [editInfoCompany, setEditInfoCompany] = useState(false);
  const [editInfoPartner, setEditInfoPartner] = useState(false);

  const dataStep = [
    {
      value: 1,
      label: "Thông tin dự án",
    },
    // {
    //   value: 2,
    //   label: "Thông tin phụ lục dự án",
    // },
    // {
    //   value: 3,
    //   label: "Thông tin tiến độ thanh toán",
    // },
    // {
    //   value: 4,
    //   label: "Quản lý cọc",
    // },
    // {
    //   value: 5,
    //   label: "Tài liệu",
    // },
    // {
    //   value: 6,
    //   label: "Thông tin bàn giao",
    // },
  ];

  const getDetailProject = async () => {
    setIsLoading(true);
    const response = await ProjectService.detail(+id);

    if (response.code === 0) {
      const result = response.result;
      setDetailProject(result);

      if (result?.categoryId) {
        getProjectAttributes(result?.categoryId);
      }
      const docLink = JSON.parse(result?.docLink);
      if (docLink.length > 0) {
        setInfoFile(
          docLink.map((item, index) => {
            return {
              name: item?.name ? item.name : "TaiLieu_" + index + 1,
              fileUrl: item.url,
              extension: item.url.includes(".docx")
                ? "docx"
                : item.url.includes(".xlsx")
                ? "xlsx"
                : item.url.includes(".pdf")
                ? "pdf"
                : item.url.includes(".pptx")
                ? "pptx"
                : item.url.includes(".zip")
                ? "zip"
                : "rar",
            };
          })
        );
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  const getProjectExtraInfos = async () => {
    // const response = await ProjectExtraInfoService.list(+id);
    // console.log("response =>", response);
    // setProjectExtraInfos(response.code === 0 ? response.result : []);
  };

  useEffect(() => {
    //Lấy thông tin projectExtraInfos
    if (id && mapProjectAttribute) {
      getProjectExtraInfos();
    }
  }, [id, mapProjectAttribute]);

  const getProjectAttributeFormula = (attributes) => {
    // let attributeValue = attributes ? JSON.parse(attributes)?.formula : "";
    let attributeValue = "";
    let attrObj = {};
    (projectExtraInfos || []).map((item, idx) => {
      if (item.datatype == "number") {
        console.log(item);
        attrObj["projectAttribute_" + convertToId(item.attributeName)] = +item.attributeValue;
      }
    });

    return parser.parse(attributeValue)(...[attrObj]) === "#VALUE!" ? "" : parser.parse(attributeValue)(...[attrObj]);
  };

  const getProjectAttributeValue = (attributeId, datatype) => {
    let attributeValue = "";
    (projectExtraInfos || []).map((item, idx) => {
      if (item.attributeId == attributeId) {
        attributeValue = item.attributeValue;
      }
    });

    return datatype === "date"
      ? attributeValue
        ? moment(attributeValue).format("DD/MM/YYYY")
        : ""
      : datatype === "number"
      ? formatCurrency(attributeValue, ",", "")
      : attributeValue;
  };

  const getProjectAttributes = async (categoryId) => {
    // if (!mapProjectAttribute || mapProjectAttribute.length === 0) {
    //   const response = await ProjectAttributeService.listAll({categoryId: categoryId});
    //   if (response.code === 0) {
    //     const dataOption = response.result;
    //     setMapProjectAttribute(dataOption || {});
    //   }
    // }
    // const response = await ProjectAttributeService.listAll({ categoryId: categoryId });
    // if (response.code === 0) {
    //   const dataOption = response.result;
    //   setMapProjectAttribute(dataOption || {});
    // }
  };

  useEffect(() => {
    if (id) {
      getDetailProject();
      getLogValue(id);
      // getProjectAttributes();
    }
  }, [id]);

  const getLogValue = async (id) => {
    const param = {
      id: +id,
    };
    // const response = await ProjectService.logValues(param);

    // if (response.code === 0) {
    //   const result = response.result;
    //   // setDetailProject(result);
    // } else {
    //   showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    // }
  };

  const getDetailCustomer = async (id: number) => {
    if (!id) return;

    const response = await CustomerService.detail(id);

    if (response.code === 0) {
      const result = response.result;

      // setDetailCustomer({
      //   value: result.id,
      //   label: result.name,
      //   avatar: result.avatar,
      //   address: result.address,
      //   phoneMasked: result.phoneMasked,
      //   taxCode: result.taxCode,
      //   custType: result.custType,
      //   groupName: result.groupName,
      //   sourceName: result.sourceName,
      // });
      setDetailCustomer(result);
    } else {
      showToast("Có lỗi xảy ra vui lòng thử lại sau", "error");
    }
  };

  const getDetailPartner = async (id: number) => {
    if (!id) return;

    const response = await PartnerService.detail(id);

    if (response.code === 0) {
      const result = response.result;

      // setDetailPartner({
      //   value: result.id,
      //   label: result.name,
      //   avatar: result.avatar,
      //   address: result.address,
      //   phoneMasked: result.phoneMasked,
      //   taxCode: result.taxCode,
      // });
      setDetailPartner(result);
    } else {
      showToast("Có lỗi xảy ra vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (detailProject?.customerId) {
      getDetailCustomer(detailProject?.customerId);
    }
    if (detailProject?.businessPartnerId) {
      getDetailPartner(detailProject?.businessPartnerId);
    }
  }, [detailProject?.customerId, detailProject?.businessPartnerId]);

  const projectInfo = {
    projectName: detailProject?.name ?? "",
    projectCode: detailProject?.code ?? "",
    departmentId: detailProject?.departmentId ?? "",
    departmentName: detailProject?.departmentName ?? "",
    employeeName: detailProject?.employeeName ?? "",
    lstParticipant: detailProject?.lstParticipant ?? [],
    startTime: detailProject?.startTime ? moment(detailProject?.startTime).format("DD/MM/YYYY") : "",
    endTime: detailProject?.endTime ? moment(detailProject?.endTime).format("DD/MM/YYYY") : "",
    description: detailProject?.description ?? "",
  };

  //   console.log('projectInfo', projectInfo);

  const [tabStep_1, setTabStep_1] = useState(1);

  const dataTabStep_1 = [
    {
      value: 1,
      label: "Thông tin",
    },
    {
      value: 2,
      label: "Lịch sử thay đổi thông tin",
    },
  ];

  const [tabData, setTabData] = useState([
    {
      lable: "Thông tin cơ bản",
      value: 0,
    },
    // {
    //     lable: 'Khối thông tin động',
    //     value: 2
    // }
  ]);

  useEffect(() => {
    if (mapProjectAttribute && Object.entries(mapProjectAttribute) && Object.entries(mapProjectAttribute).length > 0) {
      const newTab = [...tabData];
      Object.entries(mapProjectAttribute).map((lstProjectAttribute) => {
        lstProjectAttribute[1].map((projectAttribute) => {
          if (!projectAttribute.parentId) {
            newTab.push({ lable: projectAttribute.name, value: projectAttribute.id });
          }
        });
      });

      setTabData(newTab);
    }
  }, [mapProjectAttribute]);

  return (
    <div className="page-content page-detail-project">
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              navigate(`/project?page=${takeUrlProjectLocalStorage?.page || 1}`);
            }}
            className="title-first"
            title="Quay lại"
          >
            Danh sách dự án
          </h1>
          <Icon name="ChevronRight" />
          <h1 className="title-last">Chi tiết dự án</h1>
        </div>
      </div>

      <div style={{ display: "flex", marginTop: 10, marginBottom: "1.2rem" }}>
        {dataStep.map((item, index) => (
          <div
            key={index}
            style={{
              borderBottom: tabProject === item.value ? "1px solid" : "",
              paddingLeft: 12,
              paddingRight: 12,
              paddingBottom: 3,
              cursor: "pointer",
            }}
            onClick={() => {
              setTabProject(item.value);
            }}
          >
            <span style={{ fontSize: 16, fontWeight: "500", color: tabProject === item.value ? "" : "#d3d5d7" }}>{item.label}</span>
          </div>
        ))}
      </div>

      <div className={tabProject === 1 ? "container-detail-project" : "d-none"}>
        {/* <div className="column-tab">
          <div className="header-management">
                <div className="title-item">
                    <h3>Thông tin dự án</h3>
                </div>
            </div>

          {tabData.map((item, index) => (
            <div
              key={index}
              style={{
                padding: "1.2rem",
                borderBottom: "1px solid #cfd7df",
                cursor: "pointer",
                backgroundColor: tab == item.value ? "var(--extra-color-20)" : "white",
              }}
              onClick={() => setTab(item.value)}
            >
              <span style={{ fontSize: 16, fontWeight: "500" }}>{item.lable}</span>
            </div>
          ))}
        </div> */}
        <div style={{ padding: "2rem", backgroundColor: "white", width: "100%" }}>
          {!isLoading && detailProject !== null ? (
            <Fragment>
              {/* <div style={{display: 'flex', marginBottom: '1.2rem'}}>
                  {dataTabStep_1.map((item, index) => (
                      <div 
                        key={index}
                        style={{borderBottom: tabStep_1 === item.value ? '1px solid' : '', paddingLeft: 12, paddingRight: 12, paddingBottom: 3, cursor:'pointer'}}
                        onClick = {() => {
                          setTabStep_1(item.value)
                        }}
                    >
                        <span style={{fontSize: 16, fontWeight:'500', color: tabStep_1 === item.value ? '' : '#d3d5d7'}}>{item.label}</span>
                    </div>
                  ))}
                </div> */}

              <div>
                <div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <h3 className="title__info">Thông tin dự án</h3>
                      {/* {permissions["CONTRACT_UPDATE"] == 1 && (
                        <div>
                          <Tippy content="Sửa">
                            <span
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                navigate(`/edit_project/${id}`);
                              }}
                            >
                              <Icon
                                name="Pencil"
                                style={{ width: 18, height: 18, marginBottom: "2rem", fill: "var(--primary-color)", marginLeft: 10 }}
                              />
                            </span>
                          </Tippy>
                        </div>
                      )} */}
                    </div>
                    <div className="box-customer-info">
                      <div className="box-title">
                        <span className="title">Tên dự án:</span>
                        <span className="text">{projectInfo.projectName}</span>
                      </div>

                      <div className="box-title">
                        <span className="title">Mã dự án:</span>
                        <span className="text">{projectInfo.projectCode}</span>
                      </div>
                      <div className="box-title">
                        <span className="title">Phòng ban phụ trách:</span>
                        <span className="text">{projectInfo.departmentName}</span>
                      </div>
                      <div className="box-title">
                        <span className="title">Người quản lý dự án:</span>
                        <span className="text">{projectInfo.employeeName}</span>
                      </div>
                      <div className="box-title">
                        <span className="title">Người tham gia:</span>
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                          {projectInfo?.lstParticipant &&
                            projectInfo?.lstParticipant?.map((item, index) => (
                              <span key={index} style={{ marginRight: 5 }} className="text">{`${item.name},`}</span>
                            ))}
                        </div>
                      </div>

                      <div className="box-title">
                        <span className="title">Ngày bắt đầu:</span>
                        <span className="text">{projectInfo.startTime}</span>
                      </div>

                      <div className="box-title">
                        <span className="title">Ngày kết thúc:</span>
                        <span className="text">{projectInfo.endTime}</span>
                      </div>

                      <div className="box-title">
                        <span className="title">Nội dung dự án:</span>
                        <span className="text">{projectInfo.description}</span>
                      </div>

                      {infoFile?.length > 0 ? (
                        <div className="container_template_project">
                          <div>
                            <span className="title_template">Tài liệu dự án</span>
                          </div>
                          {infoFile.map((item, index) => (
                            <div key={index} className="box_template">
                              <div className="box__update--attachment">
                                <AddFile takeFileAdd={() => {}} infoFile={item} setInfoFile={setInfoFile} notAddFile={true} />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                {mapProjectAttribute ? (
                  <div className="list__project--attribute">
                    {Object.entries(mapProjectAttribute).map((lstProjectAttribute: any, key: number) => (
                      <Fragment key={key}>
                        {(lstProjectAttribute[1] || []).map((projectAttribute, index: number) => (
                          <Fragment key={index}>
                            {!projectAttribute.parentId ? (
                              <label className="label-title" key={`parent_${key}`}>
                                {projectAttribute.name}
                              </label>
                            ) : null}
                            {projectAttribute.parentId ? (
                              <div key={index} className="box-title">
                                <span>
                                  <span style={{ fontSize: 14, fontWeight: "500" }}>{projectAttribute.name}: </span>
                                  <span style={{ fontSize: 14 }}>
                                    {projectAttribute.datatype !== "formula"
                                      ? getProjectAttributeValue(projectAttribute?.id, projectAttribute?.datatype)
                                      : getProjectAttributeFormula(projectAttribute?.attributes)}
                                  </span>
                                </span>
                              </div>
                            ) : null}
                          </Fragment>
                        ))}
                      </Fragment>
                    ))}
                  </div>
                ) : null}
              </div>
            </Fragment>
          ) : isLoading ? (
            <Loading />
          ) : (
            ""
          )}
        </div>
      </div>

      {/* <div className={tabProject === 5 ? "" : "d-none"}>
        <ProjectAttachment projectId={id} detailProject={true} />
      </div> */}

      {/* <ModalEditCustomer
        onShow={editInfoCustomer}
        data={detailProject}
        onHide={(reload) => {
          if(reload){
            getDetailProject();
          }
          setEditInfoCustomer(false);
        }}
      /> */}

      <AddCustomerPersonModal
        onShow={editInfoCustomer}
        data={detailCustomer}
        onHide={(reload, nextModal) => {
          if (reload) {
            getDetailCustomer(detailProject?.customerId);
            getDetailProject();
          }
          setEditInfoCustomer(false);

          //Nếu true thì bật cái kia
          if (nextModal) {
            setEditInfoCompany(true);
          }
        }}
        zaloUserId={detailCustomer?.zaloUserId}
      />

      <AddCustomerCompanyModal
        onShow={editInfoCompany}
        data={detailCustomer}
        onHide={(reload, nextModal) => {
          if (reload) {
            getDetailCustomer(detailProject?.customerId);
            getDetailProject();
          }
          setEditInfoCompany(false);

          if (nextModal) {
            setEditInfoCustomer(true);
          }
        }}
      />

      <ModalAddPartner
        onShow={editInfoPartner}
        data={detailPartner}
        onHide={(reload, nextModal) => {
          if (reload) {
            getDetailPartner(detailProject?.businessPartnerId);
            getDetailProject();
          }
          setEditInfoPartner(false);
        }}
      />
    </div>
  );
}
