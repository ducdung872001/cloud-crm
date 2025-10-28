import React, { Fragment, useState, useEffect, useMemo } from "react";
import _ from "lodash";
import { IActionModal, IAction } from "model/OtherModel";
import { IShowModalSubsystemProps } from "model/subsystemAdministration/PropsModel";
import { IFreeResourceFilterRequest, IFunctionalManagementFilterRequest } from "model/functionalManagement/FunctionalManagementRequest";
import { IAddModuleResourceRequest } from "model/subsystemAdministration/SubsystemAdministrationRequest";
import Icon from "components/icon";
import SearchBox from "components/searchBox/searchBox";
import CustomScrollbar from "components/customScrollbar";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { showToast } from "utils/common";
import FunctionalManagementService from "services/FunctionalManagementService";
import SubsystemAdministrationService from "services/SubsystemAdministrationService";
import "./index.scss";

export default function ShowModalSubsystem(props: IShowModalSubsystemProps) {
  const { onShow, onHide, takePosition, setTakePosition, currentPosition, data } = props;

  //* đoạn này lấy ra danh sách tài nguyên thuộc 1 phân hệ
  const [listResource, setListResource] = useState([]);
  const [idResource, setIdResource] = useState<number>(null);
  const [isLoadingResource, setIsLoadingResource] = useState<boolean>(false);
  const [paramResource, setParamResource] = useState<IFunctionalManagementFilterRequest>({
    name: "",
    app: ""
  });

  //! đoạn này xử lý vấn đề cập nhật lại state paramResource
  useEffect(() => {
    if (takePosition.moduleId) {
      setParamResource({ ...paramResource, moduleId: takePosition.moduleId });
    }
  }, [takePosition]);

  //? đoạn này call api lấy ra danh sách tài nguyên thuộc 1 phân hệ
  const getListResource = async () => {
    setIsLoadingResource(true);
    const response = await FunctionalManagementService.list(paramResource);

    if (response.code === 0) {
      const result = response.result.items;
      setListResource(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoadingResource(false);
  };

  //! đoạn này check điều kiện call api tài nguyên thuộc 1 phân hệ
  useEffect(() => {
    if (takePosition.moduleId) {
      getListResource();
    }
  }, [paramResource]);

  //! đoạn này cập nhập lại biến paramResource mỗi lần gõ vào ô tìm kiếm
  useEffect(() => {
    const paramsTemp = _.cloneDeep(paramResource);
    setParamResource((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  // ---------------- 🎉🎉 đoạn này xử lý vấn đề lấy ra danh sách chưa thuộc phân hệ nào 🎉🎉 -------------------- //

  //* đoạn này call api chưa thuộc phân hệ nào
  const [listFreeResource, setListFreeResource] = useState([]);
  const [idFreeResource, setIdFreeResource] = useState<number>(null);
  const [isLoadingFreeResource, setIsLoadingFreeResource] = useState<boolean>(false);
  const [paramFreeResource, setParamFreeResource] = useState<IFreeResourceFilterRequest>({
    name: "",
    app: ""
  });

  useEffect(() => {
    setParamFreeResource({ ...paramFreeResource, app: data?.app });
    setParamResource({ ...paramResource, app: data?.app });
  }, [data])

  //? đoạn này call api lấy ra danh sách chưa thuộc phân hệ nào
  const getListFreeResource = async () => {
    setIsLoadingFreeResource(true);

    const response = await FunctionalManagementService.freeResource(paramFreeResource);

    if (response.code === 0) {
      const result = response.result.items;
      setListFreeResource(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoadingFreeResource(false);
  };

  //! đoạn này kiểm tra điều kiện call api lấy ra danh sách chưa thuộc phân hệ nào
  useEffect(() => {
    if (onShow) {
      getListFreeResource();
    }
  }, [onShow, paramFreeResource]);

  //! đoạn này cập nhập lại biến paramFreeResource mỗi lần gõ vào ô tìm kiếm
  useEffect(() => {
    const paramsTemp = _.cloneDeep(paramFreeResource);
    setParamFreeResource((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  //? đoạn này xử lý vấn đề chuyển 1 phân hệ tự do sang 1 phân hệ
  const transferRightToLeft = async () => {
    if (idFreeResource == null) {
      return showToast("Bạn chưa chọn phân hệ", "warning");
    }

    const body: IAddModuleResourceRequest = {
      moduleId: takePosition.moduleId,
      resourceId: idFreeResource,
    };

    const response = await SubsystemAdministrationService.addModuleResource(body);

    if (response.code === 0) {
      showToast("Chuyển phân hệ thành công", "success");
      getListResource();
      getListFreeResource();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  //? đoạn này xử lý vấn đề chuyển 1 phân hệ sang phân hệ tự do
  const transferLeftToRight = async () => {
    if (idResource == null) {
      return showToast("Bạn chưa chọn phân hệ", "warning");
    }

    const response = await SubsystemAdministrationService.removeModuleResource(takePosition.moduleId, idResource);

    if (response.code === 0) {
      showToast("Chuyển phân hệ thành công", "success");
      getListResource();
      getListFreeResource();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => {
              onHide(false);
              setIdFreeResource(null);
              setIdResource(null);
            },
          },
          ...(currentPosition !== takePosition?.moduleId
            ? ([
              {
                title: "Quay lại",
                color: "primary",
                variant: "outline",
                callback: () => {
                  setTakePosition({ ...takePosition, index: takePosition.index - 1 });
                },
              },
            ] as IAction[])
            : []),
          {
            title: "Xem tiếp",
            type: "submit",
            color: "primary",
            disabled: takePosition.index == takePosition.lstIdModule[takePosition.lstIdModule.length - 1],
            callback: () => {
              setTakePosition({ ...takePosition, index: takePosition.index + 1 });
            },
          },
        ],
      },
    }),
    [takePosition, currentPosition]
  );

  useEffect(() => {
    setTakePosition({ ...takePosition, moduleId: takePosition.lstIdModule[takePosition.index] });
  }, [takePosition.index]);

  return (
    <Fragment>
      <Modal isFade={true} isOpen={onShow} isCentered={true} staticBackdrop={true} toggle={() => onHide(false)} className="modal-show-subsystem">
        <div className="wrapper-show-subsystem">
          <ModalHeader
            title="Danh sách chức năng"
            toggle={() => {
              onHide(false);
              setIdFreeResource(null);
              setIdResource(null);
            }}
          />
          <ModalBody>
            <div className="list__convert">
              <div className="list__resource">
                <div className="list__resource--header">
                  <SearchBox name="Tên" params={paramResource} updateParams={(paramsNew) => setParamResource(paramsNew)} />
                </div>
                <CustomScrollbar width="100%" height="27rem">
                  <div className="list__resource--body">
                    {listResource.map((item, idx) => (
                      <div
                        key={idx}
                        className={`item-resource ${idResource === item.id ? "active__item--resource" : ""}`}
                        onClick={() => setIdResource(item.id)}
                      >
                        {item.name}
                      </div>
                    ))}
                  </div>
                </CustomScrollbar>
              </div>

              <div className="transshipment">
                <div className="transit-left" onClick={() => transferLeftToRight()}>
                  <Icon name="ChevronDoubleRight" />
                </div>
                <div className="transit-right" onClick={() => transferRightToLeft()}>
                  <Icon name="ChevronDoubleLeft" />
                </div>
              </div>

              <div className="list__freeresource">
                <div className="list__freeresource--header">
                  <SearchBox name="Tên" params={paramFreeResource} updateParams={(paramsNew) => setParamFreeResource(paramsNew)} />
                </div>
                <CustomScrollbar width="100%" height="27rem">
                  <div className="list__freeresource--body">
                    {listFreeResource.map((item, idx) => (
                      <div
                        key={idx}
                        className={`item-freeresource ${idFreeResource === item.id ? "active__item--freeresource" : ""}`}
                        onClick={() => setIdFreeResource(item.id)}
                      >
                        {item.name}
                      </div>
                    ))}
                  </div>
                </CustomScrollbar>
              </div>
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
    </Fragment>
  );
}
