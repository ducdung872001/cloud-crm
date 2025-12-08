import React, { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import { capitalize, isDifferenceObj, removeHtmlTags } from "reborn-util";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { IAddChangeProbabilityModelProps } from "model/campaignOpportunity/PropsModel";
import { IOpportunityProcessUpdateRequestModel } from "model/campaignOpportunity/CampaignOpportunityRequestModel";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useActiveElement } from "utils/hookCustom";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import CampaignService from "services/CampaignService";
import CampaignOpportunityService from "services/CampaignOpportunityService";
import "./SendEmailModal.scss";
import { ICampaignApproachFilterRequest } from "model/campaignApproach/CampaignApproachRequestModel";
import CampaignApproachService from "services/CampaignApproachService";
import Input from "components/input/input";
import { IConfigCodeResponseModel } from "model/configCode/ConfigCodeResponse";
import ConfigCodeService from "services/ConfigCodeService";
import RebornEditor from "components/editor/reborn";
import { serialize } from "utils/editor";
import Checkbox from "components/checkbox/checkbox";
import EmailConfigService from "services/EmailConfigService";
import CustomScrollbar from "components/customScrollbar";
import Image from "components/image";
import AvatarFemale from "assets/images/avatar-female.jpg";
import AvatarMale from "assets/images/avatar-male.jpg";
import Icon from "components/icon";
import CustomerService from "services/CustomerService";
import _ from "lodash";
import { validateIsEmpty } from "reborn-validation";
import AddTemplateEmailModal from "pages/Common/AddEditSendEmail/partials/AddTemplateEmailModal";
import ViewTemplateEmailModal from "pages/Common/AddEditSendEmail/partials/ViewTemplateEmailModal";
import ChooseSurvey from "./partials/ChooseSurvey";
import PlaceholderService from "services/PlaceholderService";
import SelectCustom from "components/selectCustom/selectCustom";

