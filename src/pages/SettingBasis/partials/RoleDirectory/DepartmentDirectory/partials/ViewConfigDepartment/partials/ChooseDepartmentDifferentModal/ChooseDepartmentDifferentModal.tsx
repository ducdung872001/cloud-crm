import React, { Fragment, useState, useEffect, useMemo } from "react";
import { IActionModal } from "model/OtherModel";
import { IPermissionCloneRequest } from "model/permission/PermissionRequestModel";
import { IChooseDepartmentDifferentModalProps } from "model/department/PropsModel";
import Loading from "components/loading";
import Radio from "components/radio/radio";
import Checkbox from "components/checkbox/checkbox";
import CustomScrollbar from "components/customScrollbar";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import DepartmentService from "services/DepartmentService";
import PermissionService from "services/PermissionService";
import { showToast } from "utils/common";
import "./ChooseDepartmentDifferentModal.scss";

export default function ChooseDepartmentDifferentModal(props: IChooseDepartmentDifferentModalProps) {
  const { onShow, onHide, sourceDepartmentId, nameDepartment, listJobTitleProps } = props;

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [listDepartmentDifferent, setListDepartmentDifferent] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [idDepartmentDifferent, setIdDepartmentDifferent] = useState<number>(null);
  const [listJobTitles, setListJobTitles] = useState([]);
  const [idJobTitle, setIdJobTitle] = useState<number>(null);
  const [listIdCheckedJobTitleProps, setListIdCheckedJobTitleProps] = useState<number[]>([]);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);

  const getListDepartmentDifferent = async () => {
    setIsLoading(true);

    const response = await DepartmentService.list();

    if (response.code === 0) {
      const result = (response.result || []).filter((item) => item.id !== sourceDepartmentId);
      setListDepartmentDifferent(result);
    }

    setIsLoading(false);
  };

  //! đoạn này xử lý vấn đề call api lấy ra danh sách phòng ban
  //  khác với phòng ban được chi định
  useEffect(() => {
    if (onShow && sourceDepartmentId) {
      getListDepartmentDifferent();
    }
  }, [onShow, sourceDepartmentId]);

  //! đoạn này xử lý vấn đề lấy ra chi tiết 1 phòng ban
  const getDetailDepartmentDifferent = async () => {
    const response = await PermissionService.permissionDepartment(idDepartmentDifferent);

    if (response.code === 0) {
      const result = response.result.jobTitles;
      setListJobTitles(result);
    }
  };

  useEffect(() => {
    if (idDepartmentDifferent) {
      getDetailDepartmentDifferent();
    }
  }, [idDepartmentDifferent]);

  //! đoạn này xử lý vấn đề chọn hết quyền cho chức danh trong phòng ban
  const checkAll = (isChecked: boolean) => {
    if (isChecked) {
      setListIdCheckedJobTitleProps &&
        setListIdCheckedJobTitleProps(
          listJobTitleProps.map((i) => {
            return i.id;
          })
        );
    } else {
      setListIdCheckedJobTitleProps && setListIdCheckedJobTitleProps([]);
    }
  };

  //! đoạn này xử lý vấn đề chọn quyền cho từng chức danh trong phòng ban
  const checkOne = (id: number, isChecked: boolean) => {
    if (isChecked) {
      setListIdCheckedJobTitleProps && setListIdCheckedJobTitleProps([...(listIdCheckedJobTitleProps ?? []), id]);
    } else {
      setListIdCheckedJobTitleProps && setListIdCheckedJobTitleProps(listIdCheckedJobTitleProps?.filter((i) => i !== id) ?? []);
    }
  };

  //? đoạn này xử lý vấn đề gửi dữ liệu đi
  const onSubmit = async () => {
    setIsSubmit(true);

    const body: IPermissionCloneRequest = {
      sourceDepartmentId: idDepartmentDifferent,
      sourceJteId: idJobTitle,
      targetDepartmentId: sourceDepartmentId,
      targetLstJteId: listIdCheckedJobTitleProps,
    };

    const response = await PermissionService.permissionClone(body);

    if (response.code === 0) {
      showToast("Sao chép quyền cho phòng ban thành công", "success");
      setIsSubmit(false);
      setIdDepartmentDifferent(null);
      setIdJobTitle(null);
      setListIdCheckedJobTitleProps([]);
      onHide(true);

      
    } else {
      setIsSubmit(false);
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const showDialogConfirmCancel = () => {
    const contentDialog: IContentDialog = {
      color: "warning",
      className: "dialog-cancel",
      isCentered: true,
      isLoading: false,
      title: <Fragment>Hủy bỏ thao tác sao chép phòng ban khác</Fragment>,
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

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Hủy",
            color: "primary",
            variant: "outline",
            callback: () => {
              idDepartmentDifferent ? showDialogConfirmCancel() : onHide(false);
            },
          },
          {
            title: "Xác nhận",
            type: "submit",
            color: "primary",
            disabled: idDepartmentDifferent && idJobTitle && listIdCheckedJobTitleProps.length > 0 ? false : true,
            is_loading: isSubmit,
            callback: () => {
              onSubmit();
            },
          },
        ],
      },
    }),
    [idDepartmentDifferent, idJobTitle, listIdCheckedJobTitleProps, isSubmit]
  );

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide(false)} className="modal-copy-department">
        <div className="form__copy--department">
          <ModalHeader title="Chọn phòng ban cần sao chép" toggle={() => !isSubmit && onHide(false)} />
          <ModalBody>
            <CustomScrollbar width="100%" height="45rem">
              <div className="copy__department">
                <div className="choose__department">
                  <h4 className="list--department">Danh sách phòng ban</h4>
                  {!isLoading && listDepartmentDifferent.length > 0 ? (
                    listDepartmentDifferent.map((item, idx) => {
                      return (
                        <div
                          key={idx}
                          className="department__item"
                          onClick={(e) => {
                            e.preventDefault();
                            setIdDepartmentDifferent(item.id);
                          }}
                        >
                          <Radio
                            checked={item.id === idDepartmentDifferent}
                            label={item.name}
                            onChange={(e) => {
                              // đoạn này thêm ông onChange để nó đỡ báo lỗi
                            }}
                          />

                          {item.id === idDepartmentDifferent ? (
                            <div className="list__job--title">
                              {listJobTitles.map((element, idx) => {
                                return (
                                  <div
                                    key={idx}
                                    className="job__title--item"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setIdJobTitle(element.id);
                                    }}
                                  >
                                    <Radio
                                      checked={element.id === idJobTitle}
                                      label={element.title}
                                      onChange={(e) => {
                                        // đoạn này thêm ông onChange để nó đỡ báo lỗi
                                      }}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <Loading />
                  )}
                </div>
                <div className="department__nominated">
                  <h4 className="name--department">{`Sao chép quyền đến phòng: ${nameDepartment}`}</h4>

                  <div className="list__jobtitle--props">
                    {listJobTitleProps.length > 1 ? (
                      <div className="check__all--jobtitle">
                        <Checkbox
                          label="Tất cả"
                          indeterminate={listIdCheckedJobTitleProps?.length > 0 && listIdCheckedJobTitleProps?.length < listJobTitleProps.length}
                          checked={listIdCheckedJobTitleProps?.length === listJobTitleProps.length}
                          onChange={(e) => checkAll(e.target.checked)}
                        />
                      </div>
                    ) : (
                      ""
                    )}
                    {listJobTitleProps.map((item, idx) => {
                      const isChecked =
                        listIdCheckedJobTitleProps && setListIdCheckedJobTitleProps && listIdCheckedJobTitleProps.some((id) => id === item.id)
                          ? true
                          : false;

                      return (
                        <div key={idx} className="check__one--jobtitle">
                          <Checkbox checked={isChecked} label={item.title} onChange={(e) => checkOne(item.id, e.target.checked)} />
                        </div>
                      );
                    })}
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
