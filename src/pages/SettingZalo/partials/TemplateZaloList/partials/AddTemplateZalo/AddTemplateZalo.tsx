import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import Input from "components/input/input";
import SelectCustom from "components/selectCustom/selectCustom";
import { ModalFooter } from "components/modal/modal";
import { IActionModal, IOption } from "model/OtherModel";
import { useOnClickOutside } from "utils/hookCustom";
import { FILE_IMAGE_MAX } from "utils/constant";
import { showToast } from "utils/common";
import Radio from "components/radio/radio";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import { ICustomerFilterRequest, IListByIdFilterRequest } from "model/customer/CustomerRequestModel";
import CustomerService from "services/CustomerService";
import { IEstimateRequestModel } from "model/estimate/EstimateRequestModel";
import EstimateService from "services/EstimateService";
import CustomerGroupService from "services/CustomerGroupService";
import CustomerSourceService from "services/CustomerSourceService";
import CareerService from "services/CareerService";
import RelationShipService from "services/RelationShipService";
import { ICareerFilterRequest } from "model/career/CareerRequest";
import { ICustomerGroupFilterRequest } from "model/customerGroup/CustomerGroupRequestModel";
import { ICustomerSourceFilterRequest } from "model/customerSource/CustomerSourceRequest";
import { IRelationShipFilterRequest } from "model/relationShip/RelationShipRequest";
import NummericInput from "components/input/numericInput";
import Image from "components/image";
import AvatarFemale from "assets/images/avatar-female.jpg";
import AvatarMale from "assets/images/avatar-male.jpg";
import FileService from "services/FileService";

import "./AddTemplateZalo.scss";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import RepeatTime from "pages/Common/RepeatTime";
import { SelectOptionData } from "utils/selectCommon";
import Validate, { handleChangeValidate } from "utils/validate";
import TemplateZaloService from "services/TemplateZaloService";
import { isDifferenceObj } from "reborn-util";


export interface IAddZaloMarkettingProps {
  onShow: boolean;
  dataTemplateZalo: any;
  data?: any;
  onHide: (reload: boolean) => void;
  onBackProps: () => void;
  listIdCustomerProps?: number[];
  paramCustomerProps?: any;
}

interface IFilterUser {
  id: number;
  avatar: string;
  name: string;
  gender: number;
}

