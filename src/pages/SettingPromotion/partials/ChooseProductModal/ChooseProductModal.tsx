import React, { Fragment, useState, useEffect, useCallback, useMemo, useRef, useContext } from "react";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import "./ChooseProductModal.scss";
import ProductService from "services/ProductService";

export default function ChooseProductModal(props: any) {
  const { onShow, idData, onHide } = props;

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [dataProduct, setDataProduct] = useState<any>([
    {
      id: 3389888,
      name: "MYDOCALM 150MG",
      short_name: null,
      substances: null,
      concentration: null,
      package_form: null,
      company: null,
      drug_code: "DRUG308183",
      country: null,
      active: "yes",
      image: null,
      description: null,
      registry_number: null,
      warning_days: null,
      warning_quantity_max: null,
      warning_unit: null,
      drug_store_id: 1500,
      main_cost: "0",
      pre_cost: "0",
      current_cost: "1959",
      unit_id: 32,
      unit_name: "Vi\u00ean",
      other_units:
        '[{"unit_id": 32, "exchange": 1, "is_basic": "yes", "mfg_date": null, "quantity": 0.0, "main_cost": 0, "unit_name": "Vi\u00ean", "current_cost": 1959, "warning_quantity": 0, "manufacturing_date": null}]',
      numbers: null,
    },
    {
      id: 3389889,
      name: "CLORPHENIRAMIN",
      short_name: null,
      substances: null,
      concentration: null,
      package_form: null,
      company: null,
      drug_code: "DRUG308184",
      country: null,
      active: "yes",
      image: null,
      description: null,
      registry_number: null,
      warning_days: null,
      warning_quantity_max: null,
      warning_unit: 32,
      drug_store_id: 1500,
      main_cost: "0",
      pre_cost: "0",
      current_cost: "60",
      unit_id: 32,
      unit_name: "Vi\u00ean",
      other_units:
        '[{"unit_id": 32, "exchange": 1, "is_basic": "yes", "mfg_date": null, "quantity": 0.0, "main_cost": 0, "unit_name": "Vi\u00ean", "current_cost": 60, "warning_quantity": 0, "manufacturing_date": null}, {"unit_id": 11, "exchange": 1, "is_basic": "no", "mfg_date": null, "quantity": 0.0, "main_cost": 0, "unit_name": "Chai", "current_cost": 30200, "warning_quantity": 0, "manufacturing_date": null}]',
      numbers: null,
    },
    {
      id: 3389890,
      name: "CAMISEPT",
      short_name: null,
      substances: null,
      concentration: null,
      package_form: null,
      company: null,
      drug_code: "DRUG308185",
      country: null,
      active: "yes",
      image: null,
      description: null,
      registry_number: null,
      warning_days: null,
      warning_quantity_max: null,
      warning_unit: null,
      drug_store_id: 1500,
      main_cost: "0",
      pre_cost: "0",
      current_cost: "50000",
      unit_id: 21,
      unit_name: "L\u1ecd",
      other_units:
        '[{"unit_id": 21, "exchange": 1, "is_basic": "yes", "mfg_date": null, "quantity": 0.0, "main_cost": 0, "unit_name": "L\u1ecd", "current_cost": 50000, "warning_quantity": 0, "manufacturing_date": null}]',
      numbers: null,
    },
  ]);

  const onSubmit = async (e) => {
    e && e.preventDefault();

    setIsSubmit(true);

    // const response = await CampaignService.update();

    // if (response.code == 0) {
    //   // setValueBranch([]);
    //   // setDataDepartment([])
    // } else {
    //   showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    // }

    setIsSubmit(false);
  };

  const loadedOptionProduct = async (search, loadedOptions, { page }) => {
    const param: any = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await ProductService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  avatar: item.avatar,
                };
              })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  useEffect(() => {
    loadedOptionProduct("", [], { page: 1 });
  }, []);

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
              onHide();
            },
          },
          {
            title: "Xác nhận",
            type: "submit",
            color: "primary",
            disabled: false,
            is_loading: isSubmit,
          },
        ],
      },
    }),
    [isSubmit]
  );

  //   const showDialogConfirmCancel = () => {
  //     const contentDialog: IContentDialog = {
  //       color: "warning",
  //       className: "dialog-cancel",
  //       isCentered: true,
  //       isLoading: false,
  //       title: <Fragment>{`Hủy bỏ thao tác ${idData ? "chỉnh sửa" : "thêm mới"}`}</Fragment>,
  //       message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
  //       cancelText: "Quay lại",
  //       cancelAction: () => {
  //         setShowDialog(false);
  //         setContentDialog(null);
  //       },
  //       defaultText: "Xác nhận",
  //       defaultAction: () => {
  //         setShowDialog(false);
  //         setContentDialog(null);
  //       },
  //     };
  //     setContentDialog(contentDialog);
  //     setShowDialog(true);
  //   };

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => !isSubmit && onHide(false)}
        className="modal-add-campaign"
      >
        <form className="form-add-campaign" onSubmit={(e) => onSubmit(e)}>
          <ModalHeader title={"Thêm sản phẩm"} toggle={() => !isSubmit} />
          <ModalBody>
            <div className="form-group">Body</div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </form>
      </Modal>
      {/* <Dialog content={contentDialog} isOpen={showDialog} /> */}
    </Fragment>
  );
}
