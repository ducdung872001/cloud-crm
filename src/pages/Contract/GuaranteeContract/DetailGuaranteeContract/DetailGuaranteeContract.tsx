import React, { Fragment, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "components/icon";
import Loading from "components/loading";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import CustomerService from "services/CustomerService";
import { showToast } from "utils/common";
import "./DetailGuaranteeContract.scss";
import ContractService from "services/ContractService";
import moment from "moment";
import { convertToId, formatCurrency } from "reborn-util";
import ContractAttributeService from "services/ContractAttributeService";
import ContractExtraInfoService from "services/ContractExtraInfoService";
import { Parser } from "formula-functionizer";
import ContractGuaranteeService from "services/ContractGuaranteeService";
import GuaranteeAttachment from "../GuaranteeAttachment/GuaranteeAttachment";
import AddFile from "../partials/partials/AddFile";

export default function DetailGuaranteeContract() {
  document.title = "Chi tiết bảo lãnh";

  const { id } = useParams();
  const parser = new Parser();

  const takeUrlGuaranteeLocalStorage = JSON.parse(localStorage.getItem("backUpUrlGuarantee") || "");

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detailGuarantee, setDetailGuarantee] = useState(null);
  const [infoFile, setInfoFile] = useState(null);

  const [tabGuarantee, setTabGuarantee] = useState(1);
  const dataStep = [
    {
        value: 1,
        label: 'Thông tin bảo lãnh'
    },
    {
        value: 2,
        label: 'Tài liệu khác'
    },
]

  const getDetailGuarantee = async () => {
    setIsLoading(true);
    const response = await ContractGuaranteeService.detail(+id);

    if (response.code === 0) {
      const result = response.result;
      const data = result[0] || null;
      setDetailGuarantee(result[0] || null);

      if(data && data.attachments && JSON.parse(data.attachments) && JSON.parse(data.attachments).length > 0){
        const attachment = JSON.parse(data.attachments)[0]
        
        setInfoFile({
          fileUrl: attachment,
          extension: attachment.includes('.docx') ? 'docx'
                      : attachment.includes('.xlsx') ? 'xlsx'
                      : (attachment.includes('.pdf') || attachment.includes('.PDF')) ? 'pdf'
                      : attachment.includes('.pptx') ? 'pptx'
                      : attachment.includes('.zip') ? 'zip'
                      : 'rar'
        });
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (id) {
        getDetailGuarantee();
    }
  }, [id]);

  const dataDetail = [
    {
        label: 'Số thư bảo lãnh: ',
        value: detailGuarantee?.numberLetter || ''
    },
    {
        label: 'Loại bảo lãnh: ',
        value: detailGuarantee?.guaranteeType?.name || ''
    },
    {
        label: 'Nghiệp vụ bảo lãnh: ',
        value: detailGuarantee?.competency?.name || ''
    },
    {
        label: 'Hợp đồng gốc: ',
        value: detailGuarantee?.contract?.name || ''
    },
    {
        label: 'Giá trị hợp đồng: ',
        value: formatCurrency(detailGuarantee?.contractValue || 0) || ''
    },
    {
        label: 'Loại tiền tệ: ',
        value: detailGuarantee?.currency || ''
    },
    {
        label: 'Tỷ giá: ',
        value: formatCurrency(detailGuarantee?.exchangeRate, ",", "") || ''
    },
    {
        label: 'Giá trị bảo lãnh bằng ngoại tệ: ',
        value: formatCurrency(detailGuarantee?.currencyValue, ",", "") || ''
    },

    {
        label: 'Giá trị bảo lãnh(VNĐ): ',
        value:  formatCurrency(detailGuarantee?.value || 0) || ''
    },

    {
        label: 'Tỉ lệ ký quỹ(%): ',
        value: detailGuarantee?.signRate || ''
    },
    {
        label: 'Ngày lập: ',
        value: detailGuarantee?.establishDate ? moment(detailGuarantee?.establishDate).format('DD/MM/YYYY') : ''
    },
    {
        label: 'Ngày ký: ',
        value: detailGuarantee?.signDate ? moment(detailGuarantee?.signDate).format('DD/MM/YYYY') : ''
    },

    {
        label: 'Ngày bắt đầu: ',
        value: detailGuarantee?.startDate ? moment(detailGuarantee?.startDate).format('DD/MM/YYYY') : ''
    },
    {
        label: 'Ngày hết hạn: ',
        value: detailGuarantee?.endDate ? moment(detailGuarantee?.endDate).format('DD/MM/YYYY') : ''
    },

    {
        label: 'Ngân hàng bảo lãnh: ',
        value: detailGuarantee?.bank?.name || ''
    },

    {
        label: 'Đơn vị phát hành: ',
        value: detailGuarantee?.cusIssuerPartner?.name || detailGuarantee?.issuerPartner?.name || ''
    },
    {
        label: 'Đơn vị thụ hưởng: ',
        value: detailGuarantee?.cusBeneficialPartner?.name || detailGuarantee?.beneficialPartner?.name || ''
    },

    {
        label: 'Trạng thái: ',
        value: detailGuarantee?.status === 1 ? 'Đang hoạt động' : 'Không hoạt động' 
    },

  ]


  return (
    <div className="page-content page-detail-guarantee-contract">
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              navigate(
                `/guarantee?page=${takeUrlGuaranteeLocalStorage?.page || 1}`
              );
            }}
            className="title-first"
            title="Quay lại"
          >
            Danh sách bảo lãnh
          </h1>
          <Icon name="ChevronRight" />
          <h1 className="title-last">Chi tiết bảo lãnh</h1>
        </div>
      </div>

      <div style={{display: 'flex', marginTop: 10, marginBottom: '1.2rem'}}>
        {dataStep.map((item, index) => (
            <div 
              key={index}
              style={{borderBottom: tabGuarantee === item.value ? '1px solid' : '', paddingLeft: 12, paddingRight: 12, paddingBottom: 3, cursor:'pointer'}}
              onClick = {() => {
                setTabGuarantee(item.value)
              }}
          >
              <span style={{fontSize: 16, fontWeight:'500', color: tabGuarantee === item.value ? '' : '#d3d5d7'}}>{item.label}</span>
          </div>
        ))}
      </div>

      
      <div className={tabGuarantee === 1 ? "container-detail-guarantee-contract" : 'd-none'}>
        <div style={{  padding: "2rem", backgroundColor: "white", maxHeight: "70rem", overflow: "auto", width:'100%' }}>
          {!isLoading ? (
            <Fragment>
                <div>
                    <h3 className="title__info">Thông tin bảo lãnh</h3>
                    <div className="box-guarantee-info">
                        {dataDetail.map((item, index) => (
                            <div key={index} className="box-title">
                                <span className="title">{item.label}</span>
                                <span className={item.label === 'Trạng thái: ' ? (item.value === 'Đang hoạt động' ? 'status-active-text' : 'status-active-text') : "text"}>{item.value}</span>
                            </div>
                        ))}

                        {infoFile?.fileUrl ? 
                          <div className="container_template_contract">
                            <div>
                              <span className="title_template">Tài liệu đính kèm</span>
                            </div>
                            <div className="box_template">
                              <div className="box__update--attachment">
                                <AddFile
                                    takeFileAdd={() => {}}
                                    infoFile={infoFile}
                                    setInfoFile={setInfoFile}
                                    notAddFile = {true}
                                    // setIsLoadingFile={setIsLoadingFile}
                                    // dataAttachment={data}
                                />
                              </div>
                            </div>
                          </div>
                        : null}
                        
                    </div>
                </div>
    
            </Fragment>
          ) : isLoading ? (
            <Loading />
          ) : (
            ""
          )}
        </div>
      </div>

     

      <div className= {tabGuarantee === 2 ? '' : 'd-none'}>
        <GuaranteeAttachment
          guaranteeId={id}
        />
      </div>
      
    </div>
  );
}
