import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { IActionModal, IOption } from "model/OtherModel";
import { IFieldCustomize, IFormData, IValidation } from "model/FormModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Input from "components/input/input";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import FieldCustomize from "components/fieldCustomize/fieldCustomize";
import Validate, { handleChangeValidate } from "utils/validate";
import { showToast } from "utils/common";
import { isDifferenceObj } from "reborn-util";
import FileUpload from "components/fileUpload/fileUpload";
import TextArea from "components/textarea/textarea";
import { useActiveElement } from "utils/hookCustom";
import UserService from "services/UserService";
import ApplicationService from "services/ApplicationService";

import "./index.scss";
import AreaService from "services/AreaService";

interface IAddOrgProps {
  onShow: boolean;
  id: number;
  idUserAdmin?: number;
  onHide: (reload: boolean) => void;
}

export default function AddOrg(props: IAddOrgProps) {
  const { onShow, onHide, id, idUserAdmin } = props;

  const lstTypeBusiness = [
    {
      value: 1,
      label: "Thẩm mỹ viện",
    },
    {
      value: 2,
      label: "Phòng khám",
    },
    {
      value: 3,
      label: "Salon tóc",
    },
    {
      value: 4,
      label: "Bất động sản",
    },
    {
      value: 5,
      label: "Khác",
    },
    {
      value: 6,
      label: "Giáo dục",
    },
  ];

  const handleGetOrg = async (id: number) => {
    if (!id) return;

    const response = await ApplicationService.detail(id);

    if (response.code === 0) {
      const result = response.result;
      const changeSubdomain = result.subdomain.replace(/\.reborn\.vn$/, "");

      const changeResult = {
        name: result.name,
        phone: result.phone,
        email: result.email,
        avatar: result.avatar,
        address: result.address,
        description: result.description,
        contact: result.contact,
        subdomain: changeSubdomain,
        cityId: result.cityId,
        districtId: result.districtId,
        subdistrictId: result.subdistrictId,
        ownerId: result.ownerId,
        type: result.type,
      };

      onSelectOpenCity();
      onSelectOpenDistrict(result.cityId);
      onSelectOpenSubdistrict(result.districtId);
      setData(changeResult);
    } else {
      showToast(response.message ?? "Chi tiết tổ chức đang lỗi. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    if (onShow && id) {
      handleGetOrg(id);
    }
  }, [id, onShow]);

  const [data, setData] = useState(null);

  const focusedElement = useActiveElement();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [listCity, setListCity] = useState<IOption[]>([]);
  const [isLoadingCity, setIsLoadingCity] = useState<boolean>(false);
  const [listDistrict, setListDistrict] = useState<IOption[]>([]);
  const [isLoadingDistrict, setIsLoadingDistrict] = useState<boolean>(false);
  const [listSubdistrict, setListSubdistrict] = useState<IOption[]>([]);
  const [isLoadingSubdistrict, setIsLoadingSubdistrict] = useState<boolean>(false);
  const [listUser, setListUser] = useState<IOption[]>([]);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(false);

  const [dataUserOwn, setDataUserOwn] = useState(null);

  const handleGetOwn = async (id: number) => {
    if (!id) return;

    const response = await UserService.detail(id);

    if (response.code === 0) {
      const result = response.result;
      setDataUserOwn({
        value: result.id,
        label: `${result.name} ${result.phone ? `- ${result.phone}` : ""}`,
      });
      onSelectOpenUser();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }
  };

  useEffect(() => {
    if (idUserAdmin && onShow) {
      handleGetOwn(idUserAdmin);
    }
  }, [idUserAdmin, onShow]);

  const values = useMemo(
    () =>
      ({
        name: data?.name ?? "",
        phone: data?.phone ?? "",
        email: data?.email ?? "",
        avatar: data?.avatar ?? "",
        address: data?.address ?? "",
        description: data?.description ?? "",
        contact: data?.contact ?? "",
        subdomain: data?.subdomain ?? "",
        cityId: data?.cityId ?? null,
        districtId: data?.districtId ?? null,
        subdistrictId: data?.subdistrictId ?? null,
        ownerId: data?.ownerId ?? dataUserOwn?.value ?? null,
        type: data?.type ?? null,
      } as any),
    [data, onShow, dataUserOwn]
  );

  const validations: IValidation[] = [
    {
      name: "name",
      rules: "required",
    },
    {
      name: "type",
      rules: "required",
    },
    {
      name: "address",
      rules: "required",
    },
    {
      name: "contact",
      rules: "required",
    },
    {
      name: "phone",
      rules: "required",
    },
    {
      name: "ownerId",
      rules: "required",
    },
  ];

  const [formData, setFormData] = useState<IFormData>({ values: values });

  const handleChangeValueAddress = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, values: { ...formData?.values, address: value } });
  };

  //? đoạn này sử lý vấn đề lấy ra danh sách tỉnh thành phố
  const onSelectOpenCity = async () => {
    setIsLoadingCity(true);

    const param = {
      parentId: 0,
    };

    const response = await AreaService.list(param);

    if (response.code === 0) {
      const dataOption = response.result;
      setListCity([
        ...(dataOption?.length > 0
          ? dataOption?.map((item) => {
              return {
                value: item.id,
                label: item.name,
              };
            })
          : []),
      ]);
    }

    setIsLoadingCity(false);
  };

  const handleChangeValueCity = (e) => {
    onSelectOpenDistrict(e.value);
  };

  //? đoạn này sử lý vấn đề lấy ra danh sách quận huyện
  const onSelectOpenDistrict = async (value: number) => {
    setIsLoadingDistrict(true);

    const param = {
      parentId: value,
    };

    if (value) {
      const response = await AreaService.list(param);

      if (response.code === 0) {
        const dataOption = response.result;
        setListDistrict([
          ...(dataOption?.length > 0
            ? dataOption?.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                };
              })
            : []),
        ]);
      }
    }
    setIsLoadingDistrict(false);
  };

  const handleChangeValueDistrict = (e) => {
    onSelectOpenSubdistrict(e.value);
  };

  //? đoạn này lấy danh sách phường xã
  const onSelectOpenSubdistrict = async (value: number) => {
    setIsLoadingSubdistrict(true);

    const param = {
      parentId: value,
    };

    if (value) {
      const response = await AreaService.list(param);

      if (response.code === 0) {
        const dataOption = response.result;
        setListSubdistrict([
          ...(dataOption?.length > 0
            ? dataOption?.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                };
              })
            : []),
        ]);
      }
    }
    setIsLoadingSubdistrict(false);
  };

  //? đoạn này lấy ra danh sách tài khoản quản trị
  const onSelectOpenUser = async () => {
    setIsLoadingUser(true);

    const param = {
      limit: 10000,
    };

    const response = await UserService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;
      setListUser([
        ...(dataOption?.length > 0
          ? dataOption?.map((item) => {
              return {
                value: item.id,
                label: `${item.name} ${item.phone ? `- ${item.phone}` : ""}`,
              };
            })
          : []),
      ]);
    }

    setIsLoadingUser(false);
  };

  useEffect(() => {
    if (data && data.ownerId) {
      onSelectOpenUser();
    } else {
      setListUser([]);
    }
  }, [data?.ownerId]);

  const listField = useMemo(
    () =>
      [
        {
          label: "Tên doanh nghiệp",
          name: "name",
          type: "text",
          fill: true,
          required: true,
        },
        {
          label: "Loại hình doanh nghiệp",
          name: "type",
          type: "select",
          fill: true,
          required: true,
          options: lstTypeBusiness,
        },
        {
          type: "custom",
          name: "custom",
          snippet: (
            <div className="info__org">
              <div className="avatar-org">
                <FileUpload type="avatar" name="avatar" label="Ảnh đại diện" formData={formData} setFormData={setFormData} />
              </div>
              <div className="address-org">
                <TextArea
                  name="address"
                  label="Địa chỉ"
                  fill={true}
                  required={true}
                  value={formData?.values?.address}
                  onChange={(e) => handleChangeValueAddress(e)}
                  placeholder="Nhập địa chỉ"
                />
              </div>
            </div>
          ),
        },
        {
          type: "textarea",
          name: "description",
          fill: true,
          label: "Mô tả về tổ chức",
        },
        {
          type: "select",
          name: "cityId",
          fill: true,
          label: "Tỉnh/Thành",
          options: listCity,
          isLoading: isLoadingCity,
          onMenuOpen: onSelectOpenCity,
          onChange: (e) => handleChangeValueCity(e),
        },
        {
          type: "select",
          name: "districtId",
          fill: true,
          label: "Quận/Huyện",
          options: listDistrict,
          isLoading: isLoadingDistrict,
          onMenuOpen: onSelectOpenDistrict,
          onChange: (e) => handleChangeValueDistrict(e),
        },
        {
          type: "select",
          name: "subdistrictId",
          fill: true,
          label: "Phường/Xã",
          options: listSubdistrict,
          isLoading: isLoadingSubdistrict,
          onMenuOpen: onSelectOpenSubdistrict,
        },
        {
          type: "text",
          name: "contact",
          fill: true,
          required: true,
          label: "Tên người liên hệ",
        },
        {
          type: "text",
          name: "phone",
          fill: true,
          required: true,
          label: "SĐT người liên hệ",
          placeholder: "Nhập số điện thoại người liên hệ",
        },
        {
          type: "text",
          name: "email",
          fill: true,
          label: "Email người liên hệ",
        },
        {
          type: "custom",
          name: "subdomain",
          snippet: (
            <div className="info__subdomain">
              <div className="form-group">
                <Input
                  name="subdomain"
                  label="Tên miền phụ"
                  required={true}
                  value={formData?.values?.subdomain}
                  onChange={(e) => setFormData({ ...formData, values: { ...formData.values, subdomain: e.target.value } })}
                  fill={true}
                  placeholder="Nhập tên miền"
                />
              </div>
              <div className="last_subdomain">.reborn.vn</div>
            </div>
          ),
        },
        {
          type: "select",
          name: "ownerId",
          fill: true,
          required: true,
          label: "Tài khoản quản trị",
          options: listUser,
          isLoading: isLoadingUser,
          onMenuOpen: onSelectOpenUser,
        },
      ] as IFieldCustomize[],
    [formData, listCity, isLoadingCity, listDistrict, isLoadingDistrict, listSubdistrict, isLoadingSubdistrict, listUser, isLoadingUser]
  );

  useEffect(() => {
    setFormData({ ...formData, values: values, errors: {} });
    setIsSubmit(false);

    return () => {
      setIsSubmit(false);
    };
  }, [values]);

  const handleClearForm = (acc) => {
    onHide(acc);
    setData(null);
    setListCity([]);
    setListDistrict([]);
    setListSubdistrict([]);
    setDataUserOwn(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const errors = Validate(validations, formData, listField);
    if (Object.keys(errors).length > 0) {
      setFormData((prevState) => ({ ...prevState, errors: errors }));
      return;
    }
    setIsSubmit(true);

    const changeFormData = {
      ...formData.values,
      subdomain: `${formData.values.subdomain}.reborn.vn`,
    };

    const body: any = {
      ...(changeFormData as any),
      ...(id ? { id: id } : {}),
    };

    const response = await ApplicationService.update(body);

    if (response.code === 0) {
      showToast(`${data ? "Chỉnh sửa" : "Thêm mới"} tổ chức thành công`, "success");
      handleClearForm(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
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
              !isDifferenceObj(formData.values, values) ? handleClearForm(false) : showDialogConfirmCancel();
            },
          },
          {
            title: data ? "Cập nhật" : "Tạo mới",
            type: "submit",
            color: "primary",
            disabled: isSubmit || !isDifferenceObj(formData.values, values) || (formData.errors && Object.keys(formData.errors).length > 0),
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [formData, values, isSubmit]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác ${data ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
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

  const checkKeyDown = useCallback(
    (e) => {
      const { keyCode } = e;
      if (keyCode === 27 && !showDialog) {
        if (isDifferenceObj(formData.values, values)) {
          showDialogConfirmCancel();
          if (focusedElement instanceof HTMLElement) {
            focusedElement.blur();
          }
        } else {
          onHide(false);
        }
      }
    },
    [formData]
  );

  useEffect(() => {
    window.addEventListener("keydown", checkKeyDown);

    return () => {
      window.removeEventListener("keydown", checkKeyDown);
    };
  }, [checkKeyDown]);

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && handleClearForm(false)}
        className="modal-add-org"
      >
        <form className="form-org-group" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={`${id ? "Chỉnh sửa" : "Thêm mới"} tổ chức`} toggle={() => !isSubmit && handleClearForm(false)} />
          <ModalBody>
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
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
