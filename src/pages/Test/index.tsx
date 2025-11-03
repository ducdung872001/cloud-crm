import React, { useState, useMemo, Fragment } from "react";
import _ from "lodash";
import { Responsive, WidthProvider } from "react-grid-layout";
import { v4 as uuidv4 } from "uuid";
import Tippy from "@tippyjs/react";

import Icon from "components/icon";
import Input from "components/input/input";
import Button from "components/button/button";
import { ModalFooter } from "components/modal/modal";
import { IActionModal } from "model/OtherModel";

import ModalTypeForm from "./partials/ModalTypeForm/ModalTypeForm";
import ModalTypeBell from "./partials/ModalTypeBell/ModalTypeBell";
import ModalTypeSignature from "./partials/ModalTypeSignature/ModalTypeSignature";
import ModalFieldOption from "./partials/ModalFieldOption/ModalFieldOption";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./index.scss";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const toolboxItems = [
  {
    name: "Biểu mẫu",
    type: "form",
    w: 3,
    h: 3,
    icon: <Icon name="Article" />,
    layout: <div></div>,
  },
  {
    name: "Thông báo",
    type: "bell",
    icon: <Icon name="Bell" />,
    w: 2,
    h: 2,
    layout: (
      <div>
        <Icon name="Bell" />
      </div>
    ),
  },
  {
    name: "Luồng ký",
    type: "signature",
    icon: <Icon name="FingerTouch" />,
    w: 1,
    h: 1,
    layout: (
      <div>
        <Button>Button</Button>
      </div>
    ),
  },
];

const lstOptionField = [
  {
    name: "Text",
    type: "text",
    w: 4,
    h: 2,
    layout: <div></div>,
  },
  {
    name: "Textarea",
    type: "textarea",
    w: 4,
    h: 2,
    layout: <div></div>,
  },
  {
    name: "Number",
    type: "number",
    w: 4,
    h: 2,
    layout: <div></div>,
  },
  {
    name: "Dropdown",
    type: "dropdown",
    w: 4,
    h: 2,
    layout: <div></div>,
  },
  {
    name: "Multiselect",
    type: "multiselect",
    w: 4,
    h: 2,
    layout: <div></div>,
  },
  {
    name: "Checkbox",
    type: "checkbox",
    w: 4,
    h: 2,
    layout: <div></div>,
  },
  {
    name: "Radio",
    type: "radio",
    w: 4,
    h: 2,
    layout: <div></div>,
  },
  {
    name: "Date",
    type: "date",
    w: 4,
    h: 2,
    layout: <div></div>,
  },
];

const ToolboxItem = ({ toolboxItem, onDragStart, types }) => {
  const { type } = toolboxItem;
  return types === "field" ? (
    <div draggable={true} className="item-field" onDragStart={onDragStart}>
      {toolboxItem.name}
    </div>
  ) : (
    <Tippy key={type} content={toolboxItem.name}>
      <div draggable={true} className="item-plugin" onDragStart={onDragStart}>
        {toolboxItem.icon}
      </div>
    </Tippy>
  );
};

function boxIntersect(box1, box2) {
  return (
    Math.max(box1.x, box2.x) < Math.min(box1.x + box1.w, box2.x + box2.w) && Math.max(box1.y, box2.y) < Math.min(box1.y + box1.h, box2.y + box2.h)
  );
}

function bfs(items, newItem) {
  const q = [newItem];
  const newLayouts = [newItem];
  const visited = {};
  while (q.length) {
    for (let size = q.length; size > 0; --size) {
      const it = q.shift();
      for (const item of items) {
        if (boxIntersect(item, it) && !visited[item.i]) {
          visited[item.i] = true;
          const pushedItem = { ...item, y: it.y + it.h, children: item.children };
          q.push(pushedItem);
          newLayouts.push(pushedItem);
        }
      }
    }
  }
  for (const item of items) {
    if (!visited[item.i]) {
      newLayouts.push(item);
    }
  }

  return newLayouts;
}

