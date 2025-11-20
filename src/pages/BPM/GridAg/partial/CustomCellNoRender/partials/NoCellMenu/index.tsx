import React, { memo, useEffect, useRef, useState } from "react";
import Icon from "components/icon";
import "./index.scss";
import SelectCustom from "components/selectCustom/selectCustom";
import { useScrollY } from "pages/BPM/GridAg/CustomHook/useScrollY";

export interface INoteData {
  id: number;
  avatar: string;
  name: string;
  time: string;
  content: string;
  isEdit: boolean;
}

export interface IDetailAction {
  rowIndex: number;
  action: string;
  position: "top" | "bottom";
  stype?: string;
}
interface INoteFieldProps {
  onShow: boolean;
  onHide?: (reload: boolean) => void;
  rowIndex: number;
  callBack: (detailAction: IDetailAction) => void;
}

const NoCellMenu = ({ position, onClose, rowKey, callBack }) => {
  const menuRef = useRef(null);
  const scrollY = useScrollY();

  const [listTypeTitle, setListTypeTitle] = useState([
    { value: "H1", label: "LV1", isShow: false },
    { value: "H2", label: "LV2", isShow: false },
    { value: "H3", label: "LV3", isShow: false },
    { value: "H4", label: "LV4", isShow: false },
  ]);
  const [listTypeSum, setListTypeSum] = useState([
    { value: "H1", label: "LV1", level: 1, isShow: false },
    { value: "H2", label: "LV2", level: 2, isShow: false },
    { value: "H3", label: "LV3", level: 3, isShow: false },
    { value: "H4", label: "LV4", level: 4, isShow: false },
    { value: "H1", label: "ALL", level: 11, isShow: false },
  ]);
  const [listTitleSum, setListTitleSum] = useState([
    { value: "H1", label: "LV1", level: 1, isShow: false },
    { value: "H2", label: "LV2", level: 2, isShow: false },
    { value: "H3", label: "LV3", level: 3, isShow: false },
    { value: "H4", label: "LV4", level: 4, isShow: false },
  ]);
  const [typeTitle, setTypeTitle] = useState(null);
  const [typeTitleSum, setTypeTitleSum] = useState(null);
  const [typeSum, setTypeSum] = useState(null);

  //   // Đóng popup khi click ngoài
  //   useEffect(() => {
  //     const handleClickOutside = (event) => {
  //       if (menuRef.current && !menuRef.current.contains(event.target)) {
  //         onClose();
  //       }
  //     };
  //     document.addEventListener("mousedown", handleClickOutside);
  //     return () => document.removeEventListener("mousedown", handleClickOutside);
  //   }, [onClose]);

  // Đóng popup khi click ngoài hoặc lăn chuột
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleScroll = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("wheel", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("wheel", handleScroll);
    };
  }, [onClose]);

  const handleAction = (action, position, stype?: any) => {
    callBack({
      rowKey: rowKey,
      action: action,
      position: position,
      stype: stype,
    });
    onClose();
  };

  return (
    <>
      {position.top && position.left ? (
        <div
          className="custom-no-cell-menu"
          ref={menuRef}
          style={{
            position: "absolute",
            top: `${position.top + scrollY}px`,
            left: `${position.left}px`,
          }}
        >
          <form className="form-action-group">
            <div className="list-action">
              <div
                className="item-action"
                onClick={() => {
                  handleAction("insert", "top");
                }}
              >
                Chèn 1 hàng lên trên
              </div>
              <div
                className="item-action"
                onClick={() => {
                  handleAction("insert", "bottom");
                }}
              >
                Chèn 1 hàng xuống dưới
              </div>
              <div
                className="item-action"
                onClick={() => {
                  let newList = [...listTypeTitle];
                  newList.map((item) => {
                    item.isShow = false;
                  });
                  // newList[index].isShow = true;
                  setListTypeTitle(newList);
                }}
              >
                <div className="action-name">Chèn tiêu đề</div>
                <SelectCustom
                  name={"title"}
                  disabled={false}
                  options={listTypeTitle}
                  value={typeTitle?.value || ""}
                  onChange={(e) => setTypeTitle(e)}
                  placeholder={`Chọn levlel`}
                  fill={true}
                />
                <Icon name="CaretRight" />
                {typeTitle?.value ? (
                  <>
                    <div
                      className="sub-action"
                      onClick={() => {
                        handleAction("insertTitle", "top", typeTitle.value);
                      }}
                    >
                      Lên trên
                    </div>
                    <div
                      className="sub-action"
                      onClick={() => {
                        handleAction("insertTitle", "bottom", typeTitle.value);
                      }}
                    >
                      Xuống dưới
                    </div>
                  </>
                ) : null}
              </div>

              {/* <div
                className="item-action"
                onClick={() => {
                  let newList = [...listTitleSum];
                  newList.map((item) => {
                    item.isShow = false;
                  });
                  // newList[index].isShow = true;
                  setListTypeTitle(newList);
                }}
              >
                <div className="action-name">Tiêu đề tổng</div>
                <SelectCustom
                  name={"title"}
                  disabled={false}
                  options={listTitleSum}
                  value={typeTitleSum?.value || ""}
                  onChange={(e) => setTypeTitleSum(e)}
                  placeholder={`Chọn levlel`}
                  fill={true}
                />
                <Icon name="CaretRight" />
                {typeTitleSum?.value ? (
                  <>
                    <div
                      className="sub-action"
                      onClick={() => {
                        handleAction("insertTitleSum", "top", typeTitleSum.value);
                      }}
                    >
                      Lên trên
                    </div>
                    <div
                      className="sub-action"
                      onClick={() => {
                        handleAction("insertTitleSum", "bottom", typeTitleSum.value);
                      }}
                    >
                      Xuống dưới
                    </div>
                  </>
                ) : null}
              </div>
              <div
                className="item-action"
                onClick={() => {
                  let newList = [...listTypeSum];
                  newList.map((item) => {
                    item.isShow = false;
                  });
                  // newList[index].isShow = true;
                  setListTypeSum(newList);
                }}
              >
                <div className="action-name">Chèn hàng tổng</div>
                <SelectCustom
                  name={"sum"}
                  disabled={false}
                  options={listTypeSum}
                  value={typeSum?.value || ""}
                  onChange={(e) => setTypeSum(e)}
                  placeholder={`Chọn levlel`}
                  fill={true}
                />
                <Icon name="CaretRight" />
                {typeSum?.value ? (
                  <>
                    <div
                      className="sub-action"
                      onClick={() => {
                        handleAction("insertSum", "top", typeSum.level);
                      }}
                    >
                      Lên trên
                    </div>
                    <div
                      className="sub-action"
                      onClick={() => {
                        handleAction("insertSum", "bottom", typeSum.level);
                      }}
                    >
                      Xuống dưới
                    </div>
                  </>
                ) : null}
              </div> */}
              <div
                className="item-action action-delete"
                onClick={() => {
                  handleAction("delete", "bottom");
                }}
              >
                Xoá hàng
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
};

export default memo(NoCellMenu);
