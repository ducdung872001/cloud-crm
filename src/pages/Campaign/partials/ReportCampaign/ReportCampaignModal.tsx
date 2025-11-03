import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { formatCurrency, isDifferenceObj } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import { IAddCampaignModalProps } from "model/campaign/PropsModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import "./ReportCampaignModal.scss";

export default function ReportCampaignModal(props: any) {
  const { onShow, dataCampaign, onHide } = props;

  const data = {
    totalRevenue: dataCampaign?.totalRevenue || 0,
    totalCustomer: dataCampaign?.totalCustomer || 0,
    averageConvertRate: dataCampaign?.averageConvertRate || 0,

    realTotalRevenue: dataCampaign?.realTotalRevenue || 0,
    realTotalCustomer: dataCampaign?.realTotalCustomer || 0,
    realAverageConvertRate: dataCampaign?.realAverageConvertRate || 0,

    percentRealTotalRevenue: dataCampaign?.totalRevenue ? ((dataCampaign?.realTotalRevenue / dataCampaign?.totalRevenue) * 100).toFixed(2) : 0,
    percentRealTotalCustomer: dataCampaign?.totalCustomer ? ((dataCampaign?.realTotalCustomer / dataCampaign?.totalCustomer) * 100).toFixed(2) : 0,
    percentRealAverageConvertRate: dataCampaign?.averageConvertRate
      ? ((dataCampaign?.realAverageConvertRate / dataCampaign?.averageConvertRate) * 100).toFixed(2)
      : 0,
  };

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide(false)} className="modal-report-campaign">
        {/* <form className="form-add-campaign" onSubmit={(e) => onSubmit(e)}> */}
        <ModalHeader title={`Chiến dịch: ${dataCampaign?.name}`} toggle={() => onHide(false)} />
        <ModalBody>
          <div className="form-report-campaign">
            <div>
              <span>{`Mục tiêu doanh thu: ${formatCurrency(data.realTotalRevenue, ",", "")}/${formatCurrency(data.totalRevenue, ",", "")}`}</span>
              <div className="contaniner-percent">
                <div
                  style={{
                    height: 19,
                    width: data.percentRealTotalRevenue > 100 ? "100%" : `${data.percentRealTotalRevenue}%`,
                    backgroundColor: "#1a6bad",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                  <span style={{ fontSize: 12, color: "white" }}>{data.percentRealTotalRevenue}%</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <span>{`Mục tiêu đơn hàng: ${formatCurrency(data.realTotalCustomer, ",", "")}/${formatCurrency(data.totalCustomer, ",", "")}`}</span>
              <div className="contaniner-percent">
                <div
                  style={{
                    height: 19,
                    width: data.percentRealTotalCustomer > 100 ? "100%" : `${data.percentRealTotalCustomer}%`,
                    backgroundColor: "#1a6bad",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                  <span style={{ fontSize: 12, color: "white" }}>{data.percentRealTotalCustomer}%</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <span>{`Mục tiêu chuyển đổi: ${formatCurrency(data.realAverageConvertRate, ",", "")}/${formatCurrency(
                data.averageConvertRate,
                ",",
                ""
              )}`}</span>
              <div className="contaniner-percent">
                <div
                  style={{
                    height: 19,
                    width: data.percentRealAverageConvertRate > 100 ? "100%" : `${data.percentRealAverageConvertRate}%`,
                    backgroundColor: "#1a6bad",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                  <span style={{ fontSize: 12, color: "white" }}>{data.percentRealAverageConvertRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        {/* <ModalFooter actions={setupStep == 1 ? actions : actionsMethods} /> */}
        {/* </form> */}
      </Modal>
      {/* <Dialog content={contentDialog} isOpen={showDialog} /> */}
    </Fragment>
  );
}
