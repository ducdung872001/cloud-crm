import React, { Fragment, useEffect, useMemo, useState } from "react";
import parser from "html-react-parser";
import _ from "lodash";
import { IAddCustomerSurveyProps } from "model/surveyForm/PropsModel";
import { ModalFooter } from "components/modal/modal";
import Icon from "components/icon";
import Input from "components/input/input";
import CheckboxList from "components/checkbox/checkboxList";
import RebornEditor from "components/editor/reborn";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import Button from "components/button/button";
import { IActionModal } from "model/OtherModel";
import { showToast } from "utils/common";
import { serialize } from "utils/editor";
import SurveyFormService from "services/SurveyFormService";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import "./AddCustomerSurvey.scss";

export default function AddCustomerSurvey(props: IAddCustomerSurveyProps) {
  const { onShow, onHide, dataProps } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [data, setData] = useState(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const handChangeDataProps = (data: any) => {
    if (!data) return;

    const changeData = {
      id: data.id,
      name: data.name,
      range: data.range.toString(),
      form: data.form,
      params: JSON.parse(data.params),
      link: data.link,
      cta: data.cta,
      shortLink: data.shortLink,
      startTime: data.startTime,
      endTime: data.endTime,
    };

    setData(changeData);
    setDesContent(data.cta);
  };

  useEffect(() => {
    if (onShow) {
      dataProps ? handChangeDataProps(dataProps) : setData(null);
    }
  }, [dataProps, onShow]);

  const defaultParam = { key: "", value: "" };

  const currentDomain = window.location.hostname;
  const protocol = window.location.protocol;

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        range: data?.range ?? "1",
        form: data?.form ?? "1",
        cta: data?.cta ?? "",
        params: data?.params ?? [defaultParam],
        link: `${protocol}//${currentDomain == "localhost" ? `${currentDomain}:4000` : currentDomain}/crm/link_survey?id=${data?.id}`,
        shortLink: data?.shortLink ?? "",
        startTime: data?.startTime ?? new Date(),
        endTime: data?.endTime ?? "",
      } as any),
    [onShow, data, currentDomain]
  );

  const [desContent, setDesContent] = useState<string>("");

  const [validateFormData, setValidateFormData] = useState({
    name: false,
    endTime: false,
    cta: false,
  });

  const [formData, setFormData] = useState(values);

  useEffect(() => {
    setFormData(values);
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  //! Thay đổi tên khảo sát
  const handleChangeValueName = (e) => {
    const value = e.target.value;
    oninput = () => {
      setValidateFormData({ ...validateFormData, name: false });
    };
    setFormData({ ...formData, name: value });
  };

  const handleBlurValueName = (e) => {
    const value = e.target.value;

    if (!value) {
      setValidateFormData({ ...validateFormData, name: true });
    }
  };

  //! Thay đổi thời gian bắt đầu
  const handleChangevalueStartTime = (e) => {
    const value = e;
    setFormData({ ...formData, startTime: value });
  };

  //! Thay đổi thời gian kết thúc
  const handleChangeValueEndTime = (e) => {
    const value = e;
    setValidateFormData({ ...validateFormData, endTime: false });
    setFormData({ ...formData, endTime: value });
  };

  const handleBlurValueEndTime = (e) => {
    const value = e.target.value;

    if (!value) {
      setValidateFormData({ ...validateFormData, endTime: true });
    }
  };

  //! Thay đổi nội dung
  const handleChangeValueCta = (e) => {
    const convertContent = serialize({ children: e });
    setValidateFormData({ ...validateFormData, cta: false });
    setDesContent(convertContent);
  };

  //! Thay đổi lựa chọn biểu tượng cảm xúc
  const handleChangeValueForm = (e) => {
    const value = e;
    const changeValue = value.split("");
    const result = changeValue[changeValue.length - 1];

    setFormData({ ...formData, form: result || "1" });
  };

  //! Thay đổi số lượng tùy chọn
  const handleChangeValueRange = (e) => {
    const value = e;
    const changeValue = value.split("");
    const result = changeValue[changeValue.length - 1];

    setFormData({ ...formData, range: result || "1" });
  };

  //! Thay đổi key tham số
  const handleChangeValueKey = (e, idx) => {
    const value = e.target.value;

    setFormData({
      ...formData,
      params: [...formData.params].map((item, index) => {
        if (index === idx) {
          return {
            ...item,
            key: value,
          };
        }

        return item;
      }),
    });
  };

  //! Thay đổi value tham số
  const handleChangeValueValue = (e, idx) => {
    const value = e.target.value;

    setFormData({
      ...formData,
      params: [...formData.params].map((item, index) => {
        if (index === idx) {
          return {
            ...item,
            value: value,
          };
        }

        return item;
      }),
    });
  };

  //! Xóa đi 1 tham số
  const handleDeleteParam = (idx) => {
    const newDataParams = [...formData.params];
    newDataParams.splice(idx, 1);

    setFormData({ ...formData, params: newDataParams });
  };

  //! Thay đổi link ngắn
  const handleChangeValueShortLink = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, shortLink: value });
  };

  //! copy link ngắn
  const handCopyShortLink = (link) => {
    if (!link) {
      showToast("Bạn chưa có link rút gọn", "warning");
      return;
    }

    navigator.clipboard
      .writeText(link)
      .then(() => {
        showToast("Copy link thành công", "success");
      })
      .catch(() => {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      });
  };

  //! copy link
  const handleCopyLink = (link: string) => {
    if (!link) {
      showToast("Bạn chưa có link", "warning");
      return;
    }

    const changeLink = link;

    navigator.clipboard
      .writeText(changeLink)
      .then(() => {
        showToast("Copy link thành công", "success");
      })
      .catch(() => {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      });
  };

  const handClearForm = () => {
    setFormData(values);
    setValidateFormData({
      name: false,
      endTime: false,
      cta: false,
    });
    setTimeout(() => {
      setDesContent("");
    }, 1000);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      setValidateFormData({ ...validateFormData, name: true });
      return;
    }

    if (!formData.endTime) {
      setValidateFormData({ ...validateFormData, endTime: true });
      return;
    }

    if (!desContent) {
      setValidateFormData({ ...validateFormData, cta: true });
      return;
    }

    if (desContent) {
      const htmlString = desContent;
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, "text/html");
      const textContent = doc.body.textContent || "";

      if (!textContent) {
        setValidateFormData({ ...validateFormData, cta: true });
        return;
      }
    }

    setIsSubmit(true);

    const newFormData = _.cloneDeep(formData);

    const result = {
      ...newFormData,
      params: JSON.stringify(formData.params),
      cta: desContent,
    };

    const body = {
      ...result,
      ...(data ? { id: data.id } : {}),
    };

    const response = await SurveyFormService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Cập nhật" : "Thêm mới"} khảo sát khách hàng thành công`, "success");
      onHide(true);
      handClearForm();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsSubmit(false);
  };

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${data ? "chỉnh sửa" : "thêm mới"} phiếu khảo sát`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        onHide(false);
        handClearForm();
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  useEffect(() => {
    if (!onShow) {
      handClearForm();
    }
  }, [onShow]);

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              // if (_.isEqual(formData, values)) {
              //   handClearForm();
              //   onHide(false)
              // } else {
              //   showDialogConfirmCancel();
              // }
              onHide(false);
              handClearForm();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            color: "primary",
            type: "submit",
            disabled: isSubmit || Object.values(validateFormData).filter((item) => item === true).length > 0,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, data, formData, values, validateFormData]
  );

  return (
    <div className="box__add--customer--survey">
      <form className="desc__form--survey" onSubmit={(e) => onSubmit(e)}>
        <div className="prev__view">
          <span className="note__prev--view">Xem trước</span>
          <div className="content__survey">{desContent ? parser(desContent) : <div className="draft__content">Nội dung khảo sát</div>}</div>
          <div className="emoticon__survey">
            {formData.form == "1" && (
              <div className="lst__emoticon">
                {formData.range == 1 &&
                  ["⭐", "⭐", "⭐"].map((item, key) => {
                    return (
                      <span key={key} className="item__emotion">
                        {item}
                      </span>
                    );
                  })}

                {formData.range == 2 &&
                  ["⭐", "⭐", "⭐", "⭐", "⭐"].map((item, key) => {
                    return (
                      <span key={key} className="item__emotion">
                        {item}
                      </span>
                    );
                  })}
              </div>
            )}

            {formData.form == "2" && (
              <div className="lst__emoticon">
                {formData.range == 1 &&
                  ["😞", "😊", "😄"].map((item, key) => {
                    return (
                      <span key={key} className="item__emotion">
                        {item}
                      </span>
                    );
                  })}

                {formData.range == 2 &&
                  ["😞", "😐", "🙂", "😊", "😄"].map((item, key) => {
                    return (
                      <span key={key} className="item__emotion">
                        {item}
                      </span>
                    );
                  })}
              </div>
            )}
          </div>
          <Button color="destroy" className="call__to--action">
            Gửi đánh giá
          </Button>
        </div>
        <div className="lst__form--group">
          <div className="form-group">
            <Input
              name="name"
              value={formData.name}
              label="Tên khảo sát"
              fill={true}
              required={true}
              onChange={(e) => handleChangeValueName(e)}
              onBlur={(e) => handleBlurValueName(e)}
              placeholder="Nhập tên khảo sát"
              error={validateFormData.name}
              message="Tên khảo sát không được bỏ trống"
            />
          </div>
          {/* Thời gian khảo sát */}
          <div className="time__survey">
            <div className="form-group">
              <DatePickerCustom
                name="startTime"
                value={formData.startTime}
                label="Thời gian bắt đầu"
                iconPosition="left"
                fill={true}
                required={true}
                icon={<Icon name="Calendar" />}
                placeholder="Ngày bắt đầu"
                onChange={(e) => handleChangevalueStartTime(e)}
                maxDate={data ? new Date(formData.endTime) : formData.endTime}
              />
            </div>
            <div className="form-group">
              <DatePickerCustom
                name="endTime"
                value={formData.endTime}
                label="Thời gian kết thúc"
                iconPosition="left"
                fill={true}
                required={true}
                icon={<Icon name="Calendar" />}
                placeholder="Ngày kết thúc"
                onChange={(e) => handleChangeValueEndTime(e)}
                onBlur={(e) => handleBlurValueEndTime(e)}
                minDate={data ? new Date(formData.startTime) : formData.startTime}
                error={validateFormData.endTime}
                message="Ngày kết thúc không được bỏ trống"
              />
            </div>
          </div>
          {/* Nội dung khảo sát */}
          <div className="form-group">
            <RebornEditor
              name="content"
              label={"Nội dung khảo sát"}
              required={true}
              fill={true}
              initialValue={data ? desContent : ""}
              onChangeContent={(e) => handleChangeValueCta(e)}
              error={validateFormData.cta}
              message="Nội dung khảo sát không được bỏ trống"
            />
          </div>

          {/* Lựa chọn các loại đánh giá */}
          <div className="choose__option--emoticon">
            <div className="form-group">
              <CheckboxList
                title={"Lựa chọn biểu tượng đánh giá"}
                options={[
                  {
                    value: "1",
                    label: "Biểu tượng sao (⭐)",
                  },
                  {
                    value: "2",
                    label: "Biểu tượng cảm xúc (😊)",
                  },
                ]}
                value={formData.form}
                onChange={(e) => handleChangeValueForm(e)}
                required={true}
              />
            </div>

            <div className="number__of__option">
              <div className="form-group">
                <CheckboxList
                  title={"Số lượng tùy chọn"}
                  options={[
                    {
                      value: "1",
                      label: "Ba tùy chọn",
                    },
                    {
                      value: "2",
                      label: "Năm tùy chọn",
                    },
                  ]}
                  value={formData.range}
                  onChange={(e) => handleChangeValueRange(e)}
                  required={true}
                />
              </div>
              <div className="view__option--icon">
                {formData.form == "1" && (
                  <div className="lst__emoticon">
                    {formData.range == 1 &&
                      ["⭐", "⭐", "⭐"].map((item, key) => {
                        return (
                          <span key={key} className="item__emotion">
                            {item}
                          </span>
                        );
                      })}

                    {formData.range == 2 &&
                      ["⭐", "⭐", "⭐", "⭐", "⭐"].map((item, key) => {
                        return (
                          <span key={key} className="item__emotion">
                            {item}
                          </span>
                        );
                      })}
                  </div>
                )}

                {formData.form == "2" && (
                  <div className="lst__emoticon">
                    {formData.range == 1 &&
                      ["😞", "😊", "😄"].map((item, key) => {
                        return (
                          <span key={key} className="item__emotion">
                            {item}
                          </span>
                        );
                      })}

                    {formData.range == 2 &&
                      ["😞", "😐", "🙂", "😊", "😄"].map((item, key) => {
                        return (
                          <span key={key} className="item__emotion">
                            {item}
                          </span>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* danh sách tham số*/}
          <div className="form-group">
            <span className="title__item title__params">Danh sách tham số</span>

            <div className="lst__params">
              {formData.params &&
                formData.params.map((item, idx) => {
                  return (
                    <div key={idx} className="item__params">
                      <div className="info--parmas">
                        <div className="form-group">
                          <Input name="key" value={item.key} fill={true} placeholder="Nhập key" onChange={(e) => handleChangeValueKey(e, idx)} />
                        </div>
                        <div className="form-group">
                          <Input
                            name="value"
                            value={item.value}
                            fill={true}
                            placeholder="Nhập value"
                            onChange={(e) => handleChangeValueValue(e, idx)}
                          />
                        </div>
                      </div>

                      <div className="action--params">
                        <span className="action-add" onClick={() => setFormData({ ...formData, params: [...formData.params, defaultParam] })}>
                          <Icon name="PlusCircleFill" />
                        </span>

                        {formData.params.length > 1 && (
                          <span className="action-delete" onClick={() => handleDeleteParam(idx)}>
                            <Icon name="Trash" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Tạo link ngắn*/}
          <div className="box__link">
            <div className="form-group">
              <Input
                type="link"
                label={"Link đầy đủ"}
                value={data ? formData.link : ""}
                fill={true}
                disabled={true}
                icon={<Icon name="Copy" />}
                iconPosition="left"
                iconClickEvent={() => handleCopyLink(formData.link)}
              />
            </div>
            <span className="icon__connect">
              <Icon name="Link" />
            </span>
            <div className="form-group">
              <Input
                type="link"
                label={"Link rút gọn"}
                value={formData.shortLink}
                fill={true}
                onChange={(e) => handleChangeValueShortLink(e)}
                icon={<Icon name="Copy" />}
                iconPosition="left"
                iconClickEvent={() => handCopyShortLink(formData.shortLink)}
                placeholder="Nhập link rút gọn"
              />
            </div>
          </div>
        </div>
        <ModalFooter actions={actions} />
      </form>

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