export default function SendEmailModal(props: any) {
  const { onShow, onHide, idCampaign, idCoy, data, customerIdlist } = props;

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const values = useMemo(
    () =>
      ({
        campaignId: idCampaign,
        // customerId: data?.customerId ?? 0,
        customers: [],
        title: data?.title ?? "",
        content: data?.content ?? "",
        templateId: data?.templateId ?? null,
        emailId: data?.emailId ?? 0,
        isTracked: data?.isTracked ?? 1,
        voc: false,
        // coyId: idCoy
      } as any),
    [onShow, data, idCampaign, idCoy]
  );

  const validations: IValidation[] = [];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  // biến này tạo ra với mục đích hiển thị những khách hàng nhận email
  const [filterUser, setFilterUser] = useState([]);

  // đoạn này bật modal chọn mẫu
  const [showModalAddTemplateEmail, setShowModalAddTemplateEmail] = useState<boolean>(false);
  const [showModalViewTemplateEmail, setShowModalViewTemplateEmail] = useState<boolean>(false);

  // biến này tạo ra với mục đích thay đổi tiêu đề email
  const [titleEmail, setTitleEmail] = useState<string>("");

  //! biến này tạo ra với mục đích validate tiêu đề email
  const [errorTitleEmail, setErrorTitleEmail] = useState<boolean>(false);

  //! lấy mã code email fill vào nội dung
  const [dataCodeEmail, setDataCodeEmail] = useState<string>("");

  //! lấy nội dung email
  const [contentEmail, setContentEmail] = useState<string>("");

  /**
   * Xử lý khi lựa chọn mẫu email
   * @param item
   */
  const loadTemplateEmail = async (item) => {
    if (item) {
      setTitleEmail(item.title);
      setErrorTitleEmail(false);

      setFormData({ ...formData, values: { ...formData.values, title: item.title } });
      setContentEmail(item.content);
    }
  };

  /**
   * Lưu lại mẫu
   * @param e
   * @returns
   */
  const saveTemplate = async (e) => {
    e && e.preventDefault();

    //Validate thủ công
    if (validateIsEmpty(titleEmail)) {
      showToast("Vui lòng nhập Tiêu đề Email", "error");
      return;
    }

    //Validate nội dung
    if (validateIsEmpty(removeHtmlTags(contentEmail))) {
      showToast("Vui lòng nhập Nội dung Email", "error");
      return;
    }

    //Ok thì hiển thị popup ...
    setShowModalAddTemplateEmail(true);
  };

  //? đoạn này sử xử lý thay đổi giá trị tiêu đề email
  const handleChangeValueTitleEmail = (e) => {
    const value = e.target.value;
    oninput = () => {
      setErrorTitleEmail(false);
    };
    setTitleEmail(value);
    setFormData({ ...formData, values: { ...formData.values, title: value } });
  };

  //! đoạn này xử lý validate form khi chưa nhập title
  const handleChangeBlueTitleEmail = (e) => {
    const value = e.target.value;

    if (value.length === 0) {
      setErrorTitleEmail(true);
    }
  };

  // //? Danh sách code email
  // const [listCodeEmail, setListCodeEmail] = useState<IConfigCodeResponseModel[]>([]);
  // const [isLoadingCodeEmail, setIsLoadingCodeEmail] = useState<boolean>(false);

  // //! Call API code email
  // const getListCodeEmail = async () => {
  //   setIsLoadingCodeEmail(true);

  //   const param = {
  //     type: 2,
  //   };

  //   const response = await ConfigCodeService.list(param);

  //   if (response.code === 0) {
  //     const result = response.result.items;
  //     setListCodeEmail(result);
  //   } else {
  //     showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
  //   }

  //   setIsLoadingCodeEmail(false);
  // };

  // useEffect(() => {
  //   if (onShow) {
  //     getListCodeEmail();
  //   }
  // }, [onShow]);

  // đoạn này lấy mã email
  const handlePointerContent = (data) => {
    const value = data.code;
    setDataCodeEmail(value);
  };

  //! đoạn này thay đổi giá trị văn bản
  const handleChangeContentEmail = (dataConent) => {
    const convertContent = serialize({ children: dataConent });
    setContentEmail(convertContent);
    setValidateContentEmail(false);
    // setFormData({ ...formData, values: { ...formData?.values, content: convertContent } });
  };

  //? biến này tạo ra với mục đích lựa chọn theo dõi email
  const [isCheckTrackEmail, setIsCheckTrackEmail] = useState<boolean>(true);

  //! đoạn này sử lý theo dõi đọc email
  const handleChangeValueMemo = (e) => {
    if (e) {
      setIsCheckTrackEmail(e);
      setFormData({ ...formData, values: { ...formData?.values, isTracked: 1 } });
    } else {
      setIsCheckTrackEmail(e);
      setFormData({ ...formData, values: { ...formData?.values, isTracked: 0 } });
    }
  };

  //? biến này tạo ra với mục đích lựa chọn gửi đi cho đối tượng nào
  const [isChooseSend, setIsChooseSend] = useState<boolean>(true);

  //? biến này tạo ra với mục đích lựa chọn gửi đi tất cả
  const [isAll, setIsAll] = useState<boolean>(true);

  //? biến này tạo ra với mục đích lựa chọn ngẫu nhiên
  const [isRandom, setIsRandom] = useState<boolean>(false);

  //? Danh sách email nguồn
  const [listSourceEmail, setListSourceEmail] = useState<IOption[]>([]);
  const [listIdSourceEmail, setListIdSourceEmail] = useState<number[]>([]);

  const getListSourceEmail = async () => {
    const param = {
      limit: 100,
    };

    const response = await EmailConfigService.list(param);

    if (response.code === 0) {
      const result = response.result;

      const dataOption = (result || []).map((item) => {
        return {
          value: item.id,
          label: item.email,
        };
      });

      setListSourceEmail(dataOption);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (onShow) {
      getListSourceEmail();
    }
  }, [onShow]);

  useEffect(() => {
    if (!data) {
      setIsAll(true);
      setIsRandom(false);
      setListIdSourceEmail(listSourceEmail.map((item) => +item.value));
    }
  }, [data, listSourceEmail]);

  //! đoạn này xử lý thay đổi giá trị email gửi đi
  const handleChangeValueChooseSend = (e) => {
    setIsChooseSend(e);

    if (!e) {
      setListIdSourceEmail([0]);
    }
  };

  //! đoạn này xử lý lựa chọn tất cả
  const handleChangeCheckAllSourceEmail = (isChecked: boolean) => {
    setIsAll(!isAll);
    setIsRandom(false);

    if (isChecked) {
      setListIdSourceEmail(
        listSourceEmail.map((item) => {
          return +item.value;
        })
      );
    } else {
      setListIdSourceEmail([]);
    }
  };

  //! đoạn này xử lý lựa chọn 1 đối tượng gửi email cụ thể
  const handleChangeCheckOneSourceEmail = (id: number, isChecked: boolean) => {
    if (isChecked) {
      setListIdSourceEmail([...(listIdSourceEmail ?? []), id]);
      setIsRandom(false);
      setIsAll(false);
    } else {
      setListIdSourceEmail(listIdSourceEmail.filter((i) => i !== id) ?? []);
      setIsRandom(false);
      setIsAll(false);
    }
  };

  //! đoạn này xử lý lựa chọn ngẫu nhiên
  const handleChangeCheckRandomChoose = (isChecked: boolean) => {
    setIsRandom(!isRandom);
    setIsAll(false);

    if (isChecked) {
      setListIdSourceEmail([0]);
    }
  };

  const detailCustomerUpdate = async (takeIdCustomer: number[]) => {
    if (takeIdCustomer.length <= 0) return;

    const param: any = {
      lstId: takeIdCustomer.join(","),
      page: 1,
      limit: 1000,
    };

    const response = await CustomerService.listById(param);

    if (response.code === 0) {
      const result = response.result;
      //   setIsLoadMoreAble(result?.loadMoreAble);

      //   const newDataCustomer = pageCustomer == 1 ? [] : filterUser;
      const newDataCustomer = [];

      (result.items || []).map((item) => {
        newDataCustomer.unshift(item);
      });

      const convertData = newDataCustomer.map((item: any) => {
        return {
          id: item.id,
          avatar: item.avatar,
          name: item.name,
          gender: item.gender,
        };
      });
      setFilterUser(convertData);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    // setIsLoadingCustomer(false);
  };

  useEffect(() => {
    if (customerIdlist && customerIdlist.length > 0) {
      const listCustomerHasEmail = customerIdlist.map((item) => {
        return item.id;
      });
      const takeIdCustomer = listCustomerHasEmail || [];
      detailCustomerUpdate(takeIdCustomer);
    }
  }, [onShow, customerIdlist]);

  const [showModalChooseSurvey, setShowModalChooseSurvey] = useState<boolean>(false);
  const [validateContentEmail, setValidateContentEmail] = useState<boolean>(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    // const errors = Validate(validations, formData);

    // if (Object.keys(errors).length > 0) {
    //     setFormData((prevState) => ({ ...prevState, errors: errors }));
    //     return;
    // }

    if (contentEmail && formData?.values?.voc) {
      const inputString = contentEmail;
      const checkLink = "/crm/link_survey";

      if (!inputString.includes(checkLink)) {
        setValidateContentEmail(true);
        return;
      }
    }

    setIsSubmit(true);
    const newFormData = _.cloneDeep(formData.values);
    const newCustomerList = customerIdlist.map((item) => {
      return { id: item.id, coyId: item.coyId, approachId: item.approachId };
    });
    const body = {
      ...newFormData,
      customers: newCustomerList,
      content: contentEmail,
      emailId: listIdSourceEmail[0],
    };

    console.log("body", body);

    const response = await CampaignOpportunityService.sendEmail(body);

    if (response.code === 0) {
      showToast("Gửi Email thành công", "success");
      onHide(true);
      setTitleEmail("");
      setDataCodeEmail("");
      setListIdSourceEmail([]);
      setTimeout(() => {
        setContentEmail("");
      }, 1000);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
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
              !isDifferenceObj(formData.values, values) ? onHide(false) : showDialogConfirmCancel();
            },
          },
          {
            title: "Xác nhận",
            type: "submit",
            color: "primary",
            disabled: isSubmit || validateContentEmail,
            //   || (!isDifferenceObj(formData.values, values) && formData.values?.status !== '4' && !percentProp)
            //   || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, formData, validateContentEmail]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        onHide(false);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const clearForm = () => {
    onHide(false);
    setFilterUser([]);
    setTitleEmail("");
    setDataCodeEmail("");
    setListIdSourceEmail([]);
    setTimeout(() => {
      setContentEmail("");
    }, 1000);
  };

  const [listApproach, setListApproach] = useState<any>([
    {
      value: "customer",
      label: "Khách hàng",
      color: "#9966CC",
      isActive: true,
      listPlaceholder: [],
    },
    // {
    //   value: "contact",
    //   label: "Người liên hệ",
    //   color: "#6A5ACD",
    //   isActive: false,
    //   listPlaceholder: [],
    // },
    // {
    //   value: "contract",
    //   label: "Hợp đồng",
    //   color: "#007FFF",
    //   isActive: false,
    //   listPlaceholder: [],
    // },
    // {
    //   value: "guarantee",
    //   label: "Bảo lãnh",
    //   color: "#ED6665",
    //   isActive: false,
    //   listPlaceholder: [],
    // },
  ]);

  const [placeholder, setPlaceholder] = useState<any>(listApproach[0]);

  useEffect(() => {
    for (let i = 0; i < listApproach.length; i++) {
      const element = listApproach[i];
      if (element.value == placeholder.value) {
        setPlaceholder(element);
      }
    }
  }, [listApproach]);

  const getListplaceholderCustomer = async () => {
    const param = {};
    const response = await PlaceholderService.customer(param);

    if (response.code === 0) {
      const result = response.result.items;
      const newListplaceholderCustomer = result.map((item) => ({
        code: "{{" + item.name + "}}",
        name: item.title,
      }));

      setListApproach(
        listApproach.map((item) => ({
          ...item,
          listPlaceholder:
            item.value == "customer"
              ? newListplaceholderCustomer.map((item) => ({ value: item.code, label: item.name, code: item.code }))
              : item.listPlaceholder,
        }))
      );
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const fetchPlaceholder = async () => {
    if (placeholder.value == "customer") {
      await getListplaceholderCustomer();
    }
    // else if (placeholder.value == "contact") {
    //   await getListplaceholderContact();
    // } else if (placeholder.value == "contract") {
    //   await getListplaceholderContract();
    // } else if (placeholder.value == "guarantee") {
    //   await getListplaceholderGuarantee();
    // }
  };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && clearForm()}
        className="modal-send-email-campaign"
        size="xl"
      >
        <form className="form-send-email-campaign" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title="Gửi Email" toggle={() => !isSubmit && clearForm()} />
          <ModalBody>
            <div className="wrapper-send-email">
              <div className="list-customer">
                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: "600" }}>Gửi đến khách hàng</span>
                </div>
                <div className="container-list-customer">
                  {filterUser.length > 0 ? (
                    filterUser.map((item, index) => (
                      <div key={index} className="wrapper-user">
                        <div className="info-user">
                          {item.avatar === "" ? (
                            <Image src={item.gender == 2 ? AvatarMale : AvatarFemale} alt={item.name} />
                          ) : (
                            <Image src={item.avatar} alt={item.name} />
                          )}

                          {item.name}
                        </div>
                        {/* <span
                                                    title="Xóa"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleRemoveCustomer(item.id);
                                                    }}
                                                    >
                                                    <Icon name="Trash" />
                                                </span> */}
                      </div>
                    ))
                  ) : (
                    <span className="notification-user">Chưa có khách hàng nào!</span>
                  )}
                </div>
              </div>

              <div className="wrapper-code-email">
                <div className="action-option">
                  <span
                    className="option-template"
                    onClick={() => {
                      setShowModalViewTemplateEmail(true);
                    }}
                  >
                    Chọn mẫu
                  </span>
                  <span
                    className="save-template"
                    onClick={() => {
                      saveTemplate(null);
                    }}
                  >
                    Lưu mẫu
                  </span>
                </div>
              </div>

              <div className="title-email">
                <Input
                  type="text"
                  value={titleEmail}
                  fill={true}
                  required={true}
                  placeholder="Nhập tiêu đề email"
                  error={errorTitleEmail}
                  message="Tiêu đề không được để trống"
                  onChange={(e) => handleChangeValueTitleEmail(e)}
                  onBlur={(e) => handleChangeBlueTitleEmail(e)}
                />
              </div>

              <div className="wrapper-code-email">
                {/* <div className="action-option">
                  <span
                    className="option-template"
                    onClick={() => {
                      setShowModalViewTemplateEmail(true);
                    }}
                  >
                    Chọn mẫu
                  </span>
                  <span
                    className="save-template"
                    onClick={() => {
                      saveTemplate(null);
                    }}
                  >
                    Lưu mẫu
                  </span>
                </div> */}
                {/* <div className="list-code-email">
                  {listCodeEmail.map((item, idx) => (
                    <span key={idx} className="name-code" onClick={() => handlePointerContent(item)}>
                      {item.name}
                    </span>
                  ))}
                </div> */}
                <div className="code-email-select">
                  {/* <div className="left">
                        <SelectCustom
                          id="placeholderType"
                          name="placeholderType"
                          label="Chọn đối tượng"
                          options={listApproach}
                          fill={true}
                          value={placeholder.value}
                          onChange={(e) => {
                            setListApproach(listApproach.map((i) => ({ ...i, isActive: e.value === i.value ? true : false })));
                            setPlaceholder(e);
                          }}
                          placeholder={"Chọn đối tượng"}
                        />
                      </div> */}
                  <div className="right">
                    <SelectCustom
                      id="placeholder"
                      name="placeholder"
                      // label={"Chọn trường thông tin " + placeholder.label}
                      options={placeholder.listPlaceholder}
                      fill={true}
                      value={null}
                      onMenuOpen={() => fetchPlaceholder()}
                      onChange={(e) => handlePointerContent(e)}
                      placeholder={"Chọn trường thông tin " + placeholder.label}
                    />
                  </div>
                </div>
              </div>

              {/* Nội dung email gửi đi */}
              <div className="form-group">
                {/* TODO: lỗi phần này do trình soạn thảo */}
                <RebornEditor
                  name="content"
                  fill={true}
                  initialValue={contentEmail ? contentEmail : ""}
                  dataText={dataCodeEmail}
                  onChangeContent={(e) => handleChangeContentEmail(e)}
                  error={validateContentEmail}
                  message="Nội dung của bạn chưa có link thu thập VOC"
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0 2rem" }}>
                {/* Theo dõi đọc email */}
                <div className="memo">
                  <Checkbox checked={isCheckTrackEmail} label="Theo dõi đọc email" onChange={(e) => handleChangeValueMemo(e.target.checked)} />
                </div>

                <div className="memo">
                  <Checkbox
                    checked={formData.values.voc}
                    label="Thu thập VOC"
                    onChange={(e) => {
                      !formData.values.voc ? setShowModalChooseSurvey(true) : setShowModalChooseSurvey(false);
                      setFormData({ ...formData, values: { ...formData?.values, voc: !formData.values.voc } });
                    }}
                  />
                </div>
              </div>

              {/* Chọn hình thức gửi email, ngẫu nhiên hay chỉ định */}
              <div className="choose-to--send">
                <Checkbox defaultChecked label="Chọn email gửi đi" onChange={(e) => handleChangeValueChooseSend(e.target.checked)} />

                {isChooseSend && listSourceEmail && listSourceEmail.length > 0 && (
                  <div className="list-choose">
                    <div className="choose-item-header">
                      <Checkbox label="Chọn tất cả" checked={isAll} onChange={(e) => handleChangeCheckAllSourceEmail(e.target.checked)} />
                    </div>
                    <CustomScrollbar width="100%" height="9rem">
                      <div className="list-source-email">
                        {listSourceEmail.map((item, idx) => {
                          const isChecked = listIdSourceEmail.some((id) => id === item.value) ? true : false;
                          return (
                            <Checkbox
                              key={idx}
                              checked={isChecked}
                              onChange={(e) => handleChangeCheckOneSourceEmail(+item.value, e.target.checked)}
                              label={item.label}
                            />
                          );
                        })}
                      </div>
                    </CustomScrollbar>
                    <div className="choose-item-footer">
                      <Checkbox label="Chọn ngẫu nhiên" checked={isRandom} onChange={(e) => handleChangeCheckRandomChoose(e.target.checked)} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />

      <AddTemplateEmailModal
        onShow={showModalAddTemplateEmail}
        onHide={() => setShowModalAddTemplateEmail(false)}
        //contentDelta -> Chưa lưu
        data={{ id: 0, title: titleEmail, content: contentEmail, type: 1, tcyId: 0 } as any}
      />

      <ViewTemplateEmailModal
        onShow={showModalViewTemplateEmail}
        onHide={(reload) => {
          setShowModalViewTemplateEmail(false);
        }}
        callback={loadTemplateEmail}
      />

      <ChooseSurvey
        onShow={showModalChooseSurvey}
        onHide={() => setShowModalChooseSurvey(false)}
        // takeLink={(link) => {
        //   setDataCodeEmail(link);
        // }}
      />
    </Fragment>
  );
}
