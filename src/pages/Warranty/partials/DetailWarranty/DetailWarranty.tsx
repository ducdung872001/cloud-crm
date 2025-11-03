import React, { Fragment, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "components/icon";
import Loading from "components/loading";
import { IWarrantyResponseModel } from "model/warranty/WarrantyResponseModel";
import WarrantyService from "services/WarrantyService";
import { showToast } from "utils/common";
import InfoCustomerWarranty from "./partials/InfoCustomerWarranty/InfoCustomerWarranty";
import ViewInfoWarranty from "./partials/ViewInfoWarranty/ViewInfoWarranty";
import InfoExchangeWarranty from "./partials/InfoExchangeWarranty/InfoExchangeWarranty";
import ProcedureSupport from "./partials/ProcedureSupport/ProcedureSupport";
import HistorySupport from "./partials/HistorySupport/HistorySupport";
import SupportCommonService from "services/SupportCommonService";
import "./DetailWarranty.scss";

export default function DetailWarranty() {
  document.title = "Chi tiết bảo hành";

  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detailWarranty, setDetailWarranty] = useState<IWarrantyResponseModel>(null);

  const getDetailWarranty = async () => {
    setIsLoading(true);
    const response = await WarrantyService.detail(+id);

    if (response.code === 0) {
      const result = response.result;
      setDetailWarranty(result);
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

  const [showBlockRight, setShowBlockRight] = useState<number>(0);

  const [infoApproved, setInfoApproved] = useState(null);

  const [lstSupportLog, setLstSupportLog] = useState([]);

  const [hasTransferVotes, setHasTransferVotes] = useState<boolean>(false);

  const handleGetObjectApproved = async (id: number) => {
    if (!id) return;

    const params = {
      objectId: id,
      objectType: 2,
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
      objectType: 2,
    };

    const response = await SupportCommonService.lstLog(params);

    if (response.code === 0) {
      const result = response.result;
      setLstSupportLog(result);
    } else {
      showToast("Lịch sử bảo hành đang lỗi. Xin vui lòng thử lại sau", "error");
    }
  };

  const handCheckApproved = async (id: number) => {
    const params = {
      objectId: id,
      objectType: 2,
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
    if (detailWarranty) {
      handleGetObjectApproved(detailWarranty.id);
      handCheckApproved(detailWarranty.id);
      handleLstSupportLog(detailWarranty.id);
    }
  }, [detailWarranty]);

  return (
    <div className="page-content page-detail-warranty">
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              navigate("/warranty");
            }}
            className="title-first"
            title="Quay lại"
          >
            Tiếp nhận bảo hành
          </h1>
          <Icon name="ChevronRight" />
          <h1 className="title-last">Chi tiết bảo hành</h1>
        </div>
      </div>

      <div className="card-box d-flex flex-column">
        {!isLoading && detailWarranty ? (
          <Fragment>
            <div className="info-customer-warranty">
              <InfoCustomerWarranty data={detailWarranty} />
            </div>
            <div className="info-action-detail">
              <ViewInfoWarranty
                data={detailWarranty}
                infoApproved={infoApproved}
                takeBlockRight={(data) => setShowBlockRight(data)}
                onReload={(reload) => {
                  if (reload) {
                    handleGetObjectApproved(detailWarranty.id);
                  }
                }}
              />
              {showBlockRight === 0 ? (
                <InfoExchangeWarranty idWarranty={detailWarranty.id} />
              ) : showBlockRight === 1 ? (
                <HistorySupport
                  data={detailWarranty}
                  infoApproved={infoApproved}
                  lstSupportLog={lstSupportLog}
                  hasTransferVotes={hasTransferVotes}
                  onReload={(reload) => {
                    if (reload) {
                      handleLstSupportLog(detailWarranty?.id);
                    }
                  }}
                />
              ) : (
                <ProcedureSupport infoApproved={infoApproved} idWarranty={detailWarranty.id} />
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
