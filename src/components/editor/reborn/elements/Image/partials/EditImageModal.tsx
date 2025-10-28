import React, { Fragment, useMemo, useState, useEffect } from "react";
import { IActionModal } from "model/OtherModel";
import { IEditImageModal } from "model/editor/PropsModel";
import NummericInput from "components/input/numericInput";
import CustomScrollbar from "components/customScrollbar";
import Input from "components/input/input";
import RadioList from "components/radio/radioList";
import Checkbox from "components/checkbox/checkbox";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { getMeta } from "reborn-util";
import "./EditImageModal.scss";

/**
 * Chỉnh sửa một ảnh, cho phép cập nhật link ảnh trong đây
 * @param props
 * @returns
 */
export default function EditImageModal(props: IEditImageModal) {
  const { onShow, onHide, onUpdate } = props;

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [keepRatio, setKeepRatio] = useState<boolean>(true);
  const [usePercent, setUsePercent] = useState<boolean>(false);
  const [heightAuto, setHeightAuto] = useState<boolean>(false);
  const [widthAuto, setWidthAuto] = useState<boolean>(false);

  //Dùng kích thước ảnh gốc không?
  const [useNatural, setUseNatural] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const [naturalWidth, setNaturalWidth] = useState<number>(1);
  const [naturalHeight, setNaturalHeight] = useState<number>(1);

  //1 - Thay đổi chiều rộng, 2 - thay đổi chiều cao
  const [focusDimension, setFocusDimention] = useState<number>(1);

  const [newUrl, setNewUrl] = useState<string>("");
  const [width, setWidth] = useState<number | string>(0);
  const [height, setHeight] = useState<number | string>(0);
  const [desc, setDesc] = useState<string>("");
  const [link, setLink] = useState<string>(""); //Link ảnh
  const [imgAlign, setImgAlign] = useState<string>("left");
  const [ratio, setRatio] = useState(0);

  useEffect(() => {
    setDesc(props?.desc || "");
    setLink(props?.link || "");
    setHeight(props?.height || 0);
    setWidth(props?.width || 0);
    setImgAlign(props?.imgAlign || "center");
    setNewUrl(props?.image || "");

    if (props?.height == "auto") {
      setHeightAuto(true);
      setUseNatural(false);
    }

    if (props?.width == "auto") {
      setWidthAuto(true);
      setUseNatural(false);
    }
  }, [props]);

  useEffect(() => {
    //Đọc ra kích cỡ ảnh tự nhiên
    if (newUrl) {
      getMeta(newUrl, (err, img) => {
        setNaturalWidth(img.naturalWidth);
        setNaturalHeight(img.naturalHeight);
        setRatio(img.naturalWidth / img.naturalHeight);
      });
    }
  }, [newUrl]);

  /**
   * Thay đổi chiều ngược lại
   */
  useEffect(() => {
    if (typeof height != "string") {
      if (focusDimension == 2) {
        if (keepRatio) {
          setWidth(Math.round(height * ratio));
        }
      }

      let isNatural = height == naturalHeight && width == naturalWidth;
      setUseNatural(isNatural);
    }
  }, [height]);

  useEffect(() => {
    if (typeof width != "string") {
      if (focusDimension == 1) {
        if (keepRatio) {
          setHeight(Math.round(width / ratio));
        }
      }

      let isNatural = height == naturalHeight && width == naturalWidth;
      setUseNatural(isNatural);
    }
  }, [width]);

  useEffect(() => {
    if (widthAuto) {
      setWidth("auto");
      setKeepRatio(false);
      setUseNatural(false);
    } else {
      setWidth(naturalWidth);
    }
  }, [widthAuto]);

  useEffect(() => {
    if (heightAuto) {
      setHeight("auto");
      setKeepRatio(false);
      setUseNatural(false);
    } else {
      setHeight(naturalHeight);
    }
  }, [heightAuto]);

  useEffect(() => {
    if (keepRatio) {
      if (usePercent) {
        setWidth(naturalWidth);
        setHeight(naturalHeight);
      }
      setUsePercent(false);
    }
  }, [keepRatio]);

  const listPostion = [
    {
      value: "left",
      label: "Căn trái",
    },
    {
      value: "center",
      label: "Căn giữa",
    },
    {
      value: "right",
      label: "Căn phải",
    },
  ];

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            callback: () => {
              imgAlign !== "basic" || desc.length > 0 ? showDialogConfirmCancel() : onHide();
            },
          },
          {
            title: "Cập nhật",
            type: "submit",
            color: "primary",
            callback: () => {
              onUpdate(newUrl, link, usePercent ? `${width}%` : width, usePercent ? `${height}%` : height, desc, imgAlign);
              onHide();
            },
          },
        ],
      },
    }),
    [width, height, desc, imgAlign, newUrl, link, usePercent]
  );

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>{`Hủy bỏ thao tác chỉnh sửa`}</Fragment>,
      message: <Fragment>Bạn có chắc chắn muốn hủy bỏ? Thao tác này không thể khôi phục.</Fragment>,
      cancelText: "Quay lại",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xác nhận",
      defaultAction: () => {
        onHide();
        setShowDialog(false);
        setContentDialog(null);
      },
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide()} className="modal-edit-image">
        <div className="form-edit-prev-img">
          <ModalHeader
            title="Chỉnh sửa hình ảnh"
            toggle={() => {
              onHide();
            }}
          />
          <ModalBody>
            <CustomScrollbar width="100%" height="48rem">
              <div className="wrapper__edit--img">
                <div className="box__prev">
                  <label>Xem trước</label>
                  <div className="prev__img">
                    <div className={`prev-item prev-item--${imgAlign}`}>
                      {imgAlign === "center" && (
                        <p className="content-top">Lorem Ipsum is simply dummy text of the printing and typesetting the industry.</p>
                      )}
                      <div className={`img-item ${imgAlign}-img`}>
                        <img src={newUrl} alt="img-prev" />
                      </div>
                      {imgAlign !== "center" && (
                        <p className="content__in--img">
                          There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by
                          injected humour, or randomised words which look even slightly believable. If you are going to use a passage of Lorem Ipsum.
                        </p>
                      )}
                    </div>
                    <p className="content--bottom">
                      {imgAlign !== "center"
                        ? "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout."
                        : "It is a long established fact that a reader will be distracted by the some content."}
                    </p>
                  </div>
                </div>

                <div className="list__option--align">
                  <div className="form-group">
                    <div className="option__img--align">
                      <RadioList
                        name="imgAlign"
                        title="Vị trí ảnh"
                        options={listPostion}
                        value={imgAlign}
                        onChange={(e) => setImgAlign(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <Input
                      fill={true}
                      name="newUrl"
                      label="Đường dẫn ảnh"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="Nhập đường dẫn ảnh"
                    />
                  </div>
                  <div className="form-group">
                    <Input
                      fill={true}
                      name="link"
                      label="Liên kết ảnh"
                      value={link}
                      onChange={(e) => {
                        setLink(e.target.value);
                      }}
                      placeholder="Nhập liên kết ảnh"
                    />
                  </div>
                  <div className="form-group">
                    <Input
                      fill={true}
                      name="desc"
                      label="Mô tả ảnh"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="Nhập mô tả ảnh"
                    />
                  </div>
                  <div className="form-group">
                    <div className="change__img--align">
                      <div className="align-width">
                        {!widthAuto ? (
                          <NummericInput
                            fill={true}
                            name="width"
                            label={`Chiều rộng ảnh (${usePercent ? "%" : "px"})`}
                            value={width}
                            onFocus={() => setFocusDimention(1)}
                            onValueChange={(e) => {
                              setWidth(e.floatValue);
                            }}
                            placeholder="Nhập chiều rộng ảnh"
                          />
                        ) : (
                          <Input fill={true} name="width" label="Chiều rộng ảnh" value={"auto"} disabled={true} />
                        )}
                      </div>
                      <div className="align-height">
                        {!heightAuto ? (
                          <NummericInput
                            fill={true}
                            name="height"
                            label={`Chiều cao ảnh (${usePercent ? "%" : "px"})`}
                            value={height}
                            onFocus={() => setFocusDimention(2)}
                            onValueChange={(e) => setHeight(e.floatValue)}
                            placeholder="Nhập chiều cao ảnh"
                          />
                        ) : (
                          <Input fill={true} name="height" label="Chiều cao ảnh" value={"auto"} disabled={true} />
                        )}
                      </div>
                    </div>
                    <div className="change__checkbox">
                      <Checkbox
                        checked={keepRatio}
                        label="Giữ tỉ lệ hình ảnh"
                        onChange={() => {
                          setKeepRatio(!keepRatio);
                        }}
                      />
                      <Checkbox
                        checked={widthAuto}
                        label="Chiều rộng tự động"
                        onChange={() => {
                          setWidthAuto(!widthAuto);
                        }}
                      />
                      <Checkbox
                        checked={heightAuto}
                        label="Chiều cao tự động"
                        onChange={() => {
                          setHeightAuto(!heightAuto);
                        }}
                      />
                    </div>
                    <div className="change__checkbox">
                      <Checkbox
                        checked={useNatural}
                        label="Dùng kích thước ảnh gốc"
                        onChange={() => {
                          setWidth(naturalWidth);
                          setHeight(naturalHeight);
                          setUsePercent(false);
                          setHeightAuto(false);
                          setWidthAuto(false);
                        }}
                      />
                      <Checkbox
                        checked={usePercent}
                        label="Dùng tỉ lệ %"
                        onChange={() => {
                          if (typeof width == "number" && width > 100) {
                            setWidth(100);
                            setKeepRatio(false);
                          }

                          if (typeof height == "number" && height > 100) {
                            setHeight(100);
                            setKeepRatio(false);
                          }

                          setUsePercent(!usePercent);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CustomScrollbar>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
      <Dialog content={contentDialog} isOpen={showDialog} />
    </Fragment>
  );
}
