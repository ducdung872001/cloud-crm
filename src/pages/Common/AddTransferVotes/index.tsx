import React, { Fragment, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { IActionModal } from "model/OtherModel";
import TextArea from "components/textarea/textarea";
import SelectCustom from "components/selectCustom/selectCustom";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import SupportCommonService from "services/SupportCommonService";
import TicketProcService from "services/TicketProcService";
import WarrantyProcService from "services/WarrantyProcService";

import "./index.scss";

interface IAddTransferVotesProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  dataProps?: any;
  data?: any;
  type: "ticket" | "warranty";
}

export default function AddTransferVotes(props: IAddTransferVotesProps) {
  const { onShow, onHide, data, dataProps, type } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const values = useMemo(
    () => ({
      supportId: data ? data.supportId : null,
      note: data ? data.note : "",
      objectId: dataProps ? dataProps.objectId : null,
      objectType: dataProps ? dataProps.objectType : null,
      nodeId: data ? data.nodeId : 0,
    }),
    [onShow, data, dataProps]
  );

  const [formData, setFormData] = useState(values);

  useEffect(() => {
    setFormData(values);
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const [validateFieldSupport, setValidateFieldSupport] = useState<boolean>(false);

  const [valueSupport, setValueSupport] = useState(null);

  const loadedOptionSupport = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      status: 1,
      type: type === "ticket" ? 1 : 2,
      limit: 10,
    };

    let response = null;

    if (type === "ticket") {
      response = await TicketProcService.list(param);
    } else {
      response = await WarrantyProcService.list(param);
    }

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                };
              })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  const handleChangeValueSupport = (e) => {
    setValueSupport(e);
    setFormData({ ...formData, supportId: e.value });
    setValidateFieldSupport(false);
  };

  const handleChangeValueNote = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, note: value });
  };

  const handleClearForm = (acc) => {
    onHide(acc);
    setFormData(values);
    setValueSupport(null);
    setValidateFieldSupport(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!formData.supportId) {
      setValidateFieldSupport(true);
      return;
    }

    setIsSubmit(true);

    const body = {
      ...formData,
    };

    const response = await SupportCommonService.updateObject(body);

    if (response.code === 0) {
      showToast("Chuyển phiếu thành công", "success");
      handleClearForm(true);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              handleClearForm(false);
            },
          },
          {
            title: "Xác nhận",
            type: "submit",
            color: "primary",
            disabled: isSubmit || _.isEqual(formData, values) || validateFieldSupport,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, validateFieldSupport, formData, values]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-add-transfer--votes"
      >
        <form className="form-add-transfer--votes" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Chuyển phiếu`} toggle={() => !isSubmit && handleClearForm(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <SelectCustom
                  key={type}
                  name="supportId"
                  value={valueSupport}
                  label={`Chọn quy trình ${type == "ticket" ? "hỗ trợ" : "bảo hành"}`}
                  fill={true}
                  required={true}
                  options={[]}
                  isAsyncPaginate={true}
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionSupport}
                  placeholder={`Chọn quy trình ${type == "ticket" ? "hỗ trợ" : "bảo hành"}`}
                  onChange={(e) => handleChangeValueSupport(e)}
                  error={validateFieldSupport}
                  message={`Quy trình ${type == "ticket" ? "hỗ trợ" : "bảo hành"} không được bỏ trống`}
                />
              </div>
              <div className="form-group">
                <TextArea
                  name="note"
                  value={formData.note}
                  label="Ghi chú"
                  fill={true}
                  onChange={(e) => handleChangeValueNote(e)}
                  placeholder="Nhập ghi chú"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
    </Fragment>
  );
}
