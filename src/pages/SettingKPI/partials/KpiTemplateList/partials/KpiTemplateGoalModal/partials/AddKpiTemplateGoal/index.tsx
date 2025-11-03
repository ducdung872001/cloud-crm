import React, { useEffect, useMemo, useState, useRef } from "react";
import { isDifferenceObj } from "reborn-util";
import { IKpiTemplateGoalModalProps } from "model/kpiTemplateGoal/PropsModel";
import { IKpiTemplateGoalRequest } from "model/kpiTemplateGoal/KpiTemplateGoalRequestModel";
import { IKpiGoalFilterRequest } from "model/kpiGoal/KpiGoalRequestModel";
import Icon from "components/icon";
import Button from "components/button/button";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import ImageThirdGender from "assets/images/third-gender.png";
import KpiTemplateGoalService from "services/KpiTemplateGoalService";
import KpiGoalService from "services/KpiGoalService";
import { showToast } from "utils/common";

import "./index.scss";

interface IDataEmployees {
  employee: {
    value: number;
    label: string;
    avatar: string;
  };
  rank: {
    value: number;
    label: string;
  };
}

/**
 * Thêm định nghĩa ngưỡng KPI
 * @param props 
 * @returns 
 */
export default function AddKpiTemplateGoal(props: IKpiTemplateGoalModalProps) {
  const { data, onReload, infoKpiTemplate } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [dataGoal, setDataGoal] = useState(null);

  //! validate
  const [checkFieldGoal, setCheckFieldGoal] = useState<boolean>(false);
  const [validateThreshold, setValidateThreshold] = useState<boolean>(false);
  const [validateWeight, setValidateWeight] = useState<boolean>(false);

  const values = useMemo(
    () =>
    ({
      templateId: infoKpiTemplate?.idTemplate,
      goalId: data?.goalId ?? null,
      threshold: data?.threshold ?? null,
      weight: data?.weight ?? null
    } as IKpiTemplateGoalRequest),
    [data, infoKpiTemplate]
  );

  const [formData, setFormData] = useState(values);

  //! đoạn này xử lý chỉ tiêu KPI
  const handleChangeValueGoal = (e) => {
    setDataGoal(e);
    setFormData({ ...formData, goalId: e.value });
  };

  const loadedOptionGoal = async (search, loadedOptions, { page }) => {
    const param: IKpiGoalFilterRequest = {
      name: search,
      page: page,
      limit: 100,
    };

    const response = await KpiGoalService.list(param);

    if (response.code === 0) {
      const dataOption = response.result?.items || [];

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
              return {
                value: item.id,
                label: item.name
              };
            })
            : []),
        ],
        hasMore: false,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  //! đoạn này xử lý vấn đề cập nhật chỉ số KPI
  const getDetailKpiGoal = async () => {
    const response = await KpiGoalService.detail(data?.goalId);

    if (response.code === 0) {
      const result = response.result;

      setDataGoal({ value: result.id, label: result.name });
    }
  };

  useEffect(() => {
    if (data?.goalId) {
      getDetailKpiGoal();
    }
  }, [data?.goalId]);

  const onSubmit = async (e) => {
    e && e.preventDefault();

    if (!formData?.threshold) {
      setValidateThreshold(true);
      return;
    }

    setIsSubmit(true);

    const body: IKpiTemplateGoalRequest = {
      ...(formData as IKpiTemplateGoalRequest),
      ...(data ? { id: data.id } : {})
    };

    const response = await KpiTemplateGoalService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} ngưỡng thành công`, "success");
      onReload(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  const handleChangeValueThreshold = (e) => {
    oninput = () => {
      setValidateThreshold(false);
    };
    const value = e.floatValue;
    setFormData({ ...formData, ...({ threshold: +value }) });
  };

  const handleChangeValueWeight = (e) => {
    oninput = () => {
      setValidateThreshold(false);
    };
    const value = e.value;
    setFormData({ ...formData, ...({ weight: +value }) });
  };

  return (
    <form className="form__add--kpi-template-goal" onSubmit={onSubmit}>
      <div className="list-form-group">
        <div className="form-group">
          <SelectCustom
            fill={true}
            id="goalId"
            name="goalId"
            label="Chỉ tiêu KPI"
            options={[]}
            isAsyncPaginate={true}
            isFormatOptionLabel={true}
            placeholder="Chọn chỉ tiêu KPI"
            additional={{
              page: 1,
            }}
            value={dataGoal}
            onChange={(e) => handleChangeValueGoal(e)}
            loadOptionsPaginate={loadedOptionGoal}
            error={checkFieldGoal}
          />
        </div>
        <div className="form-group">
          <div className="wrapper__workload">
            <NummericInput
              id="threshold"
              name="threshold"
              label="KPI mục tiêu"
              value={formData?.threshold}
              fill={true}
              placeholder="Nhập KPI mục tiêu"
              required={true}
              isDecimalScale={false}
              onValueChange={(e) => handleChangeValueThreshold(e)}
            />
          </div>
        </div>
        <div className="form-group">
          <div className="wrapper__workload">
            <NummericInput
              id="weight"
              name="weight"
              label="Trọng số KPI"
              value={formData?.weight}
              fill={true}
              placeholder="Nhập trọng số KPI"
              required={true}
              onValueChange={(e) => handleChangeValueWeight(e)}
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="btn__add--kpi-template-goal"
        disabled={
          isSubmit ||
          checkFieldGoal ||
          validateThreshold ||
          validateWeight ||
          !isDifferenceObj(formData, values)
        }
      >
        {data ? "Cập nhật" : "Thêm mới"}
        {isSubmit ? <Icon name="Loading" /> : null}
      </Button>
    </form>
  );
}
