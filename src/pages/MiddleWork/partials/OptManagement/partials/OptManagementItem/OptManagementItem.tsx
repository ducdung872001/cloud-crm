import React, { Fragment, useState, useEffect, useRef } from "react";
import Icon from "components/icon";
import { IOptManagementItemProps } from "model/workOpt/PropsModel";
import { IWorkOptResponseModel } from "model/workOpt/WorkOptResponseModel";
import { useOnClickOutside } from "utils/hookCustom";
import AddChildOptModal from "./partials/AddChildOptModal";
import ViewOptManagementModal from "../ViewOptManagementModal";
import CampaignOpportunityService from "services/CampaignOpportunityService";
import "./OptManagementItem.scss";

export default function OptManagementItem(props: IOptManagementItemProps) {
  const { data, idOptManagement, setIdOptManagement, setShowModalAdd, showDialogConfirmDelete, onReload, isShowChildrenOpt, setIsShowChildrenOpt } =
    props;

  const refEditOpt = useRef();
  const refContainerOpt = useRef();

  const refEditOptChild = useRef();
  const refContainerOptChild = useRef();

  const [isActive, setIsActive] = useState<boolean>(false);
  const [isActiveChild, setIsActiveChild] = useState<boolean>(false);
  const [showModalAddOpt, setShowModalAddOpt] = useState<boolean>(false);
  const [showModalViewOpt, setShowModalViewOpt] = useState<boolean>(false);
  const [listOptChildren, setListOptChildren] = useState<IWorkOptResponseModel[]>([]);
  const [idOptChildren, setIdOptChildren] = useState<number>(null);

  const [idLvOne, setIdLvOne] = useState<number>(null);

  useOnClickOutside(refEditOpt, () => setIsActive(false), ["actions-edit-remove"]);
  useOnClickOutside(refEditOptChild, () => setIsActiveChild(false), ["actions-edit-remove"]);

  data.parentId = data?.parentId || 0;

  const getDetailOpt = async (id: number) => {
    if (!id) return;

    // const param = {
    //   parentId: id,
    // };

    const response = await CampaignOpportunityService.detail(id);

    if (response.code === 0) {
      const result = response.result.items;
      setListOptChildren([...result]);
    }
  };

  useEffect(() => {
    if (isShowChildrenOpt && data?.id === idOptManagement) {
      // getDetailOpt(idOptManagement);
    }
  }, [isShowChildrenOpt, data, idOptManagement]);

  return (
    <Fragment>
      {data.parentId === 0 && (
        <Fragment>
          <div className="project-management-item">
            <div
              className={`project__management-lv1 ${data?.id === idOptManagement ? "active__project-management" : ""}`}
              onClick={() => {
                setIdOptManagement(data?.id);
              }}
            >
              <div
                className="folder-project-management"
                onClick={() => {
                  //TODO: đoạn này có time cần xem lại chút
                  setIsShowChildrenOpt(!isShowChildrenOpt);
                }}
              >
                <Icon name="OpportunityManagement" />
                <span className="name--project">
                  {data.type === "per"
                    ? data.customerName
                    : data.customerName +
                      (data.opportunity && data.opportunity.productName
                        ? " - " + data.opportunity.productName
                        : data.opportunity && data.opportunity.serviceName
                        ? " - " + data.opportunity.serviceName
                        : "")}
                </span>
              </div>
              <div
                className={`actions-edit-remove ${isActive ? "active__item--option" : ""}`}
                onClick={() => {
                  setIsActive(!isActive);
                }}
                ref={refContainerOpt}
              >
                <Icon name="ThreeDotVertical" />

                {isActive && data?.id === idOptManagement && (
                  <ul className="menu-action-project" ref={refEditOpt}>
                    <li
                      className="view-project-item"
                      onClick={() => {
                        setIsActive(false);
                        setIdOptManagement(data?.id);
                        setShowModalViewOpt(true);
                      }}
                    >
                      <Icon name="Eye" />
                      Xem chi tiết
                    </li>
                    {/* <li
                      className="add-project-item"
                      onClick={() => {
                        setIsActive(false);
                        setIdLvOne(data?.id);
                        setIdOptChildren(null);
                        setShowModalAddOpt(true);
                      }}
                    >
                      <Icon name="PlusCircleFill" />
                      Thêm cơ hội
                    </li> */}
                    <li
                      className="edit-project-item"
                      onClick={() => {
                        setIsActive(false);
                        setShowModalAdd(true);
                        setIdOptManagement(data?.id);
                      }}
                    >
                      <Icon name="Pencil" />
                      Sửa
                    </li>
                    <li
                      className="remove-project-item"
                      onClick={() => {
                        showDialogConfirmDelete(data);
                      }}
                    >
                      <Icon name="Trash" />
                      Xóa
                    </li>
                  </ul>
                )}
              </div>
            </div>

            {/* {isShowChildrenOpt &&
              listOptChildren.length > 0 &&
              listOptChildren.map((item, idx) => {
                return (
                  <div key={idx} className={`project__management-lv2 ${idOptChildren === item?.id ? "active__project-management--lv2" : ""}`}>
                    <div
                      className="name__product-lv2"
                      onClick={(e) => {
                        setIdOptChildren(item?.id);
                        setIdOptManagement(item?.id);
                      }}
                    >
                      <Icon name="ChevronDoubleRight" />
                      <span className="name-project--child">{item.name}</span>
                    </div>
                    <div
                      className={`actions-edit-remove-child ${isActiveChild ? "active__item-child--option" : ""}`}
                      onClick={() => {
                        setIsActiveChild(!isActiveChild);
                        setIdOptChildren(item?.id);
                        setIdOptManagement(item?.id);
                        setIdLvOne(data?.id);
                      }}
                      ref={refContainerOptChild}
                    >
                      <Icon name="ThreeDotVertical" />

                      {isActiveChild && item.id === idOptChildren && (
                        <ul className="menu-action-project-child" ref={refEditOptChild}>
                          <li
                            className="view-project-item"
                            onClick={() => {
                              setIsActiveChild(false);
                              // setIdOptChildren(item?.id);
                              setIdOptManagement(item?.id);
                              setShowModalViewOpt(true);
                            }}
                          >
                            <Icon name="Eye" />
                            Xem chi tiết
                          </li>
                          <li
                            className="edit-project-item"
                            onClick={() => {
                              setIsActiveChild(false);
                              setIdOptChildren(item?.id);
                              setIdOptManagement(item?.id);
                              setShowModalAddOpt(true);
                            }}
                          >
                            <Icon name="Pencil" />
                            Sửa
                          </li>
                          <li
                            className="remove-project-item"
                            onClick={() => {
                              showDialogConfirmDelete(item);
                            }}
                          >
                            <Icon name="Trash" />
                            Xóa
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })} */}
          </div>
        </Fragment>
      )}
      <AddChildOptModal
        onShow={showModalAddOpt}
        idOpt={idOptChildren}
        idOptManagement={idLvOne}
        callBack={(isCallback) => {
          if (isCallback) {
            onReload(true);
            // setIsShowChildrenOpt(true);
            // getDetailOpt(idLvOne);
          }
          setShowModalAddOpt(false);
        }}
      />
      <ViewOptManagementModal
        onShow={showModalViewOpt}
        idProjectManagement={0}
        idOptManagement={idOptManagement}
        onHide={() => setShowModalViewOpt(false)}
      />
    </Fragment>
  );
}
