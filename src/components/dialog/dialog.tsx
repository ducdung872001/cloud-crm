import React, { Fragment, useEffect, useRef, useState } from "react";
import Button, { ButtonProps } from "components/button/button";
import Icon from "components/icon";
import { Portal } from "react-overlays";
import { fadeOut } from "reborn-util";
import "./dialog.scss";

export interface IDialog {
  content: IContentDialog;
  isOpen: boolean;
}

export interface IContentDialog {
  color?: "success" | "error" | "warning";
  className?: string;
  title: string | React.ReactElement;
  message: string | React.ReactElement;
  isCentered?: boolean;
  cancelText?: string;
  cancelAction?: () => void;
  defaultText: string;
  defaultAction: () => void;
  customButtons?: ButtonProps[];
  isLoading?: boolean;
}

export default function Dialog(props: IDialog) {
  const { content, isOpen } = props;
  const [isShowLoading, setIsShowLoading] = useState<boolean>(false);

  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(content);

  const refDialog = useRef();
  const refDialogBackdrop = useRef();

  useEffect(() => {
    setContentDialog(content);
    setIsShowLoading(false);
    if (isOpen) {
      document.getElementsByTagName("body")[0].style.overflow = "hidden";
      setIsOpenDialog(isOpen);
    } else {
      document.getElementsByTagName("body")[0].style.overflow = "";
      if (refDialog?.current) {
        fadeOut(refDialog.current);
        if (refDialogBackdrop?.current) {
          fadeOut(refDialogBackdrop.current);
        }
        setTimeout(() => {
          setIsOpenDialog(isOpen);
        }, 200);
      } else {
        setIsOpenDialog(isOpen);
      }
    }
    return () => {
      setIsShowLoading(false);
    };
  }, [isOpen, content]);

  return (
    isOpenDialog &&
    contentDialog && (
      <Portal container={document.getElementsByTagName("body")[0]}>
        <Fragment>
          <div
            className={`dialog${contentDialog.isCentered ? " dialog--centered" : ""}${
              contentDialog.color ? " dialog--color-" + contentDialog.color : ""
            }${contentDialog.className ? " " + contentDialog.className : ""}`}
            ref={refDialog}
          >
            <div className="dialog__wrapper">
              <h3 className="d-flex align-items-center">
                {contentDialog.color === "success" ? (
                  <Icon name="CheckedCircle" />
                ) : contentDialog.color === "error" ? (
                  <Icon name="TimesCircle" />
                ) : contentDialog.color === "warning" ? (
                  <Icon name="WarningCircle" />
                ) : (
                  <Icon name="InfoCircle" />
                )}
                {contentDialog.title}
              </h3>
              <div className="dialog__content">{contentDialog.message}</div>
              <div className="dialog__actions">
                <div className="dialog__actions--left">
                  {contentDialog?.customButtons?.map((button, index) => (
                    <Button
                      key={index}
                      type={button.type}
                      autoFocus={button.autoFocus}
                      className={button.className}
                      color={button.color}
                      dataTip={button.dataTip}
                      disabled={button.disabled}
                      hasIcon={button.hasIcon}
                      onClick={button.onClick}
                      onlyIcon={button.onlyIcon}
                      refButton={button.refButton}
                      variant={button.variant}
                    >
                      {button.children}
                    </Button>
                  ))}
                </div>
                <div className="dialog__actions--right">
                  {contentDialog.cancelText && contentDialog.cancelAction !== null && (
                    <Button
                      type="button"
                      color={
                        !contentDialog.color
                          ? "primary"
                          : contentDialog.color === "error"
                          ? "destroy"
                          : contentDialog.color === "warning"
                          ? "warning"
                          : "success"
                      }
                      variant="outline"
                      disabled={isShowLoading}
                      onClick={() => contentDialog.cancelAction()}
                    >
                      {contentDialog.cancelText}
                    </Button>
                  )}
                  <Button
                    type="button"
                    className="btn-default"
                    disabled={isShowLoading}
                    color={
                      !contentDialog.color
                        ? "primary"
                        : contentDialog.color === "error"
                        ? "destroy"
                        : contentDialog.color === "warning"
                        ? "warning"
                        : "success"
                    }
                    onClick={() => {
                      contentDialog.defaultAction();
                      if (contentDialog.isLoading) {
                        setIsShowLoading(true);
                      }
                    }}
                  >
                    {contentDialog.defaultText}
                    {isShowLoading && <Icon name="Loading" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          {document.getElementsByClassName("modal-backdrop").length === 0 && <div className="dialog-backdrop" ref={refDialogBackdrop}></div>}
        </Fragment>
      </Portal>
    )
  );
}
