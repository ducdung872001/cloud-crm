import React, { Fragment, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { IActionModal } from "model/OtherModel";
import TextArea from "components/textarea/textarea";
import SelectCustom from "components/selectCustom/selectCustom";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import ApprovalService from "services/ApprovalService";
import { showToast } from "utils/common";

import "./index.scss";

interface IAddSignerFSAndQuoteProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  dataProps?: any;
  data?: any;
}

export default function AddSignerFSAndQuote(props: IAddSignerFSAndQuoteProps) {
  const { onShow, onHide, data, dataProps } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const values = useMemo(
    () => ({
      approvalId: data ? data.approvalId : null,
      note: data ? data.note : "",
      objectId: dataProps ? dataProps.objectId : null,
      objectType: dataProps ? dataProps.objectType : null,
      nodeId: data ? data.nodeId : 0,
      status: data ? data.status : 0,
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

  const [validateFieldApproval, setValidateFieldApproval] = useState<boolean>(false);

  const [valueApproval, setValueApproval] = useState(null);

  const loadedOptionApproval = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      status: 1,
      limit: 10,
    };

    const response = await ApprovalService.list(param);

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

  const handleChangeValueApproval = (e) => {
    setValueApproval(e);
    setFormData({ ...formData, approvalId: e.value });
    setValidateFieldApproval(false);
  };

  const handleChangeValueNote = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, note: value });
  };

  const handleClearForm = (acc) => {
    onHide(acc);
    setFormData(values);
    setValueApproval(null);
    setValidateFieldApproval(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!formData.approvalId) {
      setValidateFieldApproval(true);
      return;
    }

    setIsSubmit(true);

    const body = {
      ...formData,
    };

    const response = await ApprovalService.updateObject(body);

    if (response.code === 0) {
      showToast("Trình ký thành công", "success");
      handleClearForm(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
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
            disabled: isSubmit || _.isEqual(formData, values) || validateFieldApproval,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, validateFieldApproval, formData, values]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-add-signer-fs-and-quote"
      >
        <form className="form-add-signer-fs-and-quote" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Trình ký`} toggle={() => !isSubmit && handleClearForm(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <SelectCustom
                  name="approvalId"
                  value={valueApproval}
                  label="Chọn quy trình phê duyệt"
                  fill={true}
                  required={true}
                  options={[]}
                  isAsyncPaginate={true}
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionApproval}
                  placeholder="Chọn quy trình phê duyệt"
                  onChange={(e) => handleChangeValueApproval(e)}
                  error={validateFieldApproval}
                  message="Quy trình phê duyệt không được bỏ trống"
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
