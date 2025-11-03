import React, { useRef, useState } from "react";
import Tippy from "@tippyjs/react";
import ThirdGender from "assets/images/third-gender.png";
import { IHeaderInternalRightMailListProps } from "model/mailBox/PropsModel";
import Icon from "components/icon";
import Popover from "components/popover/popover";
import SearchBox from "components/searchBox/searchBox";
import Button from "components/button/button";
import { useOnClickOutside } from "utils/hookCustom";
import "tippy.js/animations/scale-extreme.css";
import "./HeaderInternalRightMailList.scss";

export default function HeaderInternalMailList(props: IHeaderInternalRightMailListProps) {
  const { dataMailbox, showDialogConfirmDelete, isBroadly, setIsBroadly } = props;

  const refElementSetting = useRef();
  const refSettingContainer = useRef();

  const [params, setParams] = useState("");
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [isSetting, setIsSetting] = useState<boolean>(false);
  useOnClickOutside(refElementSetting, () => setIsSetting(false), ["settings"]);

  return (
    <div className="title-conversation">
      <div className="title-left">
        <div className="avatar-conversation">
          <img src={dataMailbox.senderAvatar ? dataMailbox.senderAvatar : ThirdGender} alt="" />
        </div>
        <span>{dataMailbox.title}</span>
      </div>
      <div className="title-right">
        <div className={`search-chat ${isSearch ? "active-search-chat" : ""}`}>
          <Tippy content="Tìm kiếm cuộc trò chuyện" delay={[100, 0]} animation="scale-extreme">
            <span
              className="icon-item"
              onClick={() => {
                setIsSearch(!isSearch);
                setIsBroadly(false);
              }}
            >
              <Icon name="SearchFill" />
            </span>
          </Tippy>
          <div className={`${isSearch ? "search-item" : "d-none"}`}>
            <SearchBox
              name="Tìm kiếm tin nhắn"
              placeholderSearch="Tìm kiếm tin nhắn..."
              params={params}
              updateParams={(paramsNew) => setParams(paramsNew)}
            />
            <Button type="button" color="transparent" onClick={() => setIsSearch(false)}>
              Đóng
            </Button>
          </div>
        </div>
        <div className={`broadly ${isBroadly ? "active-broadly" : ""}`}>
          <Tippy content="Thông tin hội thoại" delay={[100, 0]} animation="scale-extreme">
            <span
              className="icon-item"
              onClick={() => {
                setIsSearch(false);
                setIsBroadly(!isBroadly);
              }}
            >
              <Icon name="Dashboard" />
            </span>
          </Tippy>
        </div>
        <div className={`settings ${isSetting ? "active-setting" : ""}`} ref={refSettingContainer}>
          <div
            className="icon-item"
            onClick={() => {
              setIsSearch(false);
              setIsBroadly(false);
              setIsSetting(!isSetting);
            }}
          >
            <Tippy content="Cài đặt" delay={[100, 0]} animation="scale-extreme">
              <span>
                <Icon name="Settings" />
              </span>
            </Tippy>
          </div>

          {isSetting && (
            <Popover alignment="right" className="setting-item" refContainer={refSettingContainer} refPopover={refElementSetting}>
              <ul className="menu-setting">
                <li
                  className="menu-item"
                  onClick={() => {
                    setIsSetting(false);
                  }}
                >
                  <Icon name="Pencil" />
                  Sửa thư nội bộ
                </li>
                <li
                  className="menu-item"
                  onClick={() => {
                    setIsSetting(false);
                    showDialogConfirmDelete(dataMailbox);
                  }}
                >
                  <Icon name="Trash" />
                  Xóa thư nội bộ
                </li>
              </ul>
            </Popover>
          )}
        </div>
      </div>
    </div>
  );
}
