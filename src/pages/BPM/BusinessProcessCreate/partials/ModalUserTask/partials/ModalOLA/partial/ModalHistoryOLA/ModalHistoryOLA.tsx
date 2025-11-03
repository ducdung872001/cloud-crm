import React, { Fragment, useState, useMemo, useEffect } from "react";
import { IAction, IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import "./ModalHistoryOLA.scss";
import _ from "lodash";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import { showToast } from "utils/common";
import BusinessProcessService from "services/BusinessProcessService";
import moment from "moment";


export default function ModalHistoryOLA(props: any) {
  //isBatch: Thêm hàng loạt cơ hội (thêm nhanh từ màn hình danh sách khách hàng)
  const { onShow, onHide, dataNode} = props;
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [listHistoryOLA, setListHistoryOLA] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if(onShow && dataNode){
      getListHistoryOLA(dataNode?.id);
    } 
  }, [onShow, dataNode])

  const getListHistoryOLA = async (nodeId) => {
    setIsLoading(true);
    
    const params = {
      nodeId: nodeId,
    };

    const response = await BusinessProcessService.listHistoryOLA(params);
    if (response.code === 0) {
      const result = response.result;
      const listHistory = [];

      if(result && result.length > 0){
        result.map(item => {
          listHistory.push({
            date: item.startTime ? moment(item.startTime).format('DD/MM/YYYY HH:mm') : '',
            responseTime: `${item.responseDay} ngày, ${item.responseHour} giờ, ${item.responseMinute} phút`,
            processedTime: `${item.processDay} ngày, ${item.processHour} giờ, ${item.processMinute} phút`,
          })
        })
      }
      setListHistoryOLA(listHistory);
      
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  const titles = ["STT", "Ngày", "Thời gian phản hồi", "Thời gian xử lý"];
  const dataFormat = ["text-center", "", ""];

  const dataMappingArray = (item: any, index: number) => 
    [
      index + 1,
      item.date,
      item.responseTime,
      item.processedTime
    ];
  
  const actionsTable = (item: any): IAction[] => {
    return [
      
    ].filter((action) => action);
  };
  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => {
              clearForm();
              // _.isEqual(formData.values, valueSetting) ? handClearForm() : showDialogConfirmCancel();
            },
          },
        //   {
        //     title: "Áp dụng",
        //     type: "submit",
        //     color: "primary",
        //     disabled: isSubmit,
        //     // (!isDifferenceObj(formData.values, valueSetting) || ),
        //     // _.isEqual(formData.values, valueSetting),
        //     is_loading: isSubmit,
        //   },
        ],
      },
    }),
    []
  );

  const clearForm = () => {
    onHide(false);
    setListHistoryOLA([]);
  }

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => onHide(false)}
        size='lg'
        className="modal-history-OLA"
      >
        <form className="form-history-OLA" >
          <ModalHeader title={`Lịch sử OLA`} toggle={() => clearForm()} />
          <ModalBody>
            <div className="list-history-OLA">
              {!isLoading && listHistoryOLA && listHistoryOLA.length > 0 ? (
                <BoxTable
                  name="Nhân viên"
                  titles={titles}
                  items={listHistoryOLA}
                  isPagination={false}
                  // dataPagination={pagination}
                  dataMappingArray={(item, index) => dataMappingArray(item, index)}
                  dataFormat={dataFormat}
                  listIdChecked={[]}
                  isBulkAction={false}
                  bulkActionItems={[]}
                  striped={true}
                  setListIdChecked={(listId) => {}}
                  actions={actionsTable}
                  actionType="inline"
                />
              ) : isLoading ? (
                <Loading />
              ) : (
                <Fragment>
                  <SystemNotification
                      description={
                        <span>
                          Hiện tại chưa cài đặt OLA. <br />
                        </span>
                      }
                      type="no-item"
                      titleButton=""
                      action={() => {}}
                    />
                </Fragment>
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
