import React, { Fragment, useEffect, useState } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Image from "components/image";
import Loading from "components/loading";
import Input from "components/input/input";
import Button from "components/button/button";
import TextArea from "components/textarea/textarea";
import NummericInput from "components/input/numericInput";
import SelectCustom from "components/selectCustom/selectCustom";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { showToast } from "utils/common";
import InventoryService from "services/InventoryService";
import ChooseProduct from "./ChooseProduct/ChooseProduct";

import "./AddTransferOrderForm.scss";

export default function AddTransferOrderForm(props) {
  const { onShow, onHide, id } = props;

  const [lstProducts, setLstProducts] = useState([]);
  const [lstBatchNoProduct, setLstBatchNoProduct] = useState<string[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [dataInventoryOrg, setDataInventoryOrg] = useState(null);
  const [dataInventoryArrive, setDataInventoryArrive] = useState(null);
  const [dataOrgProducts, setDataOrgProducts] = useState([]);
  const [isLoadingAddItem, setIsLoadingAddItem] = useState<boolean>(false);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [formData, setFormData] = useState(null);

  // đoạn này xử lý kho hàng
  const loadedOptionInventoryOrg = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await InventoryService.list(param);

    if (response.code === 0) {
      const dataOption = response.result;

      let changeDataOption = [];

      if (dataInventoryArrive) {
        changeDataOption = dataOption.filter((item) => item.id !== dataInventoryArrive.value);
      } else {
        changeDataOption = dataOption;
      }

      return {
        options: [
          ...(changeDataOption.length > 0
            ? changeDataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
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

  const loadedOptionInventoryArrive = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await InventoryService.list(param);

    if (response.code === 0) {
      const dataOption = response.result;

      let changeDataOption = [];

      if (dataInventoryOrg) {
        changeDataOption = dataOption.filter((item) => item.id !== dataInventoryOrg.value);
      } else {
        changeDataOption = dataOption;
      }

      return {
        options: [
          ...(changeDataOption.length > 0
            ? changeDataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
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

  const handleChangeValueInventoryOrg = (e) => {
    setDataInventoryOrg(e);
  };

  const handleChangeValueInventoryArrive = (e) => {
    setDataInventoryArrive(e);
  };

  const handAdjustmentSlipTemp = async (inventoryId) => {
    if (!inventoryId) return;
  };

  // Gửi dữ liệu đi
  const onSubmitForm = async (e) => {
    e.preventDefault();
    setIsSubmit(true);
  };

  const showDialogConfirmConfirm = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-warning",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Quay lại...</Fragment>,
      message: (
        <Fragment>
          Hiện tại phiếu của bạn đang có sự thay đổi. Bạn có muốn <strong>quay lại</strong>? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        onHide(false);
        // xóa hết dữ liệu đi
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const handleChangeValueReason = (e, idx) => {
    const value = e.target.value;

    setLstProducts((preState) =>
      preState.map((item, index) => {
        if (index === idx) {
          return { ...item, reason: value };
        }

        return item;
      })
    );
  };

  const handleChangeValueQuanlityAffter = (e, idx) => {
    const value = e.floatValue;

    setLstProducts((preState) =>
      preState.map((item, index) => {
        if (index === idx) {
          return { ...item, quanlityAffter: value };
        }

        return item;
      })
    );
  };

  const handRemoveProItem = (idx) => {
    const newData = [...lstProducts];
    newData.splice(idx, 1);

    setLstProducts(newData);
  };

  const handleAddItemPro = (e) => {
    e.preventDefault();
    setShowModalAdd(true);
  };

  const handChangeDataProps = (data) => {
    const converData = data.map((item) => {
      return {
        id: item.productId,
        inventoryId: item.inventoryId,
        productAvatar: item.productAvatar,
        productName: item.productName,
        inventoryName: item.inventoryName,
        unitName: item.unitName,
        reason: "",
        quanlityBefor: item.quantity,
        quanlityAffter: "",
      };
    });

    setLstProducts(converData);
  };

  const handClearForm = () => {
    setLstProducts([]);
    setDataInventoryOrg(null);
    setDataOrgProducts([]);
    setFormData(null);
  };

  return (
    <div className="wrapper__add-transfer--order">
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              dataInventoryOrg || dataInventoryArrive || lstProducts.length > 0 ? showDialogConfirmConfirm() : !isSubmit && onHide(false);
            }}
            className="title-first"
            title="Quay lại"
          >
            Phiếu điều chuyển kho
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              dataInventoryOrg || dataInventoryArrive || lstProducts.length > 0 ? showDialogConfirmConfirm() : onHide(false);
            }}
          />
          <h1 className="title-last">{`${id ? "Chỉnh sửa" : "Thêm mới"} phiếu`}</h1>
        </div>
        <Button
          type="button"
          disabled={isSubmit}
          onClick={() => (dataInventoryOrg || dataInventoryArrive || lstProducts.length > 0 ? showDialogConfirmConfirm() : onHide(false))}
        >
          Quay lại
        </Button>
      </div>

      <form className="box__transfer--order" onSubmit={(e) => onSubmitForm(e)}>
        <div className="card-box d-flex flex-column info__top">
          <label className="title--info">Kho hàng</label>

          <div className="dept__inventory">
            <div className="form-group">
              <SelectCustom
                key={dataInventoryArrive?.value?.toString()}
                id="inventoryOrg"
                name="inventoryOrg"
                label="Từ kho"
                fill={true}
                options={[]}
                required={true}
                value={dataInventoryOrg}
                onChange={(e) => handleChangeValueInventoryOrg(e)}
                isAsyncPaginate={true}
                loadOptionsPaginate={loadedOptionInventoryOrg}
                placeholder="Chọn từ kho hàng"
                additional={{
                  page: 1,
                }}
              />
            </div>

            <div className="form-group">
              <SelectCustom
                key={dataInventoryOrg?.value?.toString()}
                id="inventoryArrive"
                name="inventoryArrive"
                label="Đến kho"
                fill={true}
                options={[]}
                required={true}
                value={dataInventoryArrive}
                onChange={(e) => handleChangeValueInventoryArrive(e)}
                isAsyncPaginate={true}
                loadOptionsPaginate={loadedOptionInventoryArrive}
                placeholder="Chọn đến kho hàng"
                additional={{
                  page: 1,
                }}
                disabled={!dataInventoryOrg}
              />
            </div>
          </div>
        </div>

        <div className="card-box d-flex flex-column info__body">
          <div className="header__action">
            <ul className="header__action--title">
              <li className="item-title">Danh sách hàng hóa cần chuyển kho</li>
            </ul>
          </div>

          <div className="box__product">
            {!isLoading && lstProducts && lstProducts.length > 0 ? (
              <div className="lst__product--item">
                {lstProducts.map((item, idx) => {
                  return (
                    <div key={idx} className="product-item">
                      <div className="avtar-pro">
                        <label className="name-ava">Ảnh sản phẩm</label>
                        <div className="ava">
                          <Image src={item.productAvatar} alt={item.productName} />
                        </div>
                      </div>

                      <div className="dept__content">
                        <div className="form-group">
                          <Input id="inventory" name="inventory" label="Kho hàng" fill={true} value={item.inventoryName} disabled />
                        </div>

                        <div className="form-group">
                          <Input name="name" id="name" label="Tên sản phẩm" fill={true} value={item.productName} disabled />
                        </div>
                        <div className="form-group">
                          <Input name="unit" id="unit" label="Đơn vị tính" fill={true} value={item.unitName} disabled />
                        </div>
                        <div className="form-group">
                          <NummericInput
                            name="quanlityBefor"
                            id="quanlityBefor"
                            label="Số lượng thực tế"
                            fill={true}
                            value={item.quanlityBefor}
                            disabled
                          />
                        </div>
                        <div className="form-group">
                          <NummericInput
                            name="quanlityAffter"
                            id="quanlityAffter"
                            label="Số lượng chuyển kho"
                            placeholder="Nhập số lượng chuyển kho"
                            fill={true}
                            value={item.quanlityAffter}
                            onValueChange={(e) => handleChangeValueQuanlityAffter(e, idx)}
                          />
                        </div>
                        <div className="form-group">
                          <Input
                            name="reason"
                            id="reason"
                            label="Lý do điều chỉnh"
                            fill={true}
                            value={item.reason}
                            placeholder="Nhập lý do điều chỉnh"
                            onChange={(e) => handleChangeValueReason(e, idx)}
                          />
                        </div>
                      </div>
                      <div className="action__delete--item" onClick={() => handRemoveProItem(idx)}>
                        <div className="icon-remove">
                          <Icon name="Times" />
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="action__add--item--large">
                  <Button variant="outline" disabled={isSubmit} onClick={(e) => handleAddItemPro(e)}>
                    <Icon name="PlusCircleFill" />
                    Thêm sản phẩm
                  </Button>
                </div>
              </div>
            ) : isLoading ? (
              <Loading />
            ) : (
              <SystemNotification
                description={
                  <span>
                    Hiện tại chưa có sản phẩm cần chuyển kho nào. <br />
                    Hãy thêm mới sản phẩm cần chuyển kho đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới sản phẩm cần chuyển kho"
                disabled={!dataInventoryOrg && !dataInventoryArrive}
                action={() => {
                  setShowModalAdd(true);
                }}
              />
            )}
          </div>
        </div>

        <div className="card-box d-flex flex-column info__bottom">
          <label className="title--info">Nội dung điều chuyển kho</label>

          <div className="content-adjust">
            <div className="form-group">
              <TextArea
                name="adjust"
                value={formData?.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                fillColor={true}
                placeholder="Nhập nội dung cần điều chuyển kho"
              />
            </div>
          </div>

          <div className="action__submit--form">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmit}
              onClick={() => (dataInventoryOrg || dataInventoryArrive || lstProducts.length > 0 ? showDialogConfirmConfirm() : onHide(false))}
            >
              Quay lại
            </Button>

            <Button type="submit" disabled={lstProducts.length === 0 || isSubmit}>
              {id ? "Chỉnh sửa" : "Thêm mới"}
              {isSubmit && <Icon name="Loading" />}
            </Button>
          </div>
        </div>
      </form>
      <ChooseProduct
        onShow={showModalAdd}
        onHide={(reload) => {
          if (reload) {
            handAdjustmentSlipTemp(dataInventoryOrg.value);
          }
          setShowModalAdd(false);
        }}
        lstBatchNoProduct={lstBatchNoProduct}
        inventory={dataInventoryOrg}
        takeData={(data) => handChangeDataProps(data)}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
