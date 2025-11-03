import React, { Fragment, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "components/icon";
import Loading from "components/loading";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import CustomerService from "services/CustomerService";
import { getPermissions, showToast } from "utils/common";
import "./DetailContract.scss";
import ContractService from "services/ContractService";
import moment from "moment";
import { convertToId, formatCurrency } from "reborn-util";
import ContractAttributeService from "services/ContractAttributeService";
import ContractExtraInfoService from "services/ContractExtraInfoService";
import { Parser } from "formula-functionizer";
import ContractAppendix from "../ContractAppendix/ContractAppendix";
import ContractPaymentProgress from "../ContractPaymentProgress/ContractPaymentProgress";
import ContractAttachment from "../ContractAttachment/ContractAttachment";
import ContractHandOver from "../ContractHandOverInfo/ContractHandOverInfo";
import PartnerService from "services/PartnerService";
import AddFile from "../CreateContracts/partials/AddFile";
import Tippy from "@tippyjs/react";
import ModalEditCustomer from "./ModalEditCustomer/ModalEditCustomer";
import AddCustomerPersonModal from "pages/CustomerPerson/partials/AddCustomerPersonModal";
import AddCustomerCompanyModal from "pages/CustomerPerson/partials/AddCustomerCompanyModal";
import ModalAddPartner from "pages/PartnerList/partials/ModalAddPartner";

export default function DetailContract() {
  document.title = "Chi tiết hợp đồng";

  const { id } = useParams();
  const parser = new Parser();

  const takeUrlContractLocalStorage = JSON.parse(localStorage.getItem("backUpUrlContract") || "");

  const navigate = useNavigate();
  const [permissions, setPermissions] = useState(getPermissions());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detailContract, setDetailContract] = useState(null);
  const [detailCustomer, setDetailCustomer] = useState(null);

  const [infoFile, setInfoFile] = useState(null);
  const [detailPartner, setDetailPartner] = useState(null);

  const [contractExtraInfos, setContractExtraInfos] = useState<any>([]);
  const [mapContractAttribute, setMapContractAttribute] = useState<any>(null);

  const [tabContract, setTabContract] = useState(1);
  const [editInfoCustomer, setEditInfoCustomer] = useState(false);
  const [editInfoCompany, setEditInfoCompany] = useState(false);
  const [editInfoPartner, setEditInfoPartner] = useState(false);

  const dataStep = [
    {
      value: 1,
      label: "Thông tin hợp đồng",
    },
    {
      value: 2,
      label: "Thông tin phụ lục hợp đồng",
    },
    {
      value: 3,
      label: "Thông tin tiến độ",
    },
    {
      value: 4,
      label: "Quản lý cọc",
    },
    {
      value: 5,
      label: "Tài liệu",
    },
    {
      value: 6,
      label: "Thông tin bàn giao",
    },
  ];

  const getDetailContract = async () => {
    setIsLoading(true);
    const response = await ContractService.detail(+id);

    if (response.code === 0) {
      const result = response.result;
      setDetailContract(result);

      if (result?.categoryId) {
        getContractAttributes(result?.categoryId);
      }

      if (result?.template && result.template.includes("fileName")) {
        const dataTemplate = JSON.parse(result.template);
        if (dataTemplate && dataTemplate?.fileUrl) {
          setInfoFile({
            fileName: dataTemplate.fileName,
            fileUrl: dataTemplate.fileUrl,
            extension: dataTemplate.fileUrl.includes(".docx")
              ? "docx"
              : dataTemplate.fileUrl.includes(".xlsx")
              ? "xlsx"
              : dataTemplate.fileUrl.includes(".pdf") || dataTemplate.fileUrl.includes(".PDF")
              ? "pdf"
              : dataTemplate.fileUrl.includes(".pptx")
              ? "pptx"
              : dataTemplate.fileUrl.includes(".zip")
              ? "zip"
              : "rar",
          });
        }
      } else {
        if (result.template.includes("http")) {
          setInfoFile({
            fileUrl: result.template,
            extension: result.template.includes(".docx")
              ? "docx"
              : result.template.includes(".xlsx")
              ? "xlsx"
              : result.template.includes(".pdf") || result.template.includes(".PDF")
              ? "pdf"
              : result.template.includes(".pptx")
              ? "pptx"
              : result.template.includes(".zip")
              ? "zip"
              : "rar",
          });
        } else {
          setInfoFile(null);
        }
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  const getContractExtraInfos = async () => {
    const response = await ContractExtraInfoService.list(+id);
    setContractExtraInfos(response.code === 0 ? response.result : []);
  };

  useEffect(() => {
    //Lấy thông tin contractExtraInfos
    if (id && mapContractAttribute) {
      getContractExtraInfos();
    }
  }, [id, mapContractAttribute]);

  const getContractAttributeFormula = (attributes) => {
    const attributeValue = attributes ? JSON.parse(attributes)?.formula : "";
    const attrObj = {};
    (contractExtraInfos || []).map((item, idx) => {
      if (item.datatype == "number") {
        attrObj["contractAttribute_" + convertToId(item.attributeName)] = +item.attributeValue;
      }
    });

    return parser.parse(attributeValue)(...[attrObj]) === "#VALUE!" ? "" : parser.parse(attributeValue)(...[attrObj]);
  };

  const getContractAttributeValue = (attributeId, datatype) => {
    let attributeValue = "";
    (contractExtraInfos || []).map((item, idx) => {
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

  const getContractAttributes = async (categoryId) => {
    // if (!mapContractAttribute || mapContractAttribute.length === 0) {
    //   const response = await ContractAttributeService.listAll({categoryId: categoryId});
    //   if (response.code === 0) {
    //     const dataOption = response.result;
    //     setMapContractAttribute(dataOption || {});
    //   }
    // }
    const response = await ContractAttributeService.listAll({ categoryId: categoryId });
    if (response.code === 0) {
      const dataOption = response.result;
      setMapContractAttribute(dataOption || {});
    }
  };

  useEffect(() => {
    if (id) {
      getDetailContract();
      // getContractAttributes();
    }
  }, [id]);

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
    if (detailContract?.customerId) {
      getDetailCustomer(detailContract?.customerId);
    }
    if (detailContract?.businessPartnerId) {
      getDetailPartner(detailContract?.businessPartnerId);
    }
  }, [detailContract?.customerId, detailContract?.businessPartnerId]);

  const contractInfo = {
    branchName: detailContract?.branchName ?? "",
    categoryName: detailContract?.categoryName ?? "",
    contractName: detailContract?.name ?? "",
    contractNo: detailContract?.contractNo ?? "",
    signDate: detailContract?.signDate ? moment(detailContract?.signDate).format("DD/MM/YYYY") : "",
    affectedDate: detailContract?.affectedDate ? moment(detailContract?.affectedDate).format("DD/MM/YYYY") : "",
    endDate: detailContract?.endDate ? moment(detailContract?.endDate).format("DD/MM/YYYY") : "",
    adjustDate: detailContract?.adjustDate ? moment(detailContract?.adjustDate).format("DD/MM/YYYY") : "",
    taxCode: detailContract?.taxCode ?? "",
    pipelineName: detailContract?.pipelineName ?? "",
    approachName: detailContract?.approachName,
    employeeName: detailContract?.employeeName ?? "",
    dealValue: formatCurrency(detailContract?.dealValue) ?? "",
    peopleInvolved: detailContract?.peopleInvolved ? JSON.parse(detailContract?.peopleInvolved) : "",
    projectName: detailContract?.projectName ?? "",
    nfaArea: formatCurrency(detailContract?.nfaArea, ",", "") ?? "",
    fillRate: detailContract?.fillArea ? (+detailContract?.fillArea / +detailContract?.nfaArea) * 100 : "",
    actualArea: formatCurrency(detailContract?.actualArea, ",", "") ?? "",
    lobbyArea: formatCurrency(detailContract?.lobbyArea, ",", "") ?? "",
    totalArea: formatCurrency(detailContract?.totalArea, ",", "") ?? "",
    rentalTypeName: detailContract?.rentalTypeName ?? "",
    fsName: detailContract?.fsName ?? "",
    projectId: detailContract?.projectId ?? "",
  };

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
    if (mapContractAttribute && Object.entries(mapContractAttribute) && Object.entries(mapContractAttribute).length > 0) {
      const newTab = [...tabData];
      Object.entries(mapContractAttribute).map((lstContractAttribute) => {
        lstContractAttribute[1].map((contractAttribute) => {
          if (!contractAttribute.parentId) {
            newTab.push({ lable: contractAttribute.name, value: contractAttribute.id });
          }
        });
      });

      setTabData(newTab);
    }
  }, [mapContractAttribute]);

  return (
    <div className="page-content page-detail-contract">
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              navigate(
                `/contract?pipelineId=${takeUrlContractLocalStorage.pipelineId}&approachId=${takeUrlContractLocalStorage.approachId}&page=${
                  takeUrlContractLocalStorage?.page || 1
                }`
              );
            }}
            className="title-first"
            title="Quay lại"
          >
            Danh sách hợp đồng
          </h1>
          <Icon name="ChevronRight" />
          <h1 className="title-last">Chi tiết hợp đồng</h1>
        </div>
      </div>

      <div style={{ display: "flex", marginTop: 10, marginBottom: "1.2rem" }}>
        {dataStep.map((item, index) => (
          <div
            key={index}
            style={{
              borderBottom: tabContract === item.value ? "1px solid" : "",
              paddingLeft: 12,
              paddingRight: 12,
              paddingBottom: 3,
              cursor: "pointer",
            }}
            onClick={() => {
              setTabContract(item.value);
            }}
          >
            <span style={{ fontSize: 16, fontWeight: "500", color: tabContract === item.value ? "" : "#d3d5d7" }}>{item.label}</span>
          </div>
        ))}
      </div>

      <div className={tabContract === 1 ? "container-detail-contract" : "d-none"}>
        {/* <div className="column-tab">
          <div className="header-management">
                <div className="title-item">
                    <h3>Thông tin hợp đồng</h3>
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
          {!isLoading && detailContract !== null ? (
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
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <h3 className="title__info">Thông tin {detailCustomer ? `khách hàng` : detailPartner ? "đối tác" : ""}</h3>
                    {(detailCustomer ? permissions["CUSTOMER_UPDATE"] == 1 : permissions["PARTNER_UPDATE"] == 1) && (
                      <div>
                        <Tippy content={`Sửa thông tin ${detailCustomer ? `khách hàng` : detailPartner ? "đối tác" : ""}`}>
                          <span
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              if (detailCustomer) {
                                localStorage.setItem("customer.custType", detailCustomer.custType.toString());
                                if (+detailCustomer.custType === 0) {
                                  setEditInfoCustomer(true);
                                } else {
                                  setEditInfoCompany(true);
                                }
                              } else {
                                setEditInfoPartner(true);
                              }
                            }}
                          >
                            <Icon
                              name="Pencil"
                              style={{ width: 18, height: 18, marginBottom: "2rem", fill: "var(--primary-color)", marginLeft: 10 }}
                            />
                          </span>
                        </Tippy>
                      </div>
                    )}
                  </div>
                  <div className="box-customer-info">
                    <div className={detailCustomer ? "box-title-customer" : "box-title-partner"}>
                      <span className="title">Họ tên: </span>
                      <span className="text">{detailCustomer?.name || detailPartner?.name}</span>
                    </div>

                    <div className={detailCustomer ? "box-title-customer" : "box-title-partner"}>
                      <span className="title">Số điện thoại: </span>
                      <span className="text">{detailCustomer?.phoneMasked || detailPartner?.phoneMasked}</span>
                    </div>

                    <div className={detailCustomer ? "box-title-customer" : "box-title-partner"}>
                      <span className="title">Mã số thuế: </span>
                      <span className="text">{detailCustomer?.taxCode || detailPartner?.taxCode}</span>
                    </div>

                    <div className={detailCustomer ? "box-title-customer" : "box-title-partner"}>
                      <span className="title">Địa chỉ: </span>
                      <span className="text">{detailCustomer?.address || detailPartner?.address}</span>
                    </div>

                    {detailCustomer ? (
                      <div className="box-title-customer">
                        <span className="title">Đối tượng khách hàng:</span>
                        <span className="text">{detailCustomer?.sourceName}</span>
                      </div>
                    ) : null}

                    {detailCustomer ? (
                      <div className="box-title-customer">
                        <span className="title">Phân loại khách hàng: </span>
                        <span className="text">{detailCustomer?.groupName}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <h3 className="title__info">Thông tin hợp đồng</h3>
                      {permissions["CONTRACT_UPDATE"] == 1 && (
                        <div>
                          <Tippy content="Sửa">
                            <span
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                navigate(`/edit_contract/${id}`);
                              }}
                            >
                              <Icon
                                name="Pencil"
                                style={{ width: 18, height: 18, marginBottom: "2rem", fill: "var(--primary-color)", marginLeft: 10 }}
                              />
                            </span>
                          </Tippy>
                        </div>
                      )}
                    </div>
                    <div className="box-customer-info">
                      <div className="box-title">
                        <span className="title">Dự án:</span>
                        <span
                          className="text_project_name"
                          onClick={() => {
                            navigate(`/detail_project/projectId/${contractInfo.projectId}`);
                          }}
                        >
                          {contractInfo.projectName}
                        </span>
                      </div>

                      <div className="box-title">
                        <span className="title">FS:</span>
                        <span className="text">{contractInfo.fsName}</span>
                      </div>

                      <div className="box-title">
                        <span className="title">Loại hợp đồng:</span>
                        <span className="text">{contractInfo.categoryName}</span>
                      </div>

                      <div className="box-title">
                        <span className="title">Tên hợp đồng:</span>
                        <span className="text">{contractInfo.contractName}</span>
                      </div>

                      <div className="box-title">
                        <span className="title">Số hợp đồng:</span>
                        <span className="text">{contractInfo.contractNo}</span>
                      </div>

                      <div className="box-title">
                        <span className="title">Ngày ký:</span>
                        <span className="text">{contractInfo.signDate}</span>
                      </div>

                      <div className="box-title">
                        <span className="title">Ngày hiệu lực:</span>
                        <span className="text">{contractInfo.affectedDate}</span>
                      </div>

                      <div className="box-title">
                        <span className="title">Ngày hết hạn:</span>
                        <span className="text">{contractInfo.endDate}</span>
                      </div>

                      <div className="box-title">
                        <span className="title">Ngày đến hạn điều chỉnh giá:</span>
                        <span className="text">{contractInfo.adjustDate}</span>
                      </div>

                      <div className="box-title">
                        <span className="title">Mã số thuế:</span>
                        <span className="text">{contractInfo.taxCode}</span>
                      </div>

                      <div className="box-title">
                        <span className="title">Giai đoạn hợp đồng:</span>
                        <span className="text">{contractInfo.pipelineName}</span>
                      </div>

                      <div className="box-title">
                        <span className="title">Người phụ trách:</span>
                        <span className="text">{contractInfo.employeeName}</span>
                      </div>

                      <div className="box-title">
                        <span className="title">Giá trị hợp đồng:</span>
                        <span className="text">{contractInfo.dealValue}</span>
                      </div>

                      <div className="box-title">
                        <span className="title">Người liên quan:</span>
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                          {contractInfo?.peopleInvolved &&
                            contractInfo?.peopleInvolved?.map((item, index) => (
                              <span key={index} style={{ marginRight: 5 }} className="text">{`${item.label},`}</span>
                            ))}
                        </div>
                      </div>

                      {infoFile?.fileUrl ? (
                        <div className="container_template_contract">
                          <div>
                            <span className="title_template">{infoFile?.fileName ? infoFile?.fileName : " Mẫu hợp đồng"} </span>
                          </div>
                          <div className="box_template">
                            <div className="box__update--attachment">
                              <AddFile
                                takeFileAdd={() => {}}
                                infoFile={infoFile}
                                setInfoFile={setInfoFile}
                                notAddFile={true}
                                // setIsLoadingFile={setIsLoadingFile}
                                // dataAttachment={data}
                              />
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                {mapContractAttribute ? (
                  <div className="list__contract--attribute">
                    {Object.entries(mapContractAttribute).map((lstContractAttribute: any, key: number) => (
                      <Fragment key={key}>
                        {(lstContractAttribute[1] || []).map((contractAttribute, index: number) => (
                          <Fragment key={index}>
                            {!contractAttribute.parentId ? (
                              <label className="label-title" key={`parent_${key}`}>
                                {contractAttribute.name}
                              </label>
                            ) : null}
                            {contractAttribute.parentId ? (
                              <div key={index} className="box-title">
                                <span>
                                  <span style={{ fontSize: 14, fontWeight: "500" }}>{contractAttribute.name}: </span>
                                  <span style={{ fontSize: 14 }}>
                                    {contractAttribute.datatype !== "formula"
                                      ? getContractAttributeValue(contractAttribute?.id, contractAttribute?.datatype)
                                      : getContractAttributeFormula(contractAttribute?.attributes)}
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

                {/* {mapContractAttribute ? (
                    <div>
                      {Object.entries(mapContractAttribute).map((lstContractAttribute: any, key: number) =>
                        lstContractAttribute[0] == tab ? (
                          <div
                            key={key}
                            // className="card-box"
                          >
                            {(lstContractAttribute[1] || []).map((contractAttribute, index: number) => (
                              <div key={index}>
                                {!contractAttribute.parentId ? (
                                  <label className="label-title" key={`parent_${key}`}>
                                    {contractAttribute.name}
                                  </label>
                                ) : null}
                              </div>
                            ))}
                            <div className="box-customer-info">
                              {(lstContractAttribute[1] || []).map((contractAttribute, index: number) =>
                                contractAttribute.parentId ? (
                                  <div key={index} className="box-title">
                                    <span>
                                      <span style={{ fontSize: 14, fontWeight: "500" }}>{contractAttribute.name}: </span>
                                      <span style={{ fontSize: 14 }}>
                                        {contractAttribute.datatype !== "formula"
                                          ? getContractAttributeValue(contractAttribute?.id, contractAttribute?.datatype)
                                          : getContractAttributeFormula(contractAttribute?.attributes)}
                                      </span>
                                    </span>
                                  </div>
                                ) : null
                              )}
                            </div>
                          </div>
                        ) : null
                      )}
                    </div>
                  ) : null} */}
              </div>
            </Fragment>
          ) : isLoading ? (
            <Loading />
          ) : (
            ""
          )}
        </div>
      </div>

      <div className={tabContract === 2 ? "" : "d-none"}>
        <ContractAppendix contractId={id} detailContract={true} />
      </div>

      <div className={tabContract === 3 ? "" : "d-none"}>
        <ContractPaymentProgress contractId={id} detailContract={true} dataContract={detailContract} />
      </div>

      <div className={tabContract === 5 ? "" : "d-none"}>
        <ContractAttachment contractId={id} detailContract={true} />
      </div>

      <div className={tabContract === 6 ? "" : "d-none"}>
        <ContractHandOver
          contractId={id}
          detailContract={true}
          detailContractData={detailContract}
          reLoad={(reload) => {
            if (reload) {
              getDetailContract();
            }
          }}
        />
      </div>

      {/* <ModalEditCustomer
        onShow={editInfoCustomer}
        data={detailContract}
        onHide={(reload) => {
          if(reload){
            getDetailContract();
          }
          setEditInfoCustomer(false);
        }}
      /> */}

      <AddCustomerPersonModal
        onShow={editInfoCustomer}
        data={detailCustomer}
        onHide={(reload, nextModal) => {
          if (reload) {
            getDetailCustomer(detailContract?.customerId);
            getDetailContract();
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
            getDetailCustomer(detailContract?.customerId);
            getDetailContract();
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
            getDetailPartner(detailContract?.businessPartnerId);
            getDetailContract();
          }
          setEditInfoPartner(false);
        }}
      />
    </div>
  );
}
