import React, { Fragment, useMemo, useState, useEffect } from "react";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Checkbox from "components/checkbox/checkbox";
import { IActionModal } from "model/OtherModel";
import { IFanpageFacebookRequest } from "model/fanpageFacebook/FanpageFacebookRequestModel";
import { AddFanpageModalProps } from "model/fanpageFacebook/PropsModel";
import { IFanpageFacebookResponse } from "model/fanpageFacebook/FanpageResponseModel";
import { showToast } from "utils/common";
import FanpageFacebookService from "services/FanpageFacebookService";
import "./index.scss";

export default function AddFanpageModal(props: AddFanpageModalProps) {
  const { onShow, onHide, data, listFanpageFacebook } = props;

  const [listIdChecked, setListIdChecked] = useState<string[]>([]);

  //! biến này tạo ra với mục đích tránh gọi API không cần thiết
  const [checkReload, setCheckReload] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề khi mà đã có fapage rồi thì fill ra dữ liệu
  //  vào những ô đã tích
  useEffect(() => {
    const result = listFanpageFacebook.map((item) => item._fanpage_id);

    setListIdChecked(result || []);
  }, [data, listFanpageFacebook]);

  const titles = ["STT", "Tên Fanpage", "UID", "Chọn"];

  const dataFormat = ["text-center", "", "", "text-center"];

  //! đoạn này xử lý xem nó check ông nào
  const checkOne = (id: string, isChecked: boolean, item) => {
    if (isChecked) {
      setListIdChecked && setListIdChecked([...(listIdChecked ?? []), id]);
      handleUpdateFanpage(item);
    } else {
      setListIdChecked && setListIdChecked(listIdChecked?.filter((i) => i !== id) ?? []);
      handleRemoveFanpage(id);
    }
  };

  //! đoạn này callAPI remove
  const handleRemoveFanpage = async (fanpageId: string) => {
    const response = await FanpageFacebookService.delete(fanpageId);

    if (response.code === 0) {
      showToast(`Xóa Fanpage thành công`, "success");
      setCheckReload(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  //! đoạn này xử lý vấn đề callAPI update
  const handleUpdateFanpage = async (dataDetailFanpage: IFanpageFacebookResponse) => {
    const body: IFanpageFacebookRequest = {
      name: dataDetailFanpage?.name,
      _fanpage_id: dataDetailFanpage?._fanpage_id,
      userAccessToken: dataDetailFanpage?.accessToken,
    };

    const response = await FanpageFacebookService.update(body);
    if (response.code === 0) {
      showToast(`Chọn Fanpage thành công`, "success");
      setCheckReload(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
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
              checkReload ? onHide(true) : onHide(false);
              setCheckReload(false);
            },
          },
        ],
      },
    }),
    [checkReload]
  );

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide(false)} className="modal-add-fanpage">
        <ModalHeader title="Chọn Fanpage Facebook cần kết nối" toggle={() => (checkReload ? onHide(true) : onHide(false))} />
        <ModalBody>
          <div className="list-fanpage">
            {data && data.length > 0 && (
              <div className="table__fanpage--facebook">
                <table className="wrapper-table">
                  <thead>
                    <tr>
                      {titles?.map((title, idx) => (
                        <th key={idx} className={`${dataFormat ? dataFormat[idx] : ""}`}>
                          {title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => {
                      const isChecked = listIdChecked && setListIdChecked && listIdChecked.some((id) => id == item._fanpage_id) ? true : false;

                      return (
                        <tr
                          key={index}
                          onClick={() => {
                            checkOne(item._fanpage_id, !isChecked, item);
                          }}
                          className={`cursor-pointer ${isChecked ? " has-choose" : ""}`}
                        >
                          <td className="text-center">{index + 1}</td>
                          <td>{item.name}</td>
                          <td>{item._fanpage_id}</td>
                          {listIdChecked && setListIdChecked && (
                            <td className="text-center checkbox" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={isChecked}
                                onChange={(e) => {
                                  checkOne(item._fanpage_id, e.target.checked, item);
                                }}
                              />
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter actions={actions} />
      </Modal>
    </Fragment>
  );
}
