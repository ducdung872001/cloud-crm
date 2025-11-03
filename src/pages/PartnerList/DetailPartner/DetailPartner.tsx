import React, { Fragment, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "components/icon";
import Loading from "components/loading";
import { showToast } from "utils/common";
import "./DetailPartner.scss";
import moment from "moment";
import { convertToId, formatCurrency } from "reborn-util";
import { Parser } from "formula-functionizer";
import PartnerService from "services/PartnerService";
import InfoPartner from "./InfoPartner/InfoPartner";
import ViewDetailPartner from "./ViewDetailPartner/ViewDetailPartner";
import ListDetailTabPartner from "./ListDetailTabPartner/ListDetailTabPartner";
// import GuaranteeAttachment from "../GuaranteeAttachment/GuaranteeAttachment";
// import AddFile from "../partials/partials/AddFile";

export default function DetailPartner() {
  document.title = "Chi tiết đối tác";

  const { id } = useParams();
  const parser = new Parser();

  const takeUrlPartnerLocalStorage = JSON.parse(localStorage.getItem("backUpUrlPartner") || "");

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detailPartner, setDetailPartner] = useState(null);
  console.log("detailPartner", detailPartner);
  const [deleteSignal, setDeleteSignal] = useState<boolean>(false);

  const [infoFile, setInfoFile] = useState(null);
  const [listBank, setListBank] = useState([]);
  const [valueShowPhone, setValueShowPhone] = useState<string>("");

  const [tabPartner, setTabPartner] = useState(1);
  const dataStep = [
    {
      value: 1,
      label: "Thông tin đối tác",
    },
    // {
    //     value: 2,
    //     label: 'Tài liệu khác'
    // },
  ];

  const getDetailPartner = async () => {
    setIsLoading(true);
    const response = await PartnerService.detail(+id);

    if (response.code === 0) {
      const result = response.result;
      setDetailPartner(result);

      const bankList = (result.bank && JSON.parse(result.bank)) || [];
      setListBank(bankList);

      //   if(data && data.attachments && JSON.parse(data.attachments) && JSON.parse(data.attachments).length > 0){
      //     const attachment = JSON.parse(data.attachments)[0]

      //     setInfoFile({
      //       fileUrl: attachment,
      //       extension: attachment.includes('.docx') ? 'docx'
      //                   : attachment.includes('.xlsx') ? 'xlsx'
      //                   : (attachment.includes('.pdf') || attachment.includes('.PDF')) ? 'pdf'
      //                   : attachment.includes('.pptx') ? 'pptx'
      //                   : attachment.includes('.zip') ? 'zip'
      //                   : 'rar'
      //     });
      //   }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (id) {
      getDetailPartner();
    }
  }, [id]);

  const dataDetail = [
    {
      label: "Tên đối tác: ",
      value: detailPartner?.name || "",
    },
    {
      label: "Mã đối tác: ",
      value: detailPartner?.code || "",
    },
    {
      label: "Mã số thuế: ",
      value: detailPartner?.taxCode || "",
    },
    {
      label: "Số điện thoại: ",
      value: detailPartner?.phoneMasked || "",
    },
    {
      label: "Email: ",
      value: detailPartner?.email || "",
    },
    {
      label: "Người đại diện pháp luật: ",
      value: detailPartner?.contactName || "",
    },
    {
      label: "Địa chỉ đăng ký kinh doanh: ",
      value: detailPartner?.address || "",
    },
  ];

  const handShowPhone = async (id: number) => {
    const response = await PartnerService.viewPhone(id);
    if (response.code == 0) {
      const result = response.result;
      setValueShowPhone(result);
    } else if (response.code == 400) {
      showToast("Bạn không có quyền xem số điện thoại !", "error");
    } else {
      showToast(response.message, "error");
    }
  };

  return (
    <div className="page-content page-detail-partner">
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              navigate(`/partner?page=${takeUrlPartnerLocalStorage?.page || 1}`);
            }}
            className="title-first"
            title="Quay lại"
          >
            Danh sách đối tác
          </h1>
          <Icon name="ChevronRight" />
          <h1 className="title-last">Chi tiết đối tác</h1>
        </div>
      </div>

      <div className="card-box d-flex flex-column">
        {!isLoading && detailPartner !== null ? (
          <Fragment>
            <div className="info-partner">
              <InfoPartner data={detailPartner} />
            </div>
            <div className="info-action-detail">
              <ViewDetailPartner data={detailPartner} callback={getDetailPartner} setDeleteSignal={setDeleteSignal} deleteSignal={deleteSignal} />
              <ListDetailTabPartner data={detailPartner} />
            </div>
          </Fragment>
        ) : isLoading ? (
          <Loading />
        ) : (
          ""
        )}
      </div>

      {/* <div style={{display: 'flex', marginTop: 10, marginBottom: '1.2rem'}}>
        {dataStep.map((item, index) => (
            <div 
              key={index}
              style={{borderBottom: tabPartner === item.value ? '1px solid' : '', paddingLeft: 12, paddingRight: 12, paddingBottom: 3, cursor:'pointer'}}
              onClick = {() => {
                setTabPartner(item.value)
              }}
          >
              <span style={{fontSize: 16, fontWeight:'500', color: tabPartner === item.value ? '' : '#d3d5d7'}}>{item.label}</span>
          </div>
        ))}
      </div>

      
      <div className={tabPartner === 1 ? "container-detail-partner" : 'd-none'}>
        <div style={{  padding: "2rem", backgroundColor: "white", maxHeight: "70rem", overflow: "auto", width:'100%' }}>
          {!isLoading ? (
            <Fragment>
                <div>
                    <h3 className="title__info">Thông tin đối tác</h3>
                    <div className="box-partner-info">
                        {dataDetail.map((item, index) => (
                            item.label === 'Số điện thoại: ' ?
                                <div 
                                    key={index} 
                                    className='box-title'
                                >
                                    <span className="title">{item.label}</span>
                                    <span className={"text"}>{valueShowPhone || item.value}</span>
                                    
                                    <span className="isEye" 
                                        onClick={(e) => {
                                            if(!valueShowPhone){
                                                handShowPhone(+id)
                                            } else {
                                                setValueShowPhone('');
                                            }
                                            
                                        }}
                                    >
                                        <Icon name={valueShowPhone ? "EyeSlash" : "Eye"} />
                                    </span>
                                </div>
                             :
                            <div 
                                key={index} 
                                className={
                                    item.label === 'Địa chỉ đăng ký kinh doanh: ' 
                                        ? "box-title-full" 
                                        : "box-title"
                                    }
                            >
                                <span className="title">{item.label}</span>
                                <span className={"text"}>{item.value}</span>
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
                    <div className="container-list-bank">
                        <div>
                            <span className="title">Tài khoản hưởng thụ:</span>
                        </div>
                        {listBank && listBank?.length > 0 ?
                            <div className="box-bank">
                                    {listBank.map((item, index) => (
                                        <div key={index} className="list-bank">
                                            <div className="item-bank">
                                                <span className="title">Số tài khoản: </span>
                                                <span className={'text'}>{item.number}</span>
                                            </div>
                                            <div className="item-bank">
                                                <span className="title">Người hưởng thụ: </span>
                                                <span className={'text'}>{item.accountName}</span>
                                            </div>
                                            <div className="item-bank">
                                                <span className="title">Ngân hàng: </span>
                                                <span className={'text'}>{item.bankName}</span>
                                            </div>
                                        </div>
                                    ))}
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
      </div> */}
    </div>
  );
}
