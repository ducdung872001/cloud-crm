import React, { Fragment, useEffect, useMemo, useState } from "react";
import Tippy from "@tippyjs/react";
import { formatCurrency } from "reborn-util";
import { IActionModal } from "model/OtherModel";
import Icon from "components/icon";
import SelectCustom from "components/selectCustom/selectCustom";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import DepartmentService from "services/DepartmentService";
import { showToast } from "utils/common";

import "./index.scss";

interface IChooseDepartmentProps {
  onShow: boolean;
  onHide: () => void;
  takeValue: (data: any) => void;
}

export default function ChooseDepartment(props: IChooseDepartmentProps) {
  const { onShow, onHide, takeValue } = props;

  const [lstDepartment, setLstDepartment] = useState([]);
  const [dataDepartment, setDataDepartment] = useState(null);
  const [lstCosts, setLstCosts] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataResultCosts, setDataResultCosts] = useState([]);
  const [lstJob, setLstJob] = useState([]);
  const [isLoadingCost, setIsLoadingCost] = useState<boolean>(true);

  const handleClearForm = () => {
    onHide();
    setLstDepartment([]);
    setLstCosts([]);
    setDataResultCosts([]);
    setLstJob([]);
    setIsLoadingCost(true);
    setDataDepartment(null);
  };

  const onSelectOpenDepartment = async () => {
    setIsLoading(true);

    const response = await DepartmentService.list();

    if (response.code === 0) {
      const result = response.result;
      const changeResult = result.map((item) => {
        return {
          label: item.name,
          value: item.id,
        };
      });
      setLstDepartment(changeResult);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  const handGetDetailDepartment = async (id: number) => {
    const response = await DepartmentService.detail(id);

    if (response.code === 0) {
      const result = response.result.jobTitles;
      setLstJob(result);
    }
  };

  const handTakeCosts = async (id: number) => {
    setIsLoadingCost(true);

    const param = {
      id,
    };

    const response = await DepartmentService.lstCost(param);

    if (response.code === 0) {
      const result = JSON.parse(response.result || "[]");
      setDataResultCosts(result);
    }
    setIsLoadingCost(false);
  };

  useEffect(() => {
    if (dataResultCosts && dataResultCosts.length > 0 && lstJob && lstJob.length > 0) {
      const cloneDataResultCosts = [...dataResultCosts];

      cloneDataResultCosts.forEach((item) => {
        const matchingItem = lstJob.find((el) => el.id === item.jteId);

        if (matchingItem) {
          item.name = matchingItem.title;
        }
      });

      setLstCosts(cloneDataResultCosts);
      setIsLoadingCost(false);
    }
  }, [dataResultCosts, lstJob]);

  const handleChangeValueDepartment = (e) => {
    setLstCosts([]);
    setDataDepartment(e);
    handTakeCosts(e.value);
    handGetDetailDepartment(e.value);
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
              handleClearForm();
            },
          },
        ],
      },
    }),
    []
  );

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide()} className="modal__choose--department">
        <div className="box__choose--department">
          <ModalHeader title="Chọn phòng ban" toggle={() => handleClearForm()} />
          <ModalBody>
            <div className="lst__department">
              <div className="form-group">
                <SelectCustom
                  name="department"
                  label="Chọn phòng ban"
                  placeholder="Chọn phòng ban"
                  options={lstDepartment}
                  fill={true}
                  value={dataDepartment}
                  special={true}
                  onChange={(e) => handleChangeValueDepartment(e)}
                  onMenuOpen={onSelectOpenDepartment}
                  isLoading={isLoading}
                />
              </div>

              {lstCosts && lstCosts.length > 0 ? (
                <Fragment>
                  <span className="name__unit--department">{`Đơn giá ${dataDepartment && dataDepartment.label.toLowerCase()}`}</span>
                  <div className="lst__costs">
                    {lstCosts.map((el, ids) => {
                      return (
                        <div key={ids} className="item--cost">
                          <span className="name-cost">{el.jteId === 0 ? "Đơn giá trung bình" : el.name}</span>
                          <div className="value-mm">
                            <span className="desc-value">{formatCurrency(el.mm)}</span>
                            <Tippy content="Chọn">
                              <span
                                className="icon__take"
                                onClick={() => {
                                  takeValue(el.mm);
                                  handleClearForm();
                                }}
                              >
                                <Icon name="FingerTouch" />
                              </span>
                            </Tippy>
                          </div>
                          <div className="value-md">
                            <span className="desc-value">{formatCurrency(el.md)}</span>
                            <Tippy content="Chọn">
                              <span
                                className="icon__take"
                                onClick={() => {
                                  takeValue(el.mm);
                                  handleClearForm();
                                }}
                              >
                                <Icon name="FingerTouch" />
                              </span>
                            </Tippy>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Fragment>
              ) : (
                !isLoadingCost &&
                lstCosts.length == 0 && (
                  <Fragment>
                    <span className="name__unit--department">{`Đơn giá ${dataDepartment && dataDepartment.label.toLowerCase()}`}</span>
                    <div className="emty__item--cost">Chưa có dữ liệu</div>
                  </Fragment>
                )
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
    </Fragment>
  );
}
