import React, { Fragment, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import parser from "html-react-parser";
import moment from "moment";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import Loading from "components/loading";
import Button from "components/button/button";
import CustomerService from "services/CustomerService";
import { showToast, convertToPrettyNumber } from "utils/common";
import ThirdGender from "assets/images/third-gender.png";
import ViewDetailPerson from "./partials/ViewDetailPerson/ViewDetailPerson";
import ListDetailTab from "./partials/ListDetailTab/ListDetailTab";
import AddCustomerPersonModal from "pages/CustomerPerson/partials/AddCustomerPersonModal";
import AddCustomerCompanyModal from "pages/CustomerPerson/partials/AddCustomerCompanyModal";
import AddCustomerViewerModal from "pages/CustomerPerson/partials/AddCustomerViewerModal/AddCustomerViewerModal";
import AddCustomerEmailModal from "./partials/ListDetailTab/partials/CustomerEmailList/partials/AddCustomerEmailModal";
import AddCustomPlaceholderEmailModal from "./partials/ListDetailTab/partials/CustomerEmailList/partials/CustomPlaceholder/AddCustomPlaceholderModal";
import AddWorkModal from "pages/MiddleWork/partials/ListWork/partials/AddWorkModal/AddWorkModal";
import AddCustomerSMSModal from "./partials/ListDetailTab/partials/CustomerSMSList/partials/AddCustomerSMSModal";
import AddCustomPlaceholderSMSModal from "./partials/ListDetailTab/partials/CustomerSMSList/partials/CustomPlaceholder/AddCustomPlaceholderModal";
import AddConsultationScheduleModal from "pages/CalendarCommon/partials/AddConsultationScheduleModal/AddConsultationScheduleModal";
import AddPhoneModal from "pages/CallCenter/partials/AddPhoneModal";
import ScoreHistoryModal from "./partials/ScoreHistoryModal";
import EditScoreModal from "./partials/EditScoreModal";

import "./DetailPersonList.scss";

export default function DetailPersonList() {
  document.title = "Chi tiết khách hàng";

  const { id } = useParams();
  const navigate = useNavigate();

  const takeUrlCustomerLocalStorage = JSON.parse(
    localStorage.getItem("backUpUrlCustomer") || "{}"
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detailPerson, setDetailPerson] = useState(null);
  const [deleteSignal, setDeleteSignal] = useState<boolean>(false);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showTypeModal, setShowTypeModal] = useState<string>("");
  const [codes, setCodes] = useState(null);
  const [showModalPlaceholder, setShowModalPlaceholder] = useState<boolean>(false);
  const [showModalHistory, setShowModalHistory] = useState<boolean>(false);
  const [showModalEditScore, setShowModalEditScore] = useState<boolean>(false);
  const [showModalEdit, setShowModalEdit] = useState<boolean>(false);
  const [showModalAddCompany, setShowModalAddCompany] = useState<boolean>(false);
  const [showModalAddViewer, setShowModalAddViewer] = useState<boolean>(false);

  // Accordion sidebar
  const [openSection, setOpenSection] = useState<string>("detail");

  const [dataOther, setDataOther] = useState([]);

  const getDetailPerson = async () => {
    setIsLoading(true);
    const response = await CustomerService.detail(+id);
    if (response.code === 0) {
      setDetailPerson(response.result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  const handleMergeData = (dataAttribute, dataExtraInfo) => {
    const result = dataExtraInfo
      .map((item) => {
        for (const key in dataAttribute) {
          const foundItem = dataAttribute[key].find((obj) => obj.id === item.attributeId);
          if (foundItem) return { value: item.attributeValue, label: foundItem.name };
        }
        return null;
      })
      .filter(Boolean);
    setDataOther(result);
  };

  useEffect(() => {
    if (detailPerson) {
      handleMergeData(detailPerson.mapCustomerAttribute, detailPerson.lstCustomerExtraInfo || []);
    }
  }, [detailPerson]);

  useEffect(() => {
    if (id && !deleteSignal) getDetailPerson();
  }, [id, deleteSignal]);

  const lstInteract = [
    { label: "Đặt lịch hẹn", icon: <Icon name="CalendarFill" />, type: "calendar" },
    { label: "Tạo công việc", icon: <Icon name="Job" />,          type: "job"      },
    { label: "Call",          icon: <Icon name="CallPhone" />,    type: "call"     },
    { label: "Email",         icon: <Icon name="EmailFill" />,    type: "email"    },
    { label: "SMS",           icon: <Icon name="SMS" />,          type: "sms"      },
  ];

  const backScreenList = () => {
    const t = takeUrlCustomerLocalStorage;
    const parts = [
      `/customer?contactType=${t.contactType ?? ""}&page=${t.page ?? 1}&limit=${t.limit ?? 10}`,
      t.keyword    ? `&keyword=${t.keyword}`       : "",
      t.custType   ? `&custType=${t.custType}`     : "",
      t.checkDebt  ? `&checkDebt=${t.checkDebt}`   : "",
      t.cgpId      ? `&cgpId=${t.cgpId}`           : "",
      t.careerId   ? `&careerId=${t.careerId}`     : "",
      t.sourceId   ? `&sourceId=${t.sourceId}`     : "",
      t.employeeId ? `&employeeId=${t.employeeId}` : "",
    ];
    navigate(parts.join(""));
  };

  const toggleSection = (key: string) =>
    setOpenSection((prev) => (prev === key ? "" : key));

  const notData = "—";
  const d = detailPerson;

  return (
    <div className="page-content page-detail-person retail-detail">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="retail-detail__header">
        <div className="retail-detail__breadcrumb">
          <span className="retail-detail__back-link" onClick={backScreenList}>
            <Icon name="ChevronLeft" />
            <span>Danh sách khách hàng</span>
          </span>
          <span className="retail-detail__sep">/</span>
          <span className="retail-detail__page-title">Chi tiết khách hàng</span>
        </div>

        <div className="retail-detail__actions">
          {lstInteract.map((item, idx) => (
            <Button
              key={idx}
              variant="outline"
              className="retail-detail__action-btn"
              onClick={() => {
                if (item.type === "call") {
                  if (d?.phoneUnmasked) {
                    window.open(`tel:${d.phoneUnmasked}`);
                  } else {
                    showToast("Khách hàng chưa có số điện thoại", "error");
                  }
                  return;
                }
                setShowTypeModal(item.type);
                setShowModalAdd(true);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="retail-detail__loading"><Loading /></div>
      ) : d ? (
        <div className="retail-detail__body">

          {/* ─── LEFT SIDEBAR ───────────────────────────────────── */}
          <aside className="retail-detail__sidebar">

            {/* Avatar + tên */}
            <div className="rds-identity">
              <div className="rds-identity__avatar">
                <img src={d.avatar || ThirdGender} alt={d.name} />
              </div>
              <div className="rds-identity__info">
                <div className="rds-identity__name">{d.name}</div>
                {(d.phoneUnmasked || d.phoneMasked) && (
                  <div className="rds-identity__phone">
                    <Icon name="Phone" />
                    {d.phoneUnmasked || d.phoneMasked}
                  </div>
                )}
                {(d.email || d.emailMasked) && (
                  <div className="rds-identity__email">
                    <Icon name="Email" />
                    {d.email || d.emailMasked}
                  </div>
                )}
              </div>
              <div className="rds-identity__actions">
                <Tippy content="Thêm người xem" delay={[100, 0]}>
                  <span className="rds-icon-btn rds-icon-btn--add" onClick={() => setShowModalAddViewer(true)}>
                    <Icon name="UserAdd" />
                  </span>
                </Tippy>
                <Tippy content="Chỉnh sửa" delay={[100, 0]}>
                  <span className="rds-icon-btn rds-icon-btn--edit"
                    onClick={() => d.custType === 1 ? setShowModalAddCompany(true) : setShowModalEdit(true)}>
                    <Icon name="Pencil" />
                  </span>
                </Tippy>
              </div>
            </div>

            {/* KPI cards */}
            <div className="rds-kpi-grid">
              <div className="rds-kpi">
                <span className="rds-kpi__label">Tổng chi tiêu</span>
                <span className="rds-kpi__value rds-kpi__value--primary">
                  {parser(convertToPrettyNumber(d.paid || 0))}
                </span>
              </div>
              <div className="rds-kpi">
                <span className="rds-kpi__label">Công nợ</span>
                <span className={`rds-kpi__value ${(d.debt || 0) > 0 ? "rds-kpi__value--danger" : ""}`}>
                  {parser(convertToPrettyNumber(d.debt || 0))}
                </span>
              </div>
              <div className="rds-kpi">
                <span className="rds-kpi__label">Số hóa đơn</span>
                <span className="rds-kpi__value">{d.invoiceCount || 0}</span>
              </div>
              <div className="rds-kpi">
                <span className="rds-kpi__label">Lần mua cuối</span>
                <span className="rds-kpi__value rds-kpi__value--sm">
                  {d.lastBoughtDate ? moment(d.lastBoughtDate).format("DD/MM/YYYY") : notData}
                </span>
              </div>
            </div>

            {/* Loyalty */}
            <div className="rds-loyalty">
              <div className="rds-loyalty__header">
                <span className="rds-loyalty__title">
                  <Icon name="Score" /> Loyalty
                </span>
                <div className="rds-loyalty__actions">
                  <Tippy content="Lịch sử điểm" delay={[100, 0]}>
                    <span className="rds-icon-btn" onClick={() => setShowModalHistory(true)}>
                      <Icon name="History" />
                    </span>
                  </Tippy>
                  <Tippy content="Điều chỉnh điểm" delay={[100, 0]}>
                    <span className="rds-icon-btn rds-icon-btn--edit" onClick={() => setShowModalEditScore(true)}>
                      <Icon name="Pencil" />
                    </span>
                  </Tippy>
                </div>
              </div>
              <div className="rds-loyalty__body">
                <div className="rds-loyalty__stat">
                  <Icon name="GoldMember" />
                  <span className="rds-loyalty__rank">{"Vàng"}</span>
                </div>
                <div className="rds-loyalty__points">
                  {"10.000"} <span>điểm</span>
                </div>
              </div>
            </div>

            {/* Accordion: Thông tin chi tiết */}
            <div className={`rds-accordion${openSection === "detail" ? " rds-accordion--open" : ""}`}>
              <div className="rds-accordion__header" onClick={() => toggleSection("detail")}>
                <span>Thông tin chi tiết</span>
                <Icon name={openSection === "detail" ? "ChevronDown" : "ChevronRight"} />
              </div>
              {openSection === "detail" && (
                <div className="rds-accordion__body">
                  <div className="rds-info-row"><span>Mã KH</span><span>{d.code || notData}</span></div>
                  <div className="rds-info-row"><span>Nhóm KH</span><span>{d.groupName || notData}</span></div>
                  <div className="rds-info-row"><span>Nguồn KH</span><span>{d.sourceName || notData}</span></div>
                  <div className="rds-info-row"><span>Người phụ trách</span><span>{d.employeeName || notData}</span></div>
                  <div className="rds-info-row">
                    <span>Ngày sinh</span>
                    <span>{d.birthday ? moment(d.birthday).format("DD/MM/YYYY") : notData}</span>
                  </div>
                  <div className="rds-info-row"><span>Địa chỉ</span><span>{d.address || notData}</span></div>
                </div>
              )}
            </div>

            {/* Accordion: Tương tác */}
            <div className={`rds-accordion${openSection === "interact" ? " rds-accordion--open" : ""}`}>
              <div className="rds-accordion__header" onClick={() => toggleSection("interact")}>
                <span>Tương tác</span>
                <Icon name={openSection === "interact" ? "ChevronDown" : "ChevronRight"} />
              </div>
              {openSection === "interact" && (
                <div className="rds-accordion__body">
                  <div className="rds-info-row"><span>Số tương tác</span><span>{d.contactCount || 0} lần</span></div>
                  <div className="rds-info-row"><span>Chưa liên hệ</span><span>{d.dayNotContact || 0} ngày</span></div>
                  <div className="rds-info-row">
                    <span>Liên hệ gần nhất</span>
                    <span>{d.lastContactDate ? moment(d.lastContactDate).format("DD/MM/YYYY") : notData}</span>
                  </div>
                </div>
              )}
            </div>

          </aside>

          {/* ─── RIGHT CONTENT — tabs ──────────────────────────── */}
          <div className="retail-detail__main">
            <ListDetailTab data={d} />
          </div>

        </div>
      ) : null}

      {/* ── Modals ──────────────────────────────────────────────── */}
      {showModalEdit && (
        <AddCustomerPersonModal
          onShow={showModalEdit}
          dataCustomer={detailPerson}
          callback={getDetailPerson}
          onHide={() => setShowModalEdit(false)}
        />
      )}
      {showModalAddCompany && (
        <AddCustomerCompanyModal
          onShow={showModalAddCompany}
          dataCustomer={detailPerson}
          callback={getDetailPerson}
          onHide={() => setShowModalAddCompany(false)}
        />
      )}
      {showModalAddViewer && (
        <AddCustomerViewerModal
          onShow={showModalAddViewer}
          dataCustomer={detailPerson}
          onHide={() => setShowModalAddViewer(false)}
        />
      )}
      {showTypeModal === "job" && (
        <AddWorkModal
          type="project"
          onShow={showModalAdd}
          onHide={() => setShowModalAdd(false)}
          customerId={detailPerson?.id}
          customerName={detailPerson?.name}
        />
      )}
      {showTypeModal === "calendar" && (
        <AddConsultationScheduleModal
          onShow={showModalAdd}
          onHide={() => setShowModalAdd(false)}
          idCustomer={detailPerson?.id}
          startDate={new Date()}
        />
      )}
      {showTypeModal === "sms" && (
        <Fragment>
          <AddCustomerSMSModal
            onShow={showModalAdd}
            idCustomer={detailPerson?.id}
            callback={(c) => { setCodes(c); setShowModalPlaceholder(true); }}
            onHide={() => setShowModalAdd(false)}
          />
          <AddCustomPlaceholderSMSModal
            onShow={showModalPlaceholder}
            data={codes}
            onHide={() => setShowModalPlaceholder(false)}
          />
        </Fragment>
      )}
      {showTypeModal === "email" && (
        <Fragment>
          <AddCustomerEmailModal
            onShow={showModalAdd}
            dataCustomer={detailPerson}
            callback={(c) => { setCodes(c); setShowModalPlaceholder(true); }}
            onHide={() => setShowModalAdd(false)}
          />
          <AddCustomPlaceholderEmailModal
            onShow={showModalPlaceholder}
            data={codes}
            onHide={() => setShowModalPlaceholder(false)}
          />
        </Fragment>
      )}
      {showTypeModal === "call" && (
        <AddPhoneModal
          onShow={showModalAdd}
          dataCustomer={detailPerson}
          onHide={() => setShowModalAdd(false)}
        />
      )}
      <ScoreHistoryModal
        onShow={showModalHistory}
        dataCustomer={detailPerson}
        onHide={() => setShowModalHistory(false)}
      />
      {showModalEditScore && (
        <EditScoreModal
          onShow={showModalEditScore}
          dataCustomer={detailPerson}
          callback={getDetailPerson}
          onHide={() => setShowModalEditScore(false)}
        />
      )}
    </div>
  );
}