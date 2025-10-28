import React, { Fragment, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import SelectCustom from "components/selectCustom/selectCustom";
import NummericInput from "components/input/numericInput";
import Input from "components/input/input";
import Icon from "components/icon";
import Loading from "components/loading";
import { IActionModal } from "model/OtherModel";
import DepartmentService from "services/DepartmentService";
import { showToast } from "utils/common";

import "./AddUnitPriceDepartmentModal.scss";

interface IAddUnitPriceDepartmentModalProps {
  onShow: boolean;
  onHide: (reload) => void;
  idDepartment: number;
}

export default function AddUnitPriceDepartmentModal(props: IAddUnitPriceDepartmentModalProps) {
  const { onShow, onHide, idDepartment } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [lstJob, setLstJob] = useState([]);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handGetDepartment = async (id: number) => {
    if (!id) return;

    const response = await DepartmentService.detail(id);

    if (response.code === 0) {
      const result = response.result.jobTitles;
      const changeResult = [...result].map((item) => {
        return {
          label: item.title,
          value: item.id,
        };
      });

      setLstJob(changeResult);
    } else {
      showToast("Chi tiết phòng ban lỗi. Vui lòng thử lại sau", "error");
    }
  };

  const handGetUnitPriceDepartment = async (idDepartment: any) => {
    setIsLoading(true);

    const params = {
      id: idDepartment,
    };

    const response = await DepartmentService.lstCost(params);

    if (response.code === 0) {
      const result = JSON.parse(response.result || "[]");
      setData(result);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (onShow && idDepartment) {
      handGetDepartment(idDepartment);
      handGetUnitPriceDepartment(idDepartment);
    }
  }, [onShow, idDepartment]);

  const defaultCost = {
    jteId: 0,
    mm: null,
    md: null,
  };

  const values = useMemo(
    () =>
      ({
        costs: data && data.length > 0 ? data : [defaultCost],
      } as any),
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

  const handleChangeJob = (e, idx) => {
    const value = e.value;

    setFormData({
      ...formData,
      costs: [...formData.costs].map((item, ids) => {
        if (ids === idx) {
          return {
            ...item,
            jteId: value,
          };
        }

        return item;
      }),
    });
  };

  const handleChangeValueMM = (e, idx) => {
    const value = e.floatValue;

    setFormData({
      ...formData,
      costs: [...formData.costs].map((item, ids) => {
        if (ids === idx) {
          return {
            ...item,
            mm: value,
          };
        }

        return item;
      }),
    });
  };

  const handleChangeValueMD = (e, idx) => {
    const value = e.floatValue;

    setFormData({
      ...formData,
      costs: [...formData.costs].map((item, ids) => {
        if (ids === idx) {
          return {
            ...item,
            md: value,
          };
        }

        return item;
      }),
    });
  };

  const handleAddCost = () => {
    const newDataCost = {
      jteId: null,
      mm: null,
      md: null,
    };

    setFormData({ ...formData, costs: [...formData.costs, newDataCost] });
  };

  const handleDeleteCost = (idx: number) => {
    const cloneDataCosts = [...formData.costs];
    cloneDataCosts.splice(idx, 1);

    setFormData({ ...formData, costs: cloneDataCosts });
  };

  const handleClearForm = (acc) => {
    onHide(acc);
    setLstJob([]);
    setData(null);
    setFormData(values);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    setIsSubmit(true);

    const changeFormData = {
      id: idDepartment,
      costs: JSON.stringify(formData.costs),
    };

    const response = await DepartmentService.updateCost(changeFormData);

    if (response.code === 0) {
      showToast("Thêm mới đơn giá thành công", "success");
      handleClearForm(true);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
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
              onHide(false);
            },
          },
          {
            title: "Tạo mới đơn giá",
            type: "submit",
            color: "primary",
            disabled: isSubmit || _.isEqual(formData, values),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-add-unit-price"
        size="lg"
      >
        <form className="form-unit-price-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`Thêm mới đơn giá`} toggle={() => !isSubmit && handleClearForm(false)} />
          <ModalBody>
            <div className="lst__costs">
              {!isLoading &&
                formData &&
                formData.costs &&
                formData.costs.map((item, idx) => {
                  const filterLstJob = lstJob.filter((el) => {
                    return !formData.costs.some((ul) => ul.jteId === el.value);
                  });
                  return (
                    <div key={idx} className="item--cost">
                      <div className="info__cost">
                        <div className="form-group">
                          {idx === 0 ? (
                            <Input name="name" value={item.jteId === 0 ? "Đơn giá trung bình" : ""} fill={true} disabled={true} />
                          ) : (
                            <SelectCustom
                              name="role"
                              special={true}
                              value={lstJob.find((ol) => ol.value === item.jteId)}
                              fill={true}
                              options={filterLstJob}
                              placeholder="Chọn vị trí"
                              onChange={(e) => handleChangeJob(e, idx)}
                            />
                          )}
                        </div>

                        <div className="form-group">
                          <NummericInput
                            name="mm"
                            value={item.mm || ""}
                            fill={true}
                            thousandSeparator={true}
                            onValueChange={(e) => handleChangeValueMM(e, idx)}
                            placeholder="Nhập đơn giá theo tháng"
                          />
                        </div>

                        <div className="form-group">
                          <NummericInput
                            name="mm"
                            value={item.md || ""}
                            fill={true}
                            thousandSeparator={true}
                            onValueChange={(e) => handleChangeValueMD(e, idx)}
                            placeholder="Nhập đơn giá theo ngày"
                          />
                        </div>
                      </div>

                      <div className="action__cost">
                        <div className="add-cost" onClick={() => handleAddCost()}>
                          <Icon name="PlusCircleFill" />
                        </div>

                        {idx !== 0 && (
                          <div className="delete-cost" onClick={() => handleDeleteCost(idx)}>
                            <Icon name="Trash" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

              {isLoading && <Loading />}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
    </Fragment>
  );
}
