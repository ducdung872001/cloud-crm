import React, { useEffect, useMemo, useState } from "react";
import { isDifferenceObj } from "reborn-util";
import { IAddContractStageProps } from "model/contractApproach/PropsModel";
import { IContractStageRequest } from "model/contractApproach/ContractStageRequestModel";
import Icon from "components/icon";
import Input from "components/input/input";
import Button from "components/button/button";
import NummericInput from "components/input/numericInput";
import ContractStageService from "services/ContractStageService";
import { showToast } from "utils/common";
import "./index.scss";

export default function AddStage(props: IAddContractStageProps) {
  const { data, onReload, infoPipeline } = props;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  //! validate    
  const [checkFieldName, setCheckFieldName] = useState<boolean>(false);
  const [checkFieldPosition, setCheckFieldPosition] = useState<boolean>(false);

  const values = useMemo(
    () =>
    ({
      pipelineId: infoPipeline?.idPipeline,
      name: data?.name ?? null,
      position: data?.position ?? null,
    } as IContractStageRequest),
    [data, infoPipeline]
  );

  const [formData, setFormData] = useState(values);

  //! xử lý field tên pha
  const handChangeName = (e) => {
    const value = e.target.value;
    console.log('name =>', value);

    setCheckFieldName(false);
    setFormData({ ...formData, name: value });
  };

  //! xử lý field vị trí
  const handChangePosition = (e) => {
    const value = e.value;

    setCheckFieldPosition(false);
    setFormData({ ...formData, position: value });
  };

  const onSubmit = async (e) => {
    e && e.preventDefault();
    setIsSubmit(true);

    const body: IContractStageRequest = {
      ...(formData as IContractStageRequest),
      ...(data ? { id: data.id } : {}),
    };  

    const response = await ContractStageService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} pha thành công`, "success");
      onReload(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  return (
    <form className="form__add--contract-stage" onSubmit={onSubmit}>
      <div className="list-form-group">
        <div className="form-group">
          <label htmlFor="name" className="label">
            Tên pha
          </label>
          <Input
            id="name"
            fill={true}
            required={true}
            value={formData?.name}
            onChange={(e) => handChangeName(e)}
            error={checkFieldName}
            placeholder="Tên pha"
          />
        </div>
        <div className="form-group">
          <label htmlFor="position" className="label">
            Thứ tự
          </label>
          <NummericInput
            id="position"
            fill={true}
            thousandSeparator={true}
            value={formData?.position}
            onValueChange={(e) => handChangePosition(e)}
            error={checkFieldPosition}
            placeholder="Thứ tự"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="btn__add--contract-stage"
        disabled={
          isSubmit ||
          checkFieldName ||
          !isDifferenceObj(formData, values)
        }
      >
        {data ? "Cập nhật" : "Thêm mới"}
        {isSubmit ? <Icon name="Loading" /> : null}
      </Button>
    </form>
  );
}
