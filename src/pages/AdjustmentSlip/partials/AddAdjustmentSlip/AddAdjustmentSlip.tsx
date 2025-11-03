import React, { Fragment, useEffect, useState } from "react";
import _ from "lodash";
import { IAddAdjustmentSlipProps } from "model/adjustmentSlip/PropsModel";
import { IAdjustmentSlipRequest } from "model/adjustmentSlip/AdjustmentSlipRequestModel";
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
import AdjustmentSlipService from "services/AdjustmentSlipService";
import ChooseProduct from "./partials/ChooseProduct/ChooseProduct";
import "./AddAdjustmentSlip.scss";

export default function AddAdjustmentSlip(props: IAddAdjustmentSlipProps) {
  const { onShow, onHide, id } = props;

  const [lstProducts, setLstProducts] = useState([]);
  const [lstBatchNoProduct, setLstBatchNoProduct] = useState<string[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [dataInventory, setDataInventory] = useState(null);
  const [satId, setSatId] = useState<number>(null);
  const [dataOrgProducts, setDataOrgProducts] = useState([]);
  const [isLoadingAddItem, setIsLoadingAddItem] = useState<boolean>(false);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [formData, setFormData] = useState(null);

  const getDetailDataAdjustmentSlip = async (id: number) => {
    isLoadingAddItem && setIsLoading(true);

    const response = await AdjustmentSlipService.view(id);

    if (response.code === 0) {
      const result = response.result;
      if (result?.stockAdjust && result?.stockAdjustDetails) {
        setFormData(result);
        setDataInventory({
          value: result.stockAdjust.inventoryId,
          label: result.stockAdjust.inventoryName,
        });
      }
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }

    isLoadingAddItem && setIsLoading(false);
  };

  useEffect(() => {
    if (onShow && id) {
      getDetailDataAdjustmentSlip(id);
    }
  }, [onShow, id]);

  const handClearForm = () => {
    setLstProducts([]);
    setSatId(null);
    setDataInventory(null);
    setDataOrgProducts([]);
    setFormData(null);
  };

  const handAdjustmentSlipTemp = async (inventoryId) => {
    setIsLoading(true);

    const response = await AdjustmentSlipService.temp(inventoryId);

    if (response.code === 0) {
      const result = response.result;
      setFormData(result);
      setSatId(result.satId);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (formData && onShow) {
      const changeDataPro = [...formData?.stockAdjustDetails].map((item) => {
        return {
          ...item,
          inventoryName: formData?.stockAdjust?.inventoryName,
        };
      });

      setLstProducts(changeDataPro);
      setDataOrgProducts(changeDataPro);
    }
  }, [formData, onShow]);

  // đoạn này xử lý kho hàng
  const loadedOptionInventory = async (search, loadedOptions, { page }) => {
    const param = {
      name: search,
      page: page,
      limit: 10,
    };

    const response = await InventoryService.list(param);

    if (response.code === 0) {
      const dataOption = response.result;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  address: item.address,
                  branchName: item.branchName,
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

  const handleChangeValueInventory = (e) => {
    setDataInventory(e);
    setLstProducts([]);
    handAdjustmentSlipTemp(e.value);
  };

  // đoạn này xử lý số lượng
  const handleChangeValueQuanlity = (e, idx) => {
    const value = e.floatValue;

    setLstProducts((preState) =>
      preState.map((item, index) => {
        if (index === idx) {
          return { ...item, availQty: value, offsetQty: value - dataOrgProducts[idx]["availQty"] || 0 };
        }

        return item;
      })
    );
  };

  // đoạn này xử lý do điều chỉnh
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

  // xóa đi 1 sản phẩm
  const handRemoveProItem = async (id: number) => {
    const response = await AdjustmentSlipService.deletePro(id);

    if (response.code === 0) {
      showToast("Xóa sản phẩm thành công", "success");
      setIsLoadingAddItem(true);
      handAdjustmentSlipTemp(dataInventory.value);
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    const takeIdPro = lstProducts.map((item) => item.batchNo);
    setLstBatchNoProduct(takeIdPro);
  }, [lstProducts]);

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
        setLstProducts([]);
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const checkChangePro = _.isEqual(lstProducts, dataOrgProducts);

  //! đoạn này thêm mới sản phẩm sẽ check xem nếu như sản phẩm thay đổi thì call api update
  const handleAddItemPro = async (e) => {
    e.preventDefault();

    const arrayPromise = [];

    if (!checkChangePro) {
      [...lstProducts].map((item) => {
        const promise = new Promise((resolve, reject) => {
          AdjustmentSlipService.addUpdatePro(item).then((res) => resolve(res));
        });

        arrayPromise.push(promise);
      });

      Promise.all(arrayPromise).then((result) => {
        if (result.length > 0) {
          //TODO: đoạn này nghĩ ra thông báo sau
          handAdjustmentSlipTemp(dataInventory.value);
        } else {
          //TODO: đoạn này nghĩ ra cảnh báo sau
        }
      });
    }
    setIsLoadingAddItem(false);
    setShowModalAdd(true);
  };

  //? gửi dữ liệu đi
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    setIsSubmit(true);

    const arrayPromise = [];

    if (!checkChangePro) {
      [...lstProducts].map((item) => {
        const promise = new Promise((resolve, reject) => {
          AdjustmentSlipService.addUpdatePro(item).then((res) => resolve(res));
        });

        arrayPromise.push(promise);
      });

      Promise.all(arrayPromise).then(async (result) => {
        if (result.length > 0) {
          handAdjustmentSlipTemp(dataInventory.value);

          const body: IAdjustmentSlipRequest = {
            id: formData?.stockAdjust?.id,
            inventoryId: dataInventory?.value,
          };

          const response = await AdjustmentSlipService.createAdjSlip(body);

          if (response.code === 0) {
            setIsSubmit(false);
            showToast(`${id ? "Chỉnh sửa" : "Thêm mới"} phiếu thành công`, "success");
            handClearForm();
            onHide(true);
          } else {
            setIsSubmit(false);
            showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
          }
        } else {
          showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
          setIsSubmit(false);
        }
      });
    } else {
      const body: IAdjustmentSlipRequest = {
        id: formData?.stockAdjust?.id,
        inventoryId: dataInventory?.value,
      };

      const response = await AdjustmentSlipService.createAdjSlip(body);

      if (response.code === 0) {
        setIsSubmit(false);
        showToast(`${id ? "Chỉnh sửa" : "Thêm mới"} phiếu thành công`, "success");
        handClearForm();
        onHide(true);
      } else {
        setIsSubmit(false);
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    }
  };

  return (
    <div className="wrapper__add--adjustment--slip">
      <div className="action-navigation">
        <div className="action-backup">
          <h1
            onClick={() => {
              dataInventory || lstProducts.length > 0 ? showDialogConfirmConfirm() : !isSubmit && onHide(false);
            }}
            className="title-first"
            title="Quay lại"
          >
            Phiếu điều chỉnh kho
          </h1>
          <Icon
            name="ChevronRight"
            onClick={() => {
              dataInventory || lstProducts.length > 0 ? showDialogConfirmConfirm() : onHide(false);
            }}
          />
          <h1 className="title-last">{`${id ? "Chỉnh sửa" : "Thêm mới"} phiếu`}</h1>
        </div>
        <Button
          type="button"
          disabled={isSubmit}
          onClick={() => (dataInventory || lstProducts.length > 0 ? showDialogConfirmConfirm() : onHide(false))}
        >
          Quay lại
        </Button>
      </div>

      <form className="box__adjustment--slip" onSubmit={(e) => handleSubmitForm(e)}>
        <div className="card-box d-flex flex-column info__top">
          <label className="title--info">Thông tin kho hàng</label>

          <div className="dept__inventory">
            <div className="form-group">
              <SelectCustom
                id="inventory"
                name="inventory"
                label="Kho hàng"
                fill={true}
                options={[]}
                required={true}
                value={dataInventory}
                onChange={(e) => handleChangeValueInventory(e)}
                isAsyncPaginate={true}
                loadOptionsPaginate={loadedOptionInventory}
                placeholder="Chọn kho hàng"
                additional={{
                  page: 1,
                }}
              />
            </div>

            <div className="form-group">
              <Input
                name="address"
                id="address"
                fill={true}
                label="Địa chỉ kho"
                value={dataInventory?.address || ""}
                placeholder="Chọn kho hàng để xem địa chỉ"
                disabled
              />
            </div>

            <div className="form-group">
              <Input
                name="branchName"
                id="branchName"
                fill={true}
                label="Chi nhánh kho"
                value={dataInventory?.branchName || ""}
                placeholder="Chọn kho hàng để xem chi nhánh"
                disabled
              />
            </div>
          </div>
        </div>

        <div className="card-box d-flex flex-column info__body">
          <div className="header__action">
            <ul className="header__action--title">
              <li className="item-title">Danh sách hàng hóa cần điều chỉnh</li>
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
                        <div className="form-group">
                          <NummericInput
                            name="quantity"
                            id="quantity"
                            label="Số lượng thực tế"
                            fill={true}
                            value={item.availQty}
                            onValueChange={(e) => handleChangeValueQuanlity(e, idx)}
                          />
                        </div>
                        <div className="form-group">
                          <Input name="discrepancy" id="discrepancy" label="Số lượng lệch" fill={true} value={item.offsetQty} disabled />
                        </div>
                      </div>
                      <div className="action__delete--item" onClick={() => handRemoveProItem(item.id)}>
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
                    Hiện tại chưa có sản phẩm cần điều chỉnh nào. <br />
                    Hãy thêm mới sản phẩm cần điều chỉnh đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới sản phẩm cần điều chỉnh"
                disabled={!dataInventory}
                action={() => {
                  setShowModalAdd(true);
                }}
              />
            )}
          </div>
        </div>

        <div className="card-box d-flex flex-column info__bottom">
          {/* <label className="title--info">Nội dung điều chỉnh</label>

          <div className="content-adjust">
            <div className="form-group">
              <TextArea
                name="adjust"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                fill={true}
                placeholder="Nhập nội dung cần điều chỉnh"
              />
            </div>
          </div> */}

          <div className="action__submit--form">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmit}
              onClick={() => (dataInventory || lstProducts.length > 0 ? showDialogConfirmConfirm() : onHide(false))}
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
            handAdjustmentSlipTemp(dataInventory.value);
          }
          setShowModalAdd(false);
        }}
        lstBatchNoProduct={lstBatchNoProduct}
        satId={satId}
        inventory={dataInventory}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
