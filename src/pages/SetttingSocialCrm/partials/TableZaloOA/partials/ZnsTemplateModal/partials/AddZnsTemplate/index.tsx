import React, { useEffect, useMemo, useState } from "react";
import { isDifferenceObj } from "reborn-util";
import { IAddZnsTemplateProps } from "model/znsTemplate/PropsModel";
import { IZnsTemplateRequest } from "model/znsTemplate/ZnsTemplateRequestModel";
import Icon from "components/icon";
import Input from "components/input/input";
import Button from "components/button/button";
import NummericInput from "components/input/numericInput";
import ZnsTemplateService from "services/ZnsTemplateService";
import { showToast } from "utils/common";
import "./index.scss";

export default function AddZnsTemplate(props: IAddZnsTemplateProps) {
  const { data, onReload, zaloOa } = props;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);   

  useEffect(() => {
    console.log('Co vao');
  })

  const onSubmit = async (e) => {
    e && e.preventDefault();
    setIsSubmit(true);        

    const response = await ZnsTemplateService.updateSync(zaloOa.oaId);

    if (response.code === 0) {
      showToast(`Tải mới mẫu Zalo ZNS thành công`, "success");
      onReload(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
  };

  return (
    <form className="form__add--contract-stage" onSubmit={onSubmit}>      
      <Button
        type="submit"
        className="btn__add--contract-stage"        
      >
        Tải mới
        {isSubmit ? <Icon name="Loading" /> : null}
      </Button>
    </form>
  );
}
