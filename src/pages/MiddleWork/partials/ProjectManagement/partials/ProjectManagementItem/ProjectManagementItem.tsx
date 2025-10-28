import React, { Fragment, useState, useEffect, useRef } from "react";
import Icon from "components/icon";
import { IProjectManagementItemProps } from "model/workProject/PropsModel";
import { IWorkProjectResponseModel } from "model/workProject/WorkProjectResponseModel";
import { useOnClickOutside } from "utils/hookCustom";
import AddChildProjectModal from "./partials/AddChildProjectModal";
import ViewProjectManagementModal from "../ViewProjectManagementModal";
import WorkProjectService from "services/WorkProjectService";
import "./ProjectManagementItem.scss";

export default function ProjectManagementItem(props: any) {
  const {
    data,
    idProjectManagement,
    setIdProjectManagement,
    setShowModalAdd,
    showDialogConfirmDelete,
    onReload,
    isShowChildrenProject,
    setIsShowChildrenProject,
    isShowChildren,
    listProject,
    setListProject,
  } = props;

  const refEditProject = useRef();
  const refContainerProject = useRef();

  const refEditProjectChild = useRef();
  const refContainerProjectChild = useRef();

  const [isActive, setIsActive] = useState<boolean>(false);
  const [isActiveChild, setIsActiveChild] = useState<boolean>(false);
  const [showModalAddProject, setShowModalAddProject] = useState<boolean>(false);
  const [showModalViewProject, setShowModalViewProject] = useState<boolean>(false);
  const [listProjectChildren, setListProjectChildren] = useState<IWorkProjectResponseModel[]>([]);
  const [idProjectChildren, setIdProjectChildren] = useState<number>(null);

  const [idLvOne, setIdLvOne] = useState<number>(null);

  useOnClickOutside(refEditProject, () => setIsActive(false), ["actions-edit-remove"]);
  useOnClickOutside(refEditProjectChild, () => setIsActiveChild(false), ["actions-edit-remove"]);

  data.parentId = data?.parentId || 0;

  const getDetailProject = async (id: number) => {
    if (!id) return;

    const param = {
      parentId: id,
    };

    const response = await WorkProjectService.list(param);

    if (response.code === 0) {
      const result = response.result.items;
      if (result.length > 0) {
        setListProjectChildren([...result]);
      } else {
        setListProjectChildren([]);
      }
    }
  };

  useEffect(() => {
    if (isShowChildren && data?.id === idProjectManagement) {
      getDetailProject(idProjectManagement);
    }
  }, [isShowChildren, data, idProjectManagement]);

  console.log("isShowChildren", isShowChildren);
  console.log("listProject", listProject);
  console.log("listProjectChildren", listProjectChildren);

  return (
    <Fragment>
      {data.parentId === 0 && (
        <Fragment>
          <div className="project-management-item">
            <div
              className={`project__management-lv1 ${data?.id === idProjectManagement ? "active__project-management" : ""}`}
              onClick={() => {
                setIdProjectManagement(data?.id);
              }}
            >
              <div
                className="folder-project-management"
                onClick={() => {
                  //TODO: đoạn này có time cần xem lại chút
                  // setIsShowChildrenProject(!isShowChildrenProject);
                  setListProject({
                    ...listProject,
                    items: listProject.items.map((item) => {
                      if (item.id === data.id) {
                        item.isShow = !item.isShow;
                      } else {
                        item.isShow = false;
                      }
                      return item;
                    }),
                  });
                }}
              >
                <Icon name="FolderOpen" />
                <span className="name--project">{data.name}</span>
              </div>
              <div
                className={`actions-edit-remove ${isActive ? "active__item--option" : ""}`}
                onClick={() => {
                  setIsActive(!isActive);
                }}
                ref={refContainerProject}
              >
                <Icon name="ThreeDotVertical" />

                {isActive && data?.id === idProjectManagement && (
                  <ul className="menu-action-project" ref={refEditProject}>
                    <li
                      className="view-project-item"
                      onClick={() => {
                        setIsActive(false);
                        setIdProjectManagement(data?.id);
                        setShowModalViewProject(true);
                      }}
                    >
                      <Icon name="Eye" />
                      Xem chi tiết
                    </li>
                    <li
                      className="add-project-item"
                      onClick={() => {
                        setIsActive(false);
                        setIdLvOne(data?.id);
                        setIdProjectChildren(null);
                        setShowModalAddProject(true);
                      }}
                    >
                      <Icon name="PlusCircleFill" />
                      Thêm dự án
                    </li>
                    <li
                      className="edit-project-item"
                      onClick={() => {
                        setIsActive(false);
                        setShowModalAdd(true);
                        setIdProjectManagement(data?.id);
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

            {isShowChildren &&
              listProjectChildren.length > 0 &&
              listProjectChildren.map((item, idx) => {
                return (
                  <div key={idx} className={`project__management-lv2 ${idProjectChildren === item?.id ? "active__project-management--lv2" : ""}`}>
                    <div
                      className="name__product-lv2"
                      onClick={(e) => {
                        setIdProjectChildren(item?.id);
                        setIdProjectManagement(item?.id);
                      }}
                    >
                      <Icon name="ChevronDoubleRight" />
                      <span className="name-project--child">{item.name}</span>
                    </div>
                    <div
                      className={`actions-edit-remove-child ${isActiveChild ? "active__item-child--option" : ""}`}
                      onClick={() => {
                        setIsActiveChild(!isActiveChild);
                        setIdProjectChildren(item?.id);
                        setIdProjectManagement(item?.id);
                        setIdLvOne(data?.id);
                      }}
                      ref={refContainerProjectChild}
                    >
                      <Icon name="ThreeDotVertical" />

                      {isActiveChild && item.id === idProjectChildren && (
                        <ul className="menu-action-project-child" ref={refEditProjectChild}>
                          <li
                            className="view-project-item"
                            onClick={() => {
                              setIsActiveChild(false);
                              // setIdProjectChildren(item?.id);
                              setIdProjectManagement(item?.id);
                              setShowModalViewProject(true);
                            }}
                          >
                            <Icon name="Eye" />
                            Xem chi tiết
                          </li>
                          <li
                            className="edit-project-item"
                            onClick={() => {
                              setIsActiveChild(false);
                              setIdProjectChildren(item?.id);
                              setIdProjectManagement(item?.id);
                              setShowModalAddProject(true);
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
              })}
          </div>
        </Fragment>
      )}
      <AddChildProjectModal
        onShow={showModalAddProject}
        idProject={idProjectChildren}
        idProjectManagement={idLvOne}
        callBack={(isCallback) => {
          if (isCallback) {
            onReload(true);
            // setIsShowChildrenProject(true);
            // getDetailProject(idLvOne);
          }
          setShowModalAddProject(false);
        }}
      />
      <ViewProjectManagementModal
        onShow={showModalViewProject}
        idProjectManagement={idProjectManagement}
        onHide={() => setShowModalViewProject(false)}
      />
    </Fragment>
  );
}
