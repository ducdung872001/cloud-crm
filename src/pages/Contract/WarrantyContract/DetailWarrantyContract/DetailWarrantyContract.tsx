import React, { Fragment, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "components/icon";
import Loading from "components/loading";
import { showToast } from "utils/common";
import "./DetailWarrantyContract.scss";
import moment from "moment";
import { formatCurrency } from "reborn-util";
import { Parser } from "formula-functionizer";
import AddFile from "../partials/partials/AddFile";
import WarrantyAttachment from "../WarrantyAttachment/WarrantyAttachment";
import ContractWarrantyService from "services/ContractWarrantyService";

export default function DetailWarrantyContract() {
  document.title = "Chi tiết Bảo hành";

  const { id } = useParams();

  const takeUrlWarrantyLocalStorage = JSON.parse(localStorage.getItem("backUpUrlWarrantyContract") || "");

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detailWarranty, setDetailWarranty] = useState(null);
  const [infoFile, setInfoFile] = useState(null);

  const [tabWarranty, setTabWarranty] = useState(1);
  const dataStep = [
    {
      value: 1,
      label: "Thông tin Bảo hành",
    },
    {
      value: 2,
      label: "Tài liệu khác",
    },
  ];

  const getDetailWarranty = async () => {
    setIsLoading(true);
    const response = await ContractWarrantyService.detail(+id);

    if (response.code === 0) {
      const result = response.result;
      const data = result[0] || null;
      setDetailWarranty(result[0] || null);

      if (data && data.attachments && JSON.parse(data.attachments) && JSON.parse(data.attachments).length > 0) {
        const attachment = JSON.parse(data.attachments)[0];

        setInfoFile({
          fileUrl: attachment,
          extension: attachment.includes(".docx")
            ? "docx"
            : attachment.includes(".xlsx")
            ? "xlsx"
            : attachment.includes(".pdf")
            ? "pdf"
            : attachment.includes(".pptx")
            ? "pptx"
            : attachment.includes(".zip")
            ? "zip"
            : "rar",
        });
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (id) {
      getDetailWarranty();
    }
  }, [id]);

  const dataDetail = [
    {
      label: "Tên bảo hành: ",
      value: detailWarranty?.name || "",
    },
    // {
    //   label: "Loại Bảo hành: ",
    //   value: detailWarranty?.warrantyType?.name || "",
    // },
    // {
    //   label: "Nghiệp vụ Bảo hành: ",
    //   value: detailWarranty?.competency?.name || "",
    // },
    {
      label: "Hợp đồng gốc: ",
      value: detailWarranty?.contract?.name || "",
    },
    {
      label: "Dự án: ",
      value: detailWarranty?.projectName || "",
    },
    // {
    //   label: "Loại tiền tệ: ",
    //   value: detailWarranty?.currency || "",
    // },
    // {
    //   label: "Tỷ giá: ",
    //   value: formatCurrency(detailWarranty?.exchangeRate, ",", "") || "",
    // },
    // {
    //   label: "Giá trị Bảo hành bằng ngoại tệ: ",
    //   value: formatCurrency(detailWarranty?.currencyValue, ",", "") || "",
    // },

    // {
    //   label: "Giá trị Bảo hành(VNĐ): ",
    //   value: formatCurrency(detailWarranty?.value || 0) || "",
    // },
    {
      label: "Ngày bắt đầu: ",
      value: detailWarranty?.startDate ? moment(detailWarranty?.startDate).format("DD/MM/YYYY") : "",
    },
    {
      label: "Ngày hết hạn: ",
      value: detailWarranty?.endDate ? moment(detailWarranty?.endDate).format("DD/MM/YYYY") : "",
    },
    {
      label: "Đơn vị bảo hành: ",
      value: detailWarranty?.cusCompetencyPartner?.name || detailWarranty?.competencyPartner?.name || detailWarranty?.competency.name || "",
    },
    {
      label: "Đơn vị thụ hưởng: ",
      value: detailWarranty?.cusBeneficialPartner?.name || detailWarranty?.beneficialPartner?.name || "",
    },

    // {
    //   label: "Trạng thái: ",
    //   value: detailWarranty?.status === 1 ? "Đang hoạt động" : "Không hoạt động",
    // },
  ];

  return (
    <div className="page-content page-detail-warranty-contract">
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              navigate(`/warrantyContract?page=${takeUrlWarrantyLocalStorage?.page || 1}`);
            }}
            className="title-first"
            title="Quay lại"
          >
            Danh sách Bảo hành
          </h1>
          <Icon name="ChevronRight" />
          <h1 className="title-last">Chi tiết Bảo hành</h1>
        </div>
      </div>

      <div style={{ display: "flex", marginTop: 10, marginBottom: "1.2rem" }}>
        {dataStep.map((item, index) => (
          <div
            key={index}
            style={{
              borderBottom: tabWarranty === item.value ? "1px solid" : "",
              paddingLeft: 12,
              paddingRight: 12,
              paddingBottom: 3,
              cursor: "pointer",
            }}
            onClick={() => {
              setTabWarranty(item.value);
            }}
          >
            <span style={{ fontSize: 16, fontWeight: "500", color: tabWarranty === item.value ? "" : "#d3d5d7" }}>{item.label}</span>
          </div>
        ))}
      </div>

      <div className={tabWarranty === 1 ? "container-detail-warranty-contract" : "d-none"}>
        <div style={{ padding: "2rem", backgroundColor: "white", maxHeight: "70rem", overflow: "auto", width: "100%" }}>
          {!isLoading ? (
            <Fragment>
              <div>
                <h3 className="title__info">Thông tin Bảo hành</h3>
                <div className="box-warranty-info">
                  {dataDetail.map((item, index) => (
                    <div key={index} className="box-title">
                      <span className="title">{item.label}</span>
                      <span
                        className={
                          item.label === "Trạng thái: " ? (item.value === "Đang hoạt động" ? "status-active-text" : "status-active-text") : "text"
                        }
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}

                  {infoFile?.fileUrl ? (
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
            </Fragment>
          ) : isLoading ? (
            <Loading />
          ) : (
            ""
          )}
        </div>
      </div>

      <div className={tabWarranty === 2 ? "" : "d-none"}>
        <WarrantyAttachment warrantyId={id} />
      </div>
    </div>
  );
}
