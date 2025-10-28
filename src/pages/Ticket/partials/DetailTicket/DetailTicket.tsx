import React, { Fragment, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "components/icon";
import Loading from "components/loading";
import { ITicketResponseModel } from "model/ticket/TicketResponseModel";
import TicketService from "services/TicketService";
import { showToast } from "utils/common";
import InfoCustomerTicket from "./partials/InfoCustomerTicket/InfoCustomerTicket";
import ViewInfoTicket from "./partials/ViewInfoTicket/ViewInfoTicket";
import InfoExchangeTicket from "./partials/InfoExchangeTicket/InfoExchangeTicket";
import SupportCommonService from "services/SupportCommonService";
import HistorySupport from "./partials/HistorySupport/HistorySupport";
import ProcedureSupport from "./partials/ProcedureSupport/ProcedureSupport";

import "./DetailTicket.scss";

export default function DetailTicket() {
  document.title = "Chi tiết Ticket";

  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detailTicket, setDetailTicket] = useState<ITicketResponseModel>(null);

  const getDetailTicket = async () => {
    setIsLoading(true);
    const response = await TicketService.detail(+id);

    if (response.code === 0) {
      const result = response.result;
      setDetailTicket(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (id) {
      getDetailTicket();
    }
  }, [id]);

  const [showBlockRight, setShowBlockRight] = useState<number>(0);

  const [infoApproved, setInfoApproved] = useState(null);

  const [lstSupportLog, setLstSupportLog] = useState([]);

  const [hasTransferVotes, setHasTransferVotes] = useState<boolean>(false);

  const handleGetObjectApproved = async (id: number) => {
    if (!id) return;

    const params = {
      objectId: id,
      objectType: 1,
    };

    const response = await SupportCommonService.takeObject(params);

    if (response.code === 0) {
      const result = response.result;
      setInfoApproved(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }
  };

  const handleLstSupportLog = async (id: number) => {
    if (!id) return;

    const params = {
      objectId: id,
      objectType: 1,
    };

    const response = await SupportCommonService.lstLog(params);

    if (response.code === 0) {
      const result = response.result;
      setLstSupportLog(result);
    } else {
      showToast("Lịch sử hỗ trợ đang lỗi. Xin vui lòng thử lại sau", "error");
    }
  };

  const handCheckApproved = async (id: number) => {
    const params = {
      objectId: id,
      objectType: 1,
    };

    const response = await SupportCommonService.checkApproved(params);

    if (response.code === 0) {
      const result = response.result;

      if (!result) {
        setHasTransferVotes(true);
      } else {
        setHasTransferVotes(false);
      }
    } else {
      showToast("Kiểm tra xem đã chuyển phiếu đang lỗi. Xin vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (detailTicket) {
      handleGetObjectApproved(detailTicket.id);
      handCheckApproved(detailTicket.id);
      handleLstSupportLog(detailTicket.id);
    }
  }, [detailTicket]);

  return (
    <div className="page-content page-detail-ticket">
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              navigate("/ticket");
            }}
            className="title-first"
            title="Quay lại"
          >
            Tiếp nhận hỗ trợ
          </h1>
          <Icon name="ChevronRight" />
          <h1 className="title-last">Chi tiết hỗ trợ</h1>
        </div>
      </div>

      <div className="card-box d-flex flex-column">
        {!isLoading && detailTicket !== null ? (
          <Fragment>
            <div className="info-customer-ticket">
              <InfoCustomerTicket data={detailTicket} />
            </div>
            <div className="info-action-detail">
              <ViewInfoTicket
                data={detailTicket}
                infoApproved={infoApproved}
                takeBlockRight={(data) => setShowBlockRight(data)}
                onReload={(reload) => {
                  if (reload) {
                    handleGetObjectApproved(detailTicket.id);
                  }
                }}
              />
              {showBlockRight === 0 ? (
                <InfoExchangeTicket idTicket={detailTicket.id} />
              ) : showBlockRight === 1 ? (
                <HistorySupport
                  data={detailTicket}
                  infoApproved={infoApproved}
                  lstSupportLog={lstSupportLog}
                  hasTransferVotes={hasTransferVotes}
                  onReload={(reload) => {
                    if (reload) {
                      handleLstSupportLog(detailTicket?.id);
                      handCheckApproved(detailTicket?.id);
                    }
                  }}
                />
              ) : (
                <ProcedureSupport infoApproved={infoApproved} idTicket={detailTicket.id} />
              )}
            </div>
          </Fragment>
        ) : isLoading ? (
          <Loading />
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
