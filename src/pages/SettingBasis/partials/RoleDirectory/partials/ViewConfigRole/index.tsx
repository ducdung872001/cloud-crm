/* eslint-disable prefer-const */
import React, { useState, useEffect, useMemo, useRef, useContext, Fragment } from "react";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";
import Loading from "components/loading";
import Checkbox from "components/checkbox/checkbox";
import SearchBox from "components/searchBox/searchBox";
import CustomScrollbar from "components/customScrollbar";
import { ModalBody, ModalFooter } from "components/modal/modal";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IActionModal } from "model/OtherModel";
import { IViewConfigDepartmentProps } from "model/department/PropsModel";
import PermissionService from "services/PermissionService";
import { showToast } from "utils/common";
import { ContextType, UserContext } from "contexts/userContext";
import ChooseJobTitleDifferentModal from "./partials/ChooseJobTitleDifferentModal/ChooseJobTitleDifferentModal";
import ChooseDepartmentDifferentModal from "./partials/ChooseDepartmentDifferentModal/ChooseDepartmentDifferentModal";
import "tippy.js/animations/scale.css";
import "./index.scss";
import RolePermissionService from "services/RolePermissionService";

export default function ViewConfigRole(props: IViewConfigDepartmentProps) {
  const { onHide, data } = props;

  console.log("data>>", data);

  const { isCollapsedSidebar } = useContext(UserContext) as ContextType;

  const refBoxConfig = useRef(null);

  const [width, setWidth] = useState(0);
  const [dataRole, setDataRole] = useState<any>([
    {
      id: "",
      name: "",
      position: 1,
    },
  ]);
  const [listFunction, setListFunction] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModalCopyDepartment, setShowModalCopyDepartment] = useState<boolean>(false);

  const [params, setParams] = useState({
    name: "",
  });

  const listOptions = [
    {
      name: "Xem",
      acronym: "V",
    },
    {
      name: "Thêm",
      acronym: "A",
    },
    {
      name: "Sửa",
      acronym: "U",
    },
    {
      name: "Xóa",
      acronym: "D",
    },
    {
      name: "Nhập",
      acronym: "I",
    },
    {
      name: "Xuất",
      acronym: "E",
    },
  ];

  //! đoạn này xử lý vấn đề call API lấy ra các quyền của nhóm quyền
  const getListPermissionRole = async (makeReload: boolean) => {
    makeReload && setIsLoading(true);

    const response = await RolePermissionService.rolePermission(data?.id, params?.name);

    if (response.code === 0) {
      const result = response.result;
      setListFunction(result.items);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    makeReload && setIsLoading(false);
  };

  //* điều kiện call api lấy ra các quyền
  useEffect(() => {
    if (data?.id) {
      getListPermissionRole(true);
    }
    setDataRole([data]);
  }, [data?.id, params?.name]);

  const mapIndex = { VIEW: 0, ADD: 1, UPDATE: 2, DELETE: 3, IMPORT: 4, EXPORT: 5 };
  const revertMapIndex = ["VIEW", "ADD", "UPDATE", "DELETE", "IMPORT", "EXPORT"];

  /**
   * Reload lại quyền cho chính tài khoản hiện tại => Trường hợp phân quyền cho chính mình
   */
  const reloadPermissions = async () => {
    //Lấy và lưu thông tin quyền của người dùng
    const permissionRes = await RolePermissionService.getPermissionResources();
    let lstRolePermissionResource = permissionRes.result;
    let mapPermission = {};
    (lstRolePermissionResource || []).forEach((permissionResource: any) => {
      let actions = JSON.parse(permissionResource.actions);
      actions.forEach((action: any) => {
        mapPermission[`${permissionResource.code}_${action}`] = 1;
      });
    });

    // console.log("permissions =>", JSON.stringify(mapPermission));
    localStorage.setItem("permissions", JSON.stringify(mapPermission));
  };

  //! đoạn này xử lý vấn đề thêm quyền cho một nhóm quyền
  const getPermissionDepartmentAdd = async (resourceId, actions) => {
    const body = {
      roleId: data?.id,
      resourceId: resourceId,
      actions: JSON.stringify(actions),
    };

    const response = await RolePermissionService.permissionRoleAdd(body);

    if (response.code === 0) {
      showToast("Thêm quyền thành công", "success");

      //Load lại quyền cho tài khoản này => Để test luôn
      reloadPermissions();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  //! đoạn này xử lý vấn đề xóa đi 1 quyền cho nhóm quyền
  const getPermissionDepartmentDelete = async (resourceId, actions) => {
    const body = {
      roleId: data?.id,
      resourceId: resourceId,
      actions: JSON.stringify(actions),
    };

    const response = await RolePermissionService.permissionRoleDelete(body);

    if (response.code === 0) {
      showToast("Gỡ quyền thành công", "success");

      //Load lại quyền cho tài khoản này => Để test luôn
      reloadPermissions();
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  /**
   * Thêm nhiều cùng lúc trên 1 tài nguyên
   * @param resourceId
   * @param dataRole
   * @param actions
   */
  const getPermissionDepartmentAddMulti = async (resourceId, dataRole, actions) => {
    // eslint-disable-next-line prefer-const
    let arrPromise = [];
    dataRole.map(() => {
      const body = {
        roleId: data?.id,
        resourceId: resourceId,
        actions: JSON.stringify(JSON.parse(actions || "[]")),
      };

      // eslint-disable-next-line prefer-const
      let promise = new Promise((resolve, reject) => {
        RolePermissionService.permissionRoleAdd(body).then((res) => {
          resolve(res);
        });
      });
      arrPromise.push(promise);
    });

    Promise.all(arrPromise).then((result) => {
      // console.log("result =>", result);
      showToast("Thêm quyền thành công", "success");

      //Lặp để checked
      dataRole.map((jobTitle) => {
        // eslint-disable-next-line prefer-const
        let arrCheck = Array.prototype.slice.call(
          document.querySelector(`#resource_row_${resourceId}_${jobTitle.id}`).querySelectorAll('input[type="checkbox"]')
        );
        (arrCheck || []).map((checkItem) => {
          checkItem.checked = true;
        });
      });
    });

    //Load lại quyền cho tài khoản này => Để test luôn
    reloadPermissions();
  };

  /**
   * Xóa nhiều cùng lúc trên 1 tài nguyên
   * @param resourceId
   * @param jteId
   * @param actions
   */
  const getPermissionDepartmentDeleteMulti = async (resourceId, dataRole, actions) => {
    // eslint-disable-next-line prefer-const
    let arrPromise = [];
    dataRole.map((jobTitle, idx) => {
      const body = {
        departmentId: data?.id,
        resourceId: resourceId,
        jteId: jobTitle.id,
        actions: JSON.stringify(JSON.parse(actions || "[]")),
      };

      // eslint-disable-next-line prefer-const
      let promise = new Promise((resolve, reject) => {
        RolePermissionService.permissionRoleDelete(body).then((res) => {
          resolve(res);
        });
      });

      arrPromise.push(promise);
    });

    Promise.all(arrPromise).then((result) => {
      // console.log("result =>", result);
      showToast("Gỡ quyền thành công", "success");

      //Lặp để unchecked
      dataRole.map((jobTitle) => {
        // eslint-disable-next-line prefer-const
        let arrCheck = Array.prototype.slice.call(
          document.querySelector(`#resource_row_${resourceId}_${jobTitle.id}`).querySelectorAll('input[type="checkbox"]')
        );
        (arrCheck || []).map((checkItem) => {
          checkItem.checked = false;
        });
      });
    });

    //Load lại quyền cho tài khoản này => Để test luôn
    reloadPermissions();
  };

  /**
   * Thêm nhiều cùng lúc trên 1 phân hệ
   * @param resourceId
   * @param dataRole
   */
  const getPermissionModuleAddMulti = async (resources, dataRole) => {
    // eslint-disable-next-line prefer-const
    if (resources == null || resources.length == 0) {
      return;
    }

    // eslint-disable-next-line prefer-const
    let arrPromise = [];
    resources.map((resource, idxResource) => {
      dataRole.map((jobTitle, idx) => {
        const body = {
          roleId: data?.id,
          resourceId: resource.id,
          actions: JSON.stringify(JSON.parse(resource?.actions || "[]")),
        };

        // eslint-disable-next-line prefer-const
        let promise = new Promise((resolve, reject) => {
          RolePermissionService.permissionRoleAdd(body).then((res) => {
            resolve(res);
          });
        });
        arrPromise.push(promise);
      });

      //Lặp để checked
      dataRole.map((jobTitle) => {
        // eslint-disable-next-line prefer-const
        let arrCheck = Array.prototype.slice.call(
          document.querySelector(`#resource_row_${resource.id}_${jobTitle.id}`).querySelectorAll('input[type="checkbox"]')
        );
        (arrCheck || []).map((checkItem) => {
          checkItem.checked = true;
        });
      });
    });

    Promise.all(arrPromise).then((result) => {
      // console.log("result =>", result);
      showToast("Thêm quyền thành công", "success");
    });

    //Load lại quyền cho tài khoản này => Để test luôn
    reloadPermissions();
  };

  /**
   * Xóa nhiều cùng lúc trên 1 phân hệ
   * @param resources
   * @param jteId
   */
  const getPermissionModuleDeleteMulti = async (resources, dataRole) => {
    if (resources == null || resources.length == 0) {
      return;
    }

    // eslint-disable-next-line prefer-const
    let arrPromise = [];
    resources.map((resource, idxResource) => {
      dataRole.map(() => {
        const body = {
          roleId: data?.id,
          resourceId: resource.id,
          actions: JSON.stringify(JSON.parse(resource?.actions || "[]")),
        };

        // eslint-disable-next-line prefer-const
        let promise = new Promise((resolve, reject) => {
          RolePermissionService.permissionRoleDelete(body).then((res) => {
            resolve(res);
          });
        });

        arrPromise.push(promise);
      });

      //Lặp để unchecked
      dataRole.map((jobTitle) => {
        // eslint-disable-next-line prefer-const
        let arrCheck = Array.prototype.slice.call(
          document.querySelector(`#resource_row_${resource.id}_${jobTitle.id}`).querySelectorAll('input[type="checkbox"]')
        );
        (arrCheck || []).map((checkItem) => {
          checkItem.checked = false;
        });
      });
    });

    Promise.all(arrPromise).then((result) => {
      // console.log("result =>", result);
      showToast("Gỡ quyền thành công", "success");
    });

    //Load lại quyền cho tài khoản này => Để test luôn
    reloadPermissions();
  };

  //! đoạn này xử lý vấn đề lấy ra chiều rộng của cấu hình
  useEffect(() => {
    setWidth(refBoxConfig.current.offsetWidth);

    // to handle page resize
    const getwidth = () => {
      setWidth(refBoxConfig.current.offsetWidth);
    };

    window.addEventListener("resize", getwidth);

    return () => window.removeEventListener("resize", getwidth);
  }, []);

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
            },
          },
        ],
      },
    }),
    []
  );

  return (
    <div ref={refBoxConfig} className="view__config--role">
      <div className="title__config">
        {`Cấu hình cho ${data?.name}`}
        <Tippy content="Sao chép quyền từ nhóm quyền khác" placement="left" delay={[120, 100]} animation="scale">
          <span
            className="icon__copy--department"
            onClick={(e) => {
              e.preventDefault();
              setShowModalCopyDepartment(true);
            }}
          >
            <Icon name="Copy" />
          </span>
        </Tippy>
      </div>
      <ModalBody>
        <CustomScrollbar width="100%" height="57rem">
          <div className="wrapper__decentralization">
            {!isLoading && listFunction && dataRole && listFunction.length > 0 && dataRole.length > 0 ? (
              <div className="decentralization__department">
                <div className="header__decentralization">
                  <div className={`header__decentralization--item department__permission--0 special`}>
                    <span className="name__function">Chức năng</span>
                    <SearchBox params={params} updateParams={(paramsNew) => setParams(paramsNew)} />
                  </div>
                  {dataRole.map((item, idx) => (
                    <div key={idx} className={`header__decentralization--item department__permission--${dataRole.length}`}>
                      <div className="name--title">{item.name}</div>
                      <div className="list__option--permission">
                        {listOptions.map((element, idx) => {
                          return dataRole.length >= 4 && width <= 1363 ? (
                            <Tippy key={idx} content={element.name} delay={[120, 100]} animation="scale">
                              <span className="option__permission--item">{element.acronym}</span>
                            </Tippy>
                          ) : (
                            <span key={idx} className="option__permission--item">
                              {element.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="body__decentralization">
                  {listFunction.map((item, idx) => (
                    <div key={idx} className="body__decentralization--item">
                      <div className="decentralization__item separation">
                        <div className={`name-function ${item.parentId === null || item.parentId === 0 ? "lv-1" : "lv-2"}`}>
                          <Checkbox
                            label={item.name}
                            onClick={(e) => {
                              if (e.target.checked) {
                                //Add
                                getPermissionModuleAddMulti(item?.lstResource, dataRole);
                              } else if (e.target.checked === false) {
                                //Remove
                                getPermissionModuleDeleteMulti(item?.lstResource, dataRole);
                              }
                            }}
                          />
                        </div>
                      </div>

                      {item.lstResource.length > 0 &&
                        item.lstResource.map((element, idx) => {
                          return (
                            <div key={idx} className={`decentralization__item resource--item`}>
                              <div
                                className={`department__permission--0  ${
                                  item.parentId === null || item.parentId === 0 ? "lv__children" : "lv__sub--children"
                                }`}
                              >
                                <Checkbox
                                  label={element.name}
                                  onClick={(e) => {
                                    if (e.target.checked) {
                                      //Add
                                      getPermissionDepartmentAddMulti(element.id, dataRole, element.actions);
                                    } else if (e.target.checked === false) {
                                      //Remove
                                      getPermissionDepartmentDeleteMulti(element.id, dataRole, element.actions);
                                    }
                                  }}
                                />
                              </div>
                              {element?.lstRolePermission.map((permission, subIdxPermission) => {
                                const mapData = ["", "", "", "", "", ""];
                                const checked = JSON.parse(permission?.actions ? permission.actions : "[]");
                                JSON.parse(element?.actions ? element.actions : "[]").map((box) => {
                                  mapData[mapIndex[box]] = checked.includes(box);
                                });

                                return (
                                  <div
                                    key={`idx_${subIdxPermission}`}
                                    id={`resource_row_${element.id}_${permission.roleId}`}
                                    className={`permission__check department__permission--${dataRole.length}`}
                                  >
                                    {mapData.map((dataItem: any, idxBox) => {
                                      return dataItem === false || dataItem === true ? (
                                        <div key={`idx_box_${idxBox}`} className="item__check--permission">
                                          <Checkbox
                                            defaultChecked={dataItem}
                                            onClick={(e) => {
                                              if (e.target.checked) {
                                                //Add
                                                getPermissionDepartmentAdd(element.id, [revertMapIndex[idxBox]]);
                                              } else if (e.target.checked === false) {
                                                //Remove
                                                getPermissionDepartmentDelete(element.id, [revertMapIndex[idxBox]]);
                                              }
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        <div key={`idx_box_${idxBox}`} className="item__check--permission">
                                          &nbsp;
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                    </div>
                  ))}
                </div>
              </div>
            ) : isLoading ? (
              <Loading />
            ) : (
              <Fragment>
                <SystemNotification
                  description={
                    <span>
                      Nhóm quyền hiện tại của bạn chưa cấu hình chức danh nào. <br />
                      Vui lòng thêm chức danh cho nhóm quyền này trước khi thực hiện phân quyền.
                    </span>
                  }
                  type="no-item"
                />
              </Fragment>
            )}
          </div>
        </CustomScrollbar>
      </ModalBody>
      <ModalFooter actions={actions} />
      <ChooseDepartmentDifferentModal
        onShow={showModalCopyDepartment}
        sourceDepartmentId={data?.id}
        nameDepartment={data?.name}
        listJobTitleProps={dataRole}
        onHide={(reload) => {
          if (reload) {
            getListPermissionRole(true);

            //Load lại quyền cho tài khoản này => Để test luôn
            reloadPermissions();
          }
          setShowModalCopyDepartment(false);
        }}
      />
    </div>
  );
}
