import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import _ from "lodash";
import { IActionModal } from "model/OtherModel";
import SelectCustom from "components/selectCustom/selectCustom";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";

import "./index.scss";
import BusinessProcessService from "services/BusinessProcessService";
import MarketingAutomationService from "services/MarketingAutomationService";

interface IAddSignerFSAndQuoteProps {
  onShow: boolean;
  onHide: (reload: boolean) => void;
  data?: any;
}

export default function ModalSigner(props: IAddSignerFSAndQuoteProps) {
  const navigate = useNavigate();
  const { onShow, onHide, data } = props;
  // console.log("ModalSigner data", data);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [validateFieldProcess, setValidateFieldProcess] = useState<boolean>(false);
  const [valueProcess, setValueProcess] = useState(null);

  useEffect(() => {
    if (onShow && data && data?.processId) {
      setValueProcess({ value: data?.processId, label: data?.processName });
    }
  }, [onShow, data]);

  const values = useMemo(
    () => ({
      processId: data?.processId ?? null,
      processName: data?.processName ?? null,
      // potId: data?.id ?? null,
      // startNodeId: data?.startNodeId ?? null,
    }),
    [onShow, data]
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

  const handleClearForm = (acc) => {
    onHide(acc);
    setFormData(values);
    setValueProcess(null);
    // setValueNode(null);
    setValidateFieldApproval(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!formData.processId) {
      setValidateFieldProcess(true);
      return;
    }

    // if (!formData.startNodeId) {
    //   setValidateFieldNode(true);
    //   return;
    // }

    setIsSubmit(true);

    const body = {
      id: data?.id,
      maId: data?.maId,
      processId: formData.processId,
      // thêm các trường khác nếu cần
    };

    const response = await MarketingAutomationService.updateMapping(body);

    console.log("response updateMapping>>>>>", response);

    if (response.code === 0) {
      showToast("Cập nhật quy trình thành công", "success");
      handleClearForm(true);
      navigate(`/bpm/create/${formData.processId}`);
      localStorage.setItem("backUpUrlProcess", JSON.stringify({ processId: formData.processId }));
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
            // disabled: isSubmit || _.isEqual(formData, values) || validateFieldApproval,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, validateFieldApproval, formData, values, valueProcess]
  );

  const loadedOptionProcess = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      status: 1,
      limit: 10,
      opType: "EX", // lấy về ds quy trình mà đối tượng chưa trình, IN - quy trình đối tượng đã trình
    };

    const response = await BusinessProcessService.list(param);

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

  const handleChangeValueProcess = (e) => {
    setValueProcess(e);
    setFormData({ ...formData, processId: e.value });
    setValidateFieldProcess(false);
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-signer"
      >
        <form className="form-add-signer" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Trình xử lý`} toggle={() => !isSubmit && handleClearForm(false)} />
          <ModalBody>
            <div className="list-form-group">
              <div className="form-group">
                <SelectCustom
                  name="processId"
                  value={valueProcess}
                  label="Chọn quy trình xử lý"
                  fill={true}
                  required={true}
                  options={[]}
                  isAsyncPaginate={true}
                  additional={{
                    page: 1,
                  }}
                  loadOptionsPaginate={loadedOptionProcess}
                  placeholder="Chọn quy trình xử lý"
                  onChange={(e) => handleChangeValueProcess(e)}
                  error={validateFieldProcess}
                  message="Quy trình xử lý không được bỏ trống"
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