export default function AddTemplateZalo(props: IAddZaloMarkettingProps) {
  const { onShow, onHide, onBackProps, dataTemplateZalo } = props;
  console.log('dataTemplateZalo', dataTemplateZalo && dataTemplateZalo.content && JSON.parse(dataTemplateZalo.content));
  

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [dataDetail, setDataDetail] = useState(null);

  const [idxTable, setIdxTable] = useState<number>(null);
  const [idxButton, setIdxButton] = useState<number>(null);

  const [idChange, setIdChange] = useState<string>("");
  const [customTemplateZalo, setCustomTemplateZalo] = useState([]);

  console.log('customTemplateZalo', customTemplateZalo);
  
  const [isChooseContent, setIsChooseContent] = useState<boolean>(false);

  const refInputUpload = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState<boolean>(false);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);

  const [valueTypeButton, setValueTypeButton] = useState(null);

  const textareaRef = useRef(null);

  const refOption = useRef();
  const refOptionContainer = useRef();

  const refAction = useRef();
  const refActionTable = useRef();
  const refActionButton = useRef();
  const refActionContainer = useRef();

  useOnClickOutside(refOption, () => setIsChooseContent(false), ["action__choose", "active__choose"]);
  useOnClickOutside(refAction, () => setIdChange(""), ["content__header", "content__text", "box__ui--banner", "box__ui--table", "box__ui--button"]);
  useOnClickOutside(refActionTable, () => setIdxTable(null), ["box__ui--table"]);
  useOnClickOutside(refActionButton, () => setIdxButton(null), ["box__ui--button"]);

  useEffect(() => {
    if(dataTemplateZalo && dataTemplateZalo.content && JSON.parse(dataTemplateZalo.content)){
        setCustomTemplateZalo(JSON.parse(dataTemplateZalo.content))
    }
  }, [dataTemplateZalo])

  const lstOptionContent = [
    {
      type: "banner",
      image_url: "",
    },
    {
      type: "header",
      align: "left",
      content: "",
    },
    {
      type: "table",
      content: [
        {
          key: "",
          value: "",
        },
      ],
    },
    {
      type: "text",
      align: "left",
      content: "",
    },
    {
      type: "buttons",
      content: [
        {
          title: "",
          type: "",
          image_icon: "",
        },
      ],
    },
  ];

  const lstTypeButtons = [
    {
      label: "open url",
      value: "oa.open.url",
      payload: {
        url: "",
      },
    },
    {
      label: "open sms",
      value: "oa.open.sms",
      payload: {
        content: "",
        phone_code: "",
      },
    },
    {
      label: "open phone",
      value: "oa.open.phone",
      payload: {
        phone_code: "",
      },
    },
  ];

  const [listConfigCode, setListConfigCode] = useState<IOption[]>(null);
  const [isLoadingConfigCode, setIsLoadingConfigCode] = useState<boolean>(false);

  const onSelectOpenConfigCode = async () => {
    if (!listConfigCode || listConfigCode.length === 0) {
      setIsLoadingConfigCode(true);

      const dataOption = await SelectOptionData("tcyId");
      if (dataOption) {
        setListConfigCode([...(dataOption.length > 0 ? dataOption : [])]);
      }
      setIsLoadingConfigCode(false);
    }
  };

  useEffect(() => {
    if (dataTemplateZalo?.tcyId) {
      onSelectOpenConfigCode();
    }

    if (dataTemplateZalo?.tcyId === null) {
      setListConfigCode([]);
    }
  }, [dataTemplateZalo]);
  
  const values = useMemo(
    () =>
      ({
        title: dataTemplateZalo?.title ?? "",
        // content: "",
        tcyId: dataTemplateZalo?.tcyId ?? null,
      } as any),
    [onShow]
  );

  const [formData, setFormData] = useState<IFormData>({ values: values });


  const validations: IValidation[] = [
    {
      name: "title",
      rules: "required",
    },
   
    {
      name: "tcyId",
      rules: "required",
    },
   
  ];

  const listField = useMemo(
    () =>
      [
        {
          label: "Tiêu đề Zalo",
          name: "title",
          type: "text",
          fill: true,
          maxLength: 100,
          required: true,
        },
        {
          label: "Chủ đề Zalo",
          name: "tcyId",
          type: "select",
          options: listConfigCode,
          onMenuOpen: onSelectOpenConfigCode,
          fill: true,
          required: true,
          isLoading: isLoadingConfigCode,
        },
        
      ] as IFieldCustomize[],
    [listConfigCode, isLoadingConfigCode,  formData?.values]
  );


  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);



  const handClickOption = (e, item) => {
    e.preventDefault();
    setIsChooseContent(false);

    const newDataItem = {
      id: uuidv4(),
      ...item,
    };

    setCustomTemplateZalo([...customTemplateZalo, newDataItem]);
  };

  //TODO: change value header
  const handleChangeValueHeader = (e, id) => {
    const value = e.target.value;

    setCustomTemplateZalo((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            content: value,
          };
        }

        return item;
      })
    );
  };

  //TODO: change value text
  const handleChangeValueText = (e, id) => {
    const value = e.target.value;

    setCustomTemplateZalo((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            content: value,
          };
        }

        return item;
      })
    );
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [textareaRef.current?.value]);

  //TODO: change value key table
  const handleChangeValueKeyTable = (e, idx, id) => {
    const value = e.target.value;

    setCustomTemplateZalo((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            content: [...item.content].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  key: value,
                };
              }

              return el;
            }),
          };
        }

        return item;
      })
    );
  };

  //TODO: change value table
  const handleChangeValueTable = (e, idx, id) => {
    const value = e.target.value;

    setCustomTemplateZalo((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            content: [...item.content].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  value: value,
                };
              }

              return el;
            }),
          };
        }

        return item;
      })
    );
  };

  //TODO: add item table
  const handleAddItemTable = (id) => {
    setCustomTemplateZalo((prev) =>
      prev.map((ol) => {
        if (ol.id === id) {
          return {
            ...ol,
            content: [
              ...ol.content,
              {
                key: "",
                value: "",
              },
            ],
          };
        }

        return ol;
      })
    );
  };

  //TODO: delete item table
  const handleRemoveItemTable = (idx, id) => {
    const newData = [...customTemplateZalo].find((ol) => ol.id === id).content;

    if (newData.length > 1) {
      newData.splice(idx, 1);

      setCustomTemplateZalo((prev) =>
        prev.map((el) => {
          if (el.id === id) {
            return {
              ...el,
              content: newData,
            };
          }
          return el;
        })
      );
    } else {
      const cloneData = [...customTemplateZalo].filter((el) => el.id !== id);
      setCustomTemplateZalo(cloneData);
    }
  };

  //TODO: change value banner
  const handleChangeValueBanner = (e) => {
    e.preventDefault();

    if (e.target.files && e.target.files.length > 0) {
      if (e.target.files[0].size > FILE_IMAGE_MAX) {
        showToast(`Ảnh tải lên giới hạn dung lượng không quá ${FILE_IMAGE_MAX / 1024 / 1024}MB`, "warning");
        e.target.value = "";
      } else {
        setFile(e.target.files[0]);

        e.target.value = null;
      }
    }
  };

  //? Start logic đoạn kéo thả ảnh
  function handleDragStart(e) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e, id) {
    e.preventDefault();
    e.stopPropagation();

    setDragging(false);

    const newFiles = [];
    const droppedFiles: any = Array.from(e.dataTransfer.files);

    droppedFiles.forEach((file) => {
      const checkFile = file?.name.split("?")[0].split("#")[0].split(".").pop();

      if (checkFile !== "jpg" && checkFile !== "png") {
        showToast("File không đúng định dạng. Vui lòng kiểm tra lại !", "warning");
        return;
      }

      if (!newFiles.find((f) => f.name === file.name)) {
        newFiles.push(file);
      }
    });

    setFile(newFiles[newFiles.length - 1]);
    setIdChange(id);
  }
  //? End logic đoạn kéo thả ảnh

  const uploadSuccess = (data) => {
    setIsLoadingFile(true);
    const result = data?.fileUrl;

    setTimeout(() => {
      setIsLoadingFile(false);
    }, 800);

    setCustomTemplateZalo((prev) =>
      prev.map((item) => {
        if (item.id === idChange) {
          return {
            ...item,
            image_url: result,
          };
        }

        return item;
      })
    );
  };

  const uploadError = () => {
    showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
  };

  const handUploadFile = async (file) => {
    if (!file) return;
    await FileService.uploadFile({ data: file, onSuccess: uploadSuccess, onError: uploadError });
  };

  useEffect(() => {
    if (file) {
      handUploadFile(file);
    }
  }, [file]);

  //TODO: delete item banner
  const handleRemoveItemBanner = (id) => {
    const newData = [...customTemplateZalo].filter((item) => item.id !== id);
    setCustomTemplateZalo(newData);
  };

  //TODO: change value title button
  const handleChangeValueButton = (e, idx, id) => {
    const value = e.target.value;

    setCustomTemplateZalo((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            content: [...item.content].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  title: value,
                };
              }

              return el;
            }),
          };
        }

        return item;
      })
    );
  };

  //TODO: change value type button
  const handleChangeTypeButton = (e, idx, id) => {
    const value = e;

    if (value.value === "oa.open.url") {
      setValueTypeButton({ ...valueTypeButton, url: value });
    } else if (value.value === "oa.open.sms") {
      setValueTypeButton({ ...valueTypeButton, sms: value });
    } else {
      setValueTypeButton({ ...valueTypeButton, phone: value });
    }

    setCustomTemplateZalo((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            content: [...item.content].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  type: value.value,
                  payload: value.payload,
                };
              }

              return el;
            }),
          };
        }

        return item;
      })
    );
  };

  //TODO: change value url button
  const handleChangeUrlButton = (e, idx, id) => {
    const value = e.target.value;

    setCustomTemplateZalo((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            content: [...item.content].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  payload: { url: value },
                };
              }

              return el;
            }),
          };
        }

        return item;
      })
    );
  };

  //TODO: change value content sms button
  const handleChangeContentButton = (e, idx, id) => {
    const value = e.target.value;

    setCustomTemplateZalo((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            content: [...item.content].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  payload: { ...el.payload, content: value },
                };
              }

              return el;
            }),
          };
        }

        return item;
      })
    );
  };

  //TODO: change value phone button
  const handleChangePhoneSmsButton = (e, idx, id) => {
    const value = e.target.value;

    setCustomTemplateZalo((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            content: [...item.content].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  payload: { ...el.payload, phone_code: value },
                };
              }

              return el;
            }),
          };
        }

        return item;
      })
    );
  };

  //TODO: change value phone button
  const handleChangePhoneButton = (e, idx, id) => {
    const value = e.target.value;

    setCustomTemplateZalo((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            content: [...item.content].map((el, index) => {
              if (index === idx) {
                return {
                  ...el,
                  payload: { phone_code: value },
                };
              }

              return el;
            }),
          };
        }

        return item;
      })
    );
  };

  //TODO: add item button
  const handleAddItemButton = (id) => {
    setCustomTemplateZalo((prev) =>
      prev.map((ol) => {
        if (ol.id === id) {
          return {
            ...ol,
            content: [
              ...ol.content,
              {
                title: "",
                type: "",
                payload: "",
                image_icon: "",
              },
            ],
          };
        }

        return ol;
      })
    );
  };

  //TODO: delete item button
  const handleRemoveItemButton = (idx, id) => {
    const newData = [...customTemplateZalo].find((ol) => ol.id === id).content;

    if (newData.length > 1) {
      newData.splice(idx, 1);

      setCustomTemplateZalo((prev) =>
        prev.map((el) => {
          if (el.id === id) {
            return {
              ...el,
              content: newData,
            };
          }
          return el;
        })
      );
    } else {
      const cloneData = [...customTemplateZalo].filter((el) => el.id !== id);
      setCustomTemplateZalo(cloneData);
    }
  };

  const handFormatAlignText = (id, align) => {
    setCustomTemplateZalo((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            align: align,
          };
        }

        return item;
      })
    );
  };

  const handleRemoveItemUI = (id) => {
    const newData = [...customTemplateZalo].filter((el) => el.id !== id);
    setCustomTemplateZalo(newData);
  };

  const RenderActionUI = (item) => {
    return (
      <div className="action__common" ref={refAction}>
        <Tippy content="Căn trái">
          <div
            className={`action__common--align--left ${item.item.align === "left" ? "active__align--left" : ""}`}
            onClick={() => handFormatAlignText(item.item.id, "left")}
          >
            <Icon name="AlignLeft" />
          </div>
        </Tippy>
        <Tippy content="Căn giữa">
          <div
            className={`action__common--align--center ${item.item.align === "center" ? "active__align--center" : ""}`}
            onClick={() => handFormatAlignText(item.item.id, "center")}
          >
            <Icon name="AlignCenter" />
          </div>
        </Tippy>
        <Tippy content="Căn phải">
          <div
            className={`action__common--align--right ${item.item.align === "right" ? "active__align--right" : ""}`}
            onClick={() => handFormatAlignText(item.item.id, "right")}
          >
            <Icon name="AlignRight" />
          </div>
        </Tippy>
        <Tippy content="Xóa">
          <div className="action__common--delete" onClick={() => handleRemoveItemUI(item.item.id)}>
            <Icon name="Trash" />
          </div>
        </Tippy>
      </div>
    );
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Huỷ",
            color: "primary",
            variant: "outline",
            disabled: isSubmit,
            callback: () => {
              // quay lại
              onHide(false)
            },
          },
          {
            title: dataTemplateZalo ? "Chỉnh sửa" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit, formData, values]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    setIsSubmit(true);

    const body: any = {
        id: dataTemplateZalo?.id,
        title: formData.values.title,
        tcyId: formData.values.tcyId,
        content: JSON.stringify(customTemplateZalo)
    }
    console.log('body', body);

    const response = await TemplateZaloService.update(body);
    if (response.code === 0) {
      showToast(`${dataTemplateZalo ? "Cập nhật" : "Thêm mới"} mẫu tin thành công`, "success");
      onHide(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
    
  }


  return (
    <div className="page-content page__add-zalo--template">
      {/* <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              !isSubmit && onHide(true);
            }}
            className="title-first"
            title="Quay lại"
          >
            Zalo marketting
          </h1>
          {onShow && (
            <Fragment>
              <Icon
                name="ChevronRight"
                onClick={() => {
                  !isSubmit && onBackProps();
                }}
              />
              <h1 className="title-last">{dataDetail ? "Chỉnh sửa Zalo marketting" : "Gửi Zalo marketting"}</h1>
            </Fragment>
          )}
        </div>
      </div> */}
      <div className="card-box">
        <form className="form__send-zalo--template" onSubmit={(e) => onSubmit(e)}>
          <div className="send__zalo--template">
            <div className="content__send--zalo">
              <div className="content__left">
                {/* Tiêu đề nội dung */}
                {/* <div className="title-email">
                  <Input
                    type="text"
                    value={formData?.values.title}
                    fill={true}
                    required={true}
                    placeholder="Nhập tiêu đề zalo"
                    error={false}
                    message="Tiêu đề không được để trống"
                    onChange={(e) => setFormData({ ...formData, values: { ...formData.values, title: e.target.value } })}
                  />
                </div> */}

                <div className="list-form-group">
                    {listField.map((field, index) => (
                        <FieldCustomize
                            key={index}
                            field={field}
                            handleUpdate={(value) => handleChangeValidate(value, field, formData, validations, listField, setFormData)}
                            formData={formData}
                        />
                    ))}
                </div>
                {/* Thêm khối nội dung */}
                <div className="choose__box--content">
                  <div
                    className={`action__choose ${isChooseContent ? "active__choose" : ""}`}
                    ref={refOptionContainer}
                    onClick={() => setIsChooseContent(!isChooseContent)}
                  >
                    <Icon name="PlusCircleFill" />
                    Thêm khối nội dung
                  </div>

                  {isChooseContent && (
                    <div className="list__option" ref={refOption}>
                      <ul className="menu__option">
                        {lstOptionContent.map((item, idx) => {
                          const isButton = customTemplateZalo.filter((el) => el.type === "buttons").length > 0;
                          const isText = customTemplateZalo.filter((el) => el.type === "text").length >= 2;

                          return (
                            <li key={idx} className={`item-option`}>
                              {(isButton && item.type === "buttons") || (isText && item.type === "text") ? (
                                <span className="dis__item--option">{item.type}</span>
                              ) : (
                                <span
                                  className="choose-item"
                                  onClick={(e) => {
                                    handClickOption(e, item);
                                  }}
                                >
                                  {item.type}
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {customTemplateZalo && customTemplateZalo.length > 0 && (
                    <div className="render__ui--choose">
                      {customTemplateZalo.map((item, idx) => {
                        return (
                          <div key={idx} className="item__render--choose">
                            {item.type === "banner" ? (
                              <div
                                className={`box--ui box__ui--banner ${item.id === idChange ? "active--ui active__ui--banner" : ""}`}
                                onClick={() => setIdChange(item.id)}
                                ref={refActionContainer}
                              >
                                <div className="box__upload--file" ref={refAction}>
                                  <div
                                    className={`support__upload--file ${dragging ? "dragging" : ""}`}
                                    draggable="true"
                                    onDragEnter={handleDragEnter}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, item.id)}
                                    onDragStart={handleDragStart}
                                  >
                                    {!isLoadingFile && !item.image_url ? (
                                      <div className="action-operation">
                                        <div className="action-content">
                                          <Icon name="CloudUpload" />
                                          <h3>Kéo và thả tệp tại đây</h3>
                                        </div>
                                        <span>Hoặc</span>
                                        <div className="btn-upload--file">
                                          <label htmlFor={item.id}>Chọn tập tin</label>
                                          <input
                                            type="file"
                                            accept="image/png,image/jpg"
                                            className="d-none"
                                            id={item.id}
                                            ref={refInputUpload}
                                            onChange={(e) => handleChangeValueBanner(e)}
                                          />
                                        </div>
                                      </div>
                                    ) : isLoadingFile && item.id === idChange ? (
                                      <div className="is__loading--file">
                                        <Icon name="Refresh" />
                                        <span className="name-loading">Đang tải...</span>
                                      </div>
                                    ) : item.image_url ? (
                                      <div className="show-file-upload">
                                        <img src={item.image_url} alt="img__banner" />
                                      </div>
                                    ) : (
                                      <div className="action-operation">
                                        <div className="action-content">
                                          <Icon name="CloudUpload" />
                                          <h3>Kéo và thả tệp tại đây</h3>
                                        </div>
                                        <span>Hoặc</span>
                                        <div className="btn-upload--file">
                                          <label htmlFor={item.id}>Chọn tập tin</label>
                                          <input
                                            type="file"
                                            accept="image/png,image/jpg"
                                            className="d-none"
                                            id={item.id}
                                            ref={refInputUpload}
                                            onChange={(e) => handleChangeValueBanner(e)}
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {item.id === idChange && (
                                  <div className="action__common action__banner">
                                    {item.image_url && (
                                      <Tippy content="Chỉnh sửa">
                                        <div className="action__banner--edit" onClick={() => refInputUpload.current?.click()}>
                                          <Icon name="Pencil" />
                                        </div>
                                      </Tippy>
                                    )}
                                    <Tippy content="Xóa">
                                      <div className="action__banner--delete" onClick={() => handleRemoveItemBanner(item.id)}>
                                        <Icon name="Trash" />
                                      </div>
                                    </Tippy>
                                    <input
                                      type="file"
                                      accept="image/png,image/jpg"
                                      className="d-none"
                                      id={item.id}
                                      ref={refInputUpload}
                                      onChange={(e) => handleChangeValueBanner(e)}
                                    />
                                  </div>
                                )}
                              </div>
                            ) : item.type === "header" ? (
                              <div
                                className={`box--ui box__ui--header ${item.id === idChange ? "active--ui active__ui--header" : ""}`}
                                onClick={() => setIdChange(item.id)}
                              >
                                <div className="content__header" ref={refActionContainer}>
                                  <div className="change-content">
                                    <input
                                      type="text"
                                      value={item.content}
                                      maxLength={100}
                                      placeholder="Thay đổi nội dung header ở đây"
                                      onChange={(e) => handleChangeValueHeader(e, item.id)}
                                      style={{ textAlign: item.align }}
                                    />
                                  </div>
                                  {item.id === idChange && <RenderActionUI item={item} />}
                                </div>
                              </div>
                            ) : item.type === "table" ? (
                              <div
                                className={`box--ui box__ui--table ${item.id === idChange ? "active--ui active__ui--table" : ""}`}
                                onClick={() => setIdChange(item.id)}
                                ref={refActionContainer}
                              >
                                {item.content.map((el, index) => {
                                  return (
                                    <div key={index} className="item-table" ref={refAction}>
                                      <div className="content__key--value" onClick={() => setIdxTable(index)}>
                                        <div className="key">
                                          <input
                                            type="text"
                                            value={el.key}
                                            maxLength={25}
                                            placeholder="Từ khóa"
                                            onChange={(e) => handleChangeValueKeyTable(e, index, item.id)}
                                          />
                                        </div>
                                        <div className="value">
                                          <input
                                            type="text"
                                            value={el.value}
                                            maxLength={100}
                                            placeholder="Giá trị"
                                            onChange={(e) => handleChangeValueTable(e, index, item.id)}
                                          />
                                        </div>
                                      </div>

                                      {index === idxTable && (
                                        <div className="action__common action__table" ref={refActionTable}>
                                          {item.content.length < 5 && (
                                            <Tippy content="Thêm">
                                              <div className="action__table--item action__table--add" onClick={() => handleAddItemTable(item.id)}>
                                                <Icon name="PlusCircleFill" />
                                              </div>
                                            </Tippy>
                                          )}
                                          <Tippy content="Xóa">
                                            <div
                                              className="action__table--item action__table--delete"
                                              onClick={() => handleRemoveItemTable(index, item.id)}
                                            >
                                              <Icon name="Trash" />
                                            </div>
                                          </Tippy>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : item.type === "text" ? (
                              <div
                                className={`box--ui box__ui--text ${item.id === idChange ? "active--ui active__ui--text" : ""}`}
                                onClick={() => setIdChange(item.id)}
                              >
                                <div className="content__text" ref={refActionContainer}>
                                  <div className="change-content">
                                    <textarea
                                      rows={2}
                                      value={item.content}
                                      maxLength={1000}
                                      ref={textareaRef}
                                      placeholder="Thay đổi nội dung ở đây"
                                      onChange={(e) => handleChangeValueText(e, item.id)}
                                      style={{ textAlign: item.align }}
                                    />
                                  </div>
                                  {item.id === idChange && <RenderActionUI item={item} />}
                                </div>
                              </div>
                            ) : (
                              <div
                                className={`box--ui box__ui--button ${item.id === idChange ? "active--ui active__ui--button" : ""}`}
                                onClick={() => setIdChange(item.id)}
                                ref={refActionContainer}
                              >
                                {item.content.map((el, index) => {
                                  const lstOption = lstTypeButtons.filter((ol) => !item.content.some((v) => v.type === ol.value));

                                  return (
                                    <div key={index} className="item-button" ref={refAction}>
                                      <div className="content__button--value" onClick={() => setIdxButton(index)}>
                                        <div className="value__title">
                                          <div className="title-button">
                                            <input
                                              type="text"
                                              value={el.title}
                                              maxLength={35}
                                              placeholder="Tiêu đề buttons"
                                              onChange={(e) => handleChangeValueButton(e, index, item.id)}
                                            />
                                          </div>
                                          <div className="icon__default--button">
                                            <Icon name="ChevronRight" />
                                          </div>
                                        </div>
                                        <div className="value__type">
                                          <div className="choose__type--button">
                                            <SelectCustom
                                              name="type_button"
                                              value={
                                                el.type
                                                  ? el.type === "oa.open.url"
                                                    ? valueTypeButton?.url
                                                    : el.type === "oa.open.sms"
                                                    ? valueTypeButton?.sms
                                                    : valueTypeButton?.phone
                                                  : ""
                                              }
                                              options={lstOption}
                                              special={true}
                                              placeholder="Chọn loại button"
                                              onChange={(e) => handleChangeTypeButton(e, index, item.id)}
                                            />
                                          </div>

                                          {el.type &&
                                            (el.type === "oa.open.url" ? (
                                              <div className="type__item  type__url">
                                                <input
                                                  type="text"
                                                  value={el.payload.url}
                                                  placeholder="https://example.com"
                                                  onChange={(e) => handleChangeUrlButton(e, index, item.id)}
                                                />
                                              </div>
                                            ) : el.type === "oa.open.sms" ? (
                                              <div className="type__item type__sms">
                                                <div className="phone-sms">
                                                  <input
                                                    type="phone"
                                                    value={el.payload.phone_code}
                                                    placeholder="Nhập số điện thoại"
                                                    onChange={(e) => handleChangePhoneSmsButton(e, index, item.id)}
                                                  />
                                                </div>
                                                <div className="content-sms">
                                                  <input
                                                    type="text"
                                                    value={el.payload.content}
                                                    placeholder="Nhập nội dung thoại"
                                                    onChange={(e) => handleChangeContentButton(e, index, item.id)}
                                                  />
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="type__item type__phone">
                                                <input
                                                  type="phone"
                                                  value={el.payload.phone_code}
                                                  placeholder="Nhập số điện thoại"
                                                  onChange={(e) => handleChangePhoneButton(e, index, item.id)}
                                                />
                                              </div>
                                            ))}
                                        </div>
                                      </div>

                                      {index === idxButton && (
                                        <div className="action__common action__button" ref={refActionButton}>
                                          {item.content.length < 3 && (
                                            <Tippy content="Thêm">
                                              <div
                                                className="action__button--item action__button--add"
                                                onClick={() => {
                                                  handleAddItemButton(item.id);
                                                  setIdxButton((prev) => prev + 1);
                                                }}
                                              >
                                                <Icon name="PlusCircleFill" />
                                              </div>
                                            </Tippy>
                                          )}
                                          <Tippy content="Xóa">
                                            <div
                                              className="action__button--item action__button--delete"
                                              onClick={() => {
                                                handleRemoveItemButton(index, item.id);
                                                setIdxButton((prev) => prev - 1);
                                              }}
                                            >
                                              <Icon name="Trash" />
                                            </div>
                                          </Tippy>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              {/* <div className="content__right">
                <div className="preview__template--zalo">
                  <h3 className="title_idx">Xem trước mẫu</h3>
                  {customTemplateZalo && customTemplateZalo.length > 0 && (
                    <div className="box__preview">
                      {customTemplateZalo.map((item, idx) => {
                        return (
                          <div key={idx} className="item__preview">
                            {item.type === "banner" ? (
                              <div className="item__banner">{item.image_url ? <img src={item.image_url} alt="banner-zalo" /> : ""}</div>
                            ) : item.type === "header" ? (
                              <h3 className="title-zalo" style={{ textAlign: `${item.align}` } as any}>
                                {item.content}
                              </h3>
                            ) : item.type === "table" ? (
                              item.content.map((el, index) => {
                                return (
                                  <div key={index} className="item__table">
                                    <h4 className="key">{el.key}</h4>
                                    <h4 className="value">{el.value}</h4>
                                  </div>
                                );
                              })
                            ) : item.type === "text" ? (
                              <p className="item__content" style={{ textAlign: `${item.align}` } as any}>
                                {item.content}
                              </p>
                            ) : (
                              item.content.map((ol, ilx) => {
                                return (
                                  <div key={ilx} className={ol.title ? "item__buttons" : "d-none"}>
                                    <h4 className="name-buttons">{ol.title}</h4>
                                    <Icon name="ChevronRight" />
                                  </div>
                                );
                              })
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div> */}
            </div>
            <ModalFooter actions={actions} />
          </div>
        </form>
      </div>
    </div>
  );
}
