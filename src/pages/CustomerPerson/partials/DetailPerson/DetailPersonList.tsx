import React, { Fragment, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "components/icon";
import Loading from "components/loading";
import Button from "components/button/button";
import CustomerService from "services/CustomerService";
import { showToast } from "utils/common";
import InfoPerson from "./partials/InfoPerson/InfoPerson";
import ViewDetailPerson from "./partials/ViewDetailPerson/ViewDetailPerson";
import ListDetailTab from "./partials/ListDetailTab/ListDetailTab";
import { useWindowDimensions } from "utils/hookCustom";
import AddCustomerEmailModal from "./partials/ListDetailTab/partials/CustomerEmailList/partials/AddCustomerEmailModal";
import AddCustomPlaceholderEmailModal from "./partials/ListDetailTab/partials/CustomerEmailList/partials/CustomPlaceholder/AddCustomPlaceholderModal";
import AddWorkModal from "pages/MiddleWork/partials/ListWork/partials/AddWorkModal/AddWorkModal";
import AddCustomerSMSModal from "./partials/ListDetailTab/partials/CustomerSMSList/partials/AddCustomerSMSModal";
import AddCustomPlaceholderSMSModal from "./partials/ListDetailTab/partials/CustomerSMSList/partials/CustomPlaceholder/AddCustomPlaceholderModal";
import AddConsultationScheduleModal from "pages/CalendarCommon/partials/AddConsultationScheduleModal/AddConsultationScheduleModal";
import AddPhoneModal from "pages/CallCenter/partials/AddPhoneModal";

// styles handled by tnpm-shared.scss

export default function DetailPersonList() {
  document.title = "Chi tiết khách hàng";
  const { width } = useWindowDimensions();
  const { id } = useParams();
  const takeUrlCustomerLocalStorage = JSON.parse(
    localStorage.getItem("backUpUrlCustomer") || "{}"
  );

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detailPerson, setDetailPerson] = useState(null);
  const [deleteSignal, setDeleteSignal] = useState<boolean>(false);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showTypeModal, setShowTypeModal] = useState<string>("");
  const [codes, setCodes] = useState(null);
  const [showModalPlaceholder, setShowModalPlaceholder] = useState<boolean>(false);

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

  const [dataOther, setDataOther] = useState([]);

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

  // ── Actions phù hợp retail ────────────────────────────────────────────────
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
      t.keyword            ? `&keyword=${t.keyword}` : "",
      t.custType           ? `&custType=${t.custType}` : "",
      t.checkDebt          ? `&checkDebt=${t.checkDebt}` : "",
      t.cgpId              ? `&cgpId=${t.cgpId}` : "",
      t.careerId           ? `&careerId=${t.careerId}` : "",
      t.sourceId           ? `&sourceId=${t.sourceId}` : "",
      t.employeeId         ? `&employeeId=${t.employeeId}` : "",
    ];
    navigate(parts.join(""));
  };

  return (
    <div className="page-content page-detail-person retail-detail">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="retail-detail__header">
        <div className="retail-detail__breadcrumb">
          <span
            className="retail-detail__back-link"
            onClick={backScreenList}
            title="Quay lại danh sách"
          >
            <Icon name="ChevronLeft" />
            {width >= 1400 && <span>Danh sách khách hàng</span>}
          </span>
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
                  if (detailPerson?.phoneUnmasked) {
                    window.open(`tel:${detailPerson.phoneUnmasked}`);
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

      {/* ── Body — giữ nguyên cấu trúc cũ để InfoPerson không vỡ layout ── */}
      <div className="card-box d-flex flex-column">
        {isLoading ? (
          <Loading />
        ) : detailPerson ? (
          <Fragment>
            <div className="info-person">
              <InfoPerson data={detailPerson} />
            </div>
            <div className="info-action-detail">
              <ViewDetailPerson
                data={detailPerson}
                callback={getDetailPerson}
                setDeleteSignal={setDeleteSignal}
                dataOther={dataOther}
                deleteSignal={deleteSignal}
              />
              <ListDetailTab data={detailPerson} />
            </div>
          </Fragment>
        ) : null}
      </div>

      {/* ── Modals ────────────────────────────────────────────────────── */}
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
    </div>
  );
}