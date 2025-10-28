import React, { useEffect, useMemo, useState } from "react";
import { isDifferenceObj } from "reborn-util";
import { IAddContactStatusProps } from "model/contactStatus/PropsModel";
import { IContactStatusRequest } from "model/contactStatus/ContactStatusRequestModel";
import Icon from "components/icon";
import Input from "components/input/input";
import Button from "components/button/button";
import NummericInput from "components/input/numericInput";
import ContactStatusService from "services/ContactStatusService";
import { showToast } from "utils/common";
import "./index.scss";

export default function AddStage(props: IAddContactStatusProps) {
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
    } as IContactStatusRequest),
    [data, infoPipeline]
  );

  const [formData, setFormData] = useState(values);

  //! xử lý field tên trạng thái
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

    const body: IContactStatusRequest = {
      ...(formData as IContactStatusRequest),
      ...(data ? { id: data.id } : {}),
    };  

    const response = await ContactStatusService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} trạng thái thành công`, "success");
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
          <Input            
            id="name"
            label={"Tên trạng thái"}
            fill={true}
            required={true}
            value={formData?.name}
            onChange={(e) => handChangeName(e)}
            error={checkFieldName}
            placeholder="Tên trạng thái"            
          />
        </div>
        <div className="form-group">              
          <NummericInput
            id="position"
            label={"Thứ tự"}
            fill={true}
            thousandSeparator={true}
            value={formData?.position}
            onValueChange={(e) => handChangePosition(e)}
            error={checkFieldPosition}
            placeholder="Thứ tự"
            required={false}
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