export default function Test() {
  document.title = "Test chức năng mới";

  // đoạn này cấu hình tab
  const [configs, setConfigs] = useState([
    {
      title: "Tab 1",
      childrens: [],
      layouts: { lg: [] },
    },
  ]);

  const [idxConfig, setIdxConfig] = useState<number>(0);
  const [isChangeTitleTab, setIsChangeTitleTab] = useState<boolean>(false);

  const handleDeleteConfigItem = (idx) => {
    const newData = [...configs];
    newData.splice(idx, 1);

    setConfigs(newData);

    setIdxConfig(configs.length > idx + 1 ? newData.length - 1 : idx - 1);
  };

  const handleChangeValueName = (e, idx) => {
    const value = e.target.value;

    setConfigs((prev) =>
      prev.map((item, index) => {
        if (idx === index) {
          return {
            ...item,
            title: value,
          };
        }

        return item;
      })
    );
  };

  //! Đoạn này xử lý phức tạp hơn
  const [toolboxItem, setToolboxItem] = useState(null);
  const [breakpoint, setBreakpoint] = useState("lg");
  const [nextId, setNextId] = useState(uuidv4());
  const [typeModal, setTypeModal] = useState("");
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [dataLayout, setDataLayout] = useState(null);

  const dataTabConfig = configs.find((_, idx) => idx === idxConfig);

  const handleDeleteItemChildren = (id) => {
    const newLayouts = _.cloneDeep(dataTabConfig.layouts);
    newLayouts[breakpoint] = newLayouts[breakpoint].filter((item) => item.i !== id);

    setConfigs((prev) =>
      prev.map((item, idx) => {
        if (idx === idxConfig) {
          return {
            ...item,
            layouts: newLayouts,
            childrens: item.childrens.filter((child) => child.key !== id),
          };
        }
        return item;
      })
    );
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  const memoizedItems = useMemo(() => {
    return dataTabConfig.layouts[breakpoint].map((item) => {
      return (
        <div key={item.i} className="item__node--layout" onMouseDown={stopPropagation} onTouchStart={stopPropagation}>
          <div className="layout__children">
            <div className="item-render">{item.children}</div>
            <div className="action-children">
              <Tippy content="Sửa">
                <div
                  className="action-children-item action-children-edit"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setTypeModal(item.children.props.datatype);
                    setShowModalAdd(true);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    setTypeModal(item.children.props.datatype);
                    setShowModalAdd(true);
                  }}
                >
                  <Icon name="Pencil" />
                </div>
              </Tippy>

              <Tippy content="Xóa">
                <div
                  className="action-children-item action-children-delete"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleDeleteItemChildren(item.i);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    handleDeleteItemChildren(item.i);
                  }}
                >
                  <Icon name="Trash" />
                </div>
              </Tippy>
            </div>
          </div>
        </div>
      );
    });
  }, [dataTabConfig.layouts, breakpoint]);

  const handleDrop = (layout, item, e) => {
    const { type } = toolboxItem;
    const data = e.dataTransfer.getData("text");
    const newIcon = ["form", "bell", "signature"].includes(type) ? toolboxItems[parseInt(data, 10)] : lstOptionField[parseInt(data, 10)];

    const newLayouts = _.cloneDeep(dataTabConfig.layouts);

    const newItem = {
      ...item,
      type,
      children: newIcon.layout,
      isDraggable: undefined,
      isResizable: undefined,
    };

    Object.keys(newLayouts).forEach((size) => {
      newLayouts[size] = bfs(newLayouts[size], newItem);
    });

    setConfigs((prev) =>
      prev.map((ol, idx) => {
        if (idx === idxConfig) {
          return {
            ...ol,
            layouts: newLayouts,
            childrens: [
              ...ol.childrens,
              // eslint-disable-next-line react/no-unknown-property
              <div key={item.i} datatype={type} style={{ height: "100%" }}>
                {newIcon.layout}
              </div>,
            ],
          };
        }

        return ol;
      })
    );

    setNextId(uuidv4());
    setDataLayout(newItem);

    setShowModalAdd(true);
    setTypeModal(newIcon.type);
  };

  const handleDragStart = (item) => {
    setToolboxItem(item);
  };

  const getDroppingItem = () => {
    if (!toolboxItem) {
      return null;
    }
    return { ...toolboxItem, i: nextId };
  };

  const handleLayoutChange = (layout, layouts) => {
    if (layout.find(({ i }) => i === nextId)) {
      return;
    }

    const newLayouts = _.cloneDeep(layouts);

    Object.keys(newLayouts).forEach((size) => {
      newLayouts[size] = newLayouts[size].map((item, index) => {
        const original = layouts[size] || layouts.lg;
        return { ...original[index], ...item, children: dataTabConfig.childrens.find((el) => el.key === item.i) };
      });
    });

    setConfigs((prev) =>
      prev.map((item, idx) => {
        if (idx === idxConfig) {
          return {
            ...item,
            layouts: newLayouts,
          };
        }

        return item;
      })
    );
  };

  console.log("configs : ", configs);

  const droppingItem = getDroppingItem();

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => {
              //
            },
          },
          {
            title: "Xác nhận",
            type: "submit",
            color: "primary",
            disabled: true,
          },
        ],
      },
    }),
    []
  );

  return (
    <Fragment>
      <div className="page__test card-box">
        <div className="box__bpm">
          <div className="tab__container">
            <div className="lst__tabs">
              {configs.map((item, idx) => {
                return (
                  <div
                    key={idx}
                    className={`item-tab ${idx === idxConfig ? "item-tab--active" : ""} ${configs.length > 1 ? `item-tab--seperate` : ""}`}
                  >
                    <div className="info-tab">
                      <div className="name-tab">
                        {idxConfig === idx && (
                          <span
                            className={`icon-change-tab ${isChangeTitleTab ? "icon-change-tab--active" : ""}`}
                            onClick={() => setIsChangeTitleTab(!isChangeTitleTab)}
                          >
                            <Icon name="Pencil" />
                          </span>
                        )}
                        <Input
                          name="name"
                          value={item.title}
                          fill={true}
                          onChange={(e) => handleChangeValueName(e, idx)}
                          disabled={idx !== idxConfig || !isChangeTitleTab}
                          className="name-customize"
                        />
                        {idx !== idxConfig && <span className="coating-disabled" onClick={() => setIdxConfig(idx)} />}
                      </div>
                      {configs.length > 1 && (
                        <div className="delete-tab" onClick={() => handleDeleteConfigItem(idx)}>
                          <Icon name="Times" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              <div
                className="add__tab"
                onClick={() => {
                  setConfigs([...configs, { title: `Tab ${configs.length + 1}`, childrens: [], layouts: { lg: [] } }]);
                  setIdxConfig(configs.length);
                  setIsChangeTitleTab(false);
                }}
              >
                <Icon name="Plus" />
              </div>
            </div>
            <div className="border__bottom--tab">
              <div className="bg-border" />
            </div>
          </div>
          
          <div className="lst__plugin">
            {toolboxItems.map((item, idx) => (
              <ToolboxItem
                key={item.type}
                toolboxItem={item}
                types="toolbar"
                onDragStart={(e) => {
                  handleDragStart(item);
                  e.dataTransfer.setData("text", idx.toString());
                }}
              />
            ))}
          </div>
          {/* Đoạn cần copy */}
          <div className="content">
            <div className="content__left">
              <span className="title-left">Danh sách các trường</span>

              <div className="lst__field">
                {lstOptionField.map((item, idx) => {
                  return (
                    <ToolboxItem
                      key={item.type}
                      toolboxItem={item}
                      types="field"
                      onDragStart={(e) => {
                        handleDragStart(item);
                        e.dataTransfer.setData("text", idx.toString());
                      }}
                    />
                  );
                })}
              </div>
            </div>
            <div className="content__center">
              <ResponsiveReactGridLayout
                className="layout"
                rowHeight={60}
                layouts={dataTabConfig.layouts}
                isDroppable={true}
                onDrop={handleDrop}
                droppingItem={droppingItem}
                onLayoutChange={handleLayoutChange}
                autoSize={true}
              >
                {memoizedItems}
              </ResponsiveReactGridLayout>
            </div>
            <div className="content__right">
              <span>cột thông tin bên phải</span>
            </div>
          </div>
          {/* Đoạn cần copy */}

          <div className="action__submit">
            <ModalFooter actions={actions} />
          </div>
        </div>

        {typeModal &&
          (typeModal === "bell" ? (
            <ModalTypeBell
              onShow={showModalAdd}
              onHide={() => {
                setShowModalAdd(false);
              }}
              data={null}
            />
          ) : typeModal == "signature" ? (
            <ModalTypeSignature
              onShow={showModalAdd}
              onHide={() => {
                setShowModalAdd(false);
              }}
              data={null}
              callBack={(data) => {
                setConfigs((prev) =>
                  prev.map((item, idx) => {
                    if (idx === idxConfig) {
                      // Thay đổi layouts cho config hiện tại
                      const newLayouts = { ...item.layouts };
                      newLayouts[breakpoint] = newLayouts[breakpoint].map((layoutItem) => {
                        if (layoutItem.i.localeCompare(dataLayout && dataLayout.i) === 0) {
                          return {
                            ...layoutItem,
                            children: (
                              // eslint-disable-next-line react/no-unknown-property
                              <div key={layoutItem.i} datatype="signature" style={{ height: "100%" }}>
                                <Button>{data.title}</Button>
                              </div>
                            ),
                          };
                        }
                        return layoutItem;
                      });

                      return {
                        ...item,
                        layouts: newLayouts,
                        childrens: [...item.childrens].map((prevChildren) => {
                          if (prevChildren.key.localeCompare(dataLayout && dataLayout.i) === 0) {
                            return (
                              // eslint-disable-next-line react/no-unknown-property
                              <div key={prevChildren.key} datatype="signature" style={{ height: "100%" }}>
                                <Button>{data.title}</Button>
                              </div>
                            );
                          }

                          return prevChildren;
                        }),
                      };
                    }
                    return item;
                  })
                );
              }}
            />
          ) : typeModal == "form" ? (
            <ModalTypeForm
              onShow={showModalAdd}
              onHide={() => {
                setShowModalAdd(false);
              }}
              data={null}
              callBack={(data) => {
                if (data) {
                  setConfigs((prev) =>
                    prev.map((item, idx) => {
                      if (idx === idxConfig) {
                        // Thay đổi layouts cho config hiện tại
                        const newLayouts = { ...item.layouts };
                        newLayouts[breakpoint] = newLayouts[breakpoint].map((layoutItem) => {
                          if (layoutItem.i.localeCompare(dataLayout && dataLayout.i) === 0) {
                            return {
                              ...layoutItem,
                              children: (
                                // eslint-disable-next-line react/no-unknown-property
                                <div key={layoutItem.i} datatype="form" style={{ height: "100%" }}>
                                  <div dangerouslySetInnerHTML={{ __html: data }} />
                                </div>
                              ),
                            };
                          }
                          return layoutItem;
                        });

                        return {
                          ...item,
                          layouts: newLayouts,
                          childrens: [...item.childrens].map((prevChildren) => {
                            if (prevChildren.key.localeCompare(dataLayout && dataLayout.i) === 0) {
                              return (
                                // eslint-disable-next-line react/no-unknown-property
                                <div key={prevChildren.key} datatype="form" style={{ height: "100%" }}>
                                  <div dangerouslySetInnerHTML={{ __html: data }} />
                                </div>
                              );
                            }

                            return prevChildren;
                          }),
                        };
                      }
                      return item;
                    })
                  );
                }
              }}
            />
          ) : (
            <ModalFieldOption
              onShow={showModalAdd}
              onHide={() => {
                setShowModalAdd(false);
              }}
              data={null}
            />
          ))}
      </div>
    </Fragment>
  );
}
