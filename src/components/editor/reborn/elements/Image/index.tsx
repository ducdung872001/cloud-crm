/* eslint-disable prefer-const */
import React, { Fragment, useEffect, useState } from "react";
import { Transforms } from "slate";
import { useSlateStatic, useSelected, useFocused, ReactEditor } from "slate-react";
import { css } from "@emotion/css";
import Icon from "components/icon";
import { Button } from "../../../components";
import EditImageModal from "./partials/EditImageModal";
import { updateImage } from "../../plugins/withMedias";
import { createParagraphNode } from "utils/editor";

const Image = ({ attributes, children, element }) => {
  const editor = useSlateStatic();
  const path = ReactEditor.findPath(editor, element);

  const selected = useSelected();
  const focused = useFocused();

  const [showModalEdit, setShowModalEdit] = useState<boolean>(false);
  const [desc, setDesc] = useState<string>("");
  const [link, setLink] = useState<string>("");
  const [height, setHeight] = useState<number | string>(0);
  const [width, setWidth] = useState<number | string>(0);
  const [align, setAlign] = useState<string>("center");

  useEffect(() => {
    setDesc(element?.alt || "");
    setLink(element?.longdesc || "");
    setHeight(element?.height || 0);
    setWidth(element?.width || 0);
    setAlign(element?.align || "center");
  }, [element]);

  const insertNewParagraph = () => {
    Transforms.insertNodes(editor, createParagraphNode());
  };

  return (
    <Fragment>
      {align == "right" ? (
        <span
          {...attributes}
          contentEditable={false}
          className={css`
            position: relative;
            display: inline-block;
            float: right;
          `}
        >
          {children}
          <img
            contentEditable={false}
            src={element.url}
            className={css`
              display: block;
              max-width: 100%;
              box-shadow: ${selected && focused ? "0 0 0 3px var(--primary-color-70)" : "none"};
              border-radius: 0.3rem;
            `}
            width={width ? width : "150px"}
            height={height ? height : "150px"}
            alt={desc || ""}
            style={{ float: "right", marginLeft: "20px" }}
          />
          {getControl(element, desc, link, editor, path, selected, focused, width, height, align, showModalEdit, setShowModalEdit)}

          {/* Hiển thị gợi ý tạo đoạn mới => Tùng style lại theo link tham khảo nha: Tham khảo UI: https://onlinehtmleditor.dev/ */}
          {focused && selected ? (
            <div style={{ cursor: "pointer", marginTop: "10px" }} onClick={() => insertNewParagraph()}>
              Tạo đoạn mới
            </div>
          ) : null}
        </span>
      ) : null}

      {align == "left" ? (
        <span
          {...attributes}
          contentEditable={false}
          className={css`
            position: relative;
            display: inline-block;
            float: left;
          `}
        >
          {children}
          <img
            contentEditable={false}
            src={element.url}
            className={css`
              display: block;
              max-width: 100%;
              box-shadow: ${selected && focused ? "0 0 0 3px var(--primary-color-70)" : "none"};
              border-radius: 0.3rem;
            `}
            width={width ? width : "150px"}
            height={height ? height : "150px"}
            alt={desc || ""}
            style={{ float: "left", marginRight: "20px" }}
          />
          {getControl(element, desc, link, editor, path, selected, focused, width, height, align, showModalEdit, setShowModalEdit)}

          {/* Hiển thị gợi ý tạo đoạn mới => Tùng style lại theo link tham khảo nha: Tham khảo UI: https://onlinehtmleditor.dev/ */}
          {focused && selected ? (
            <div style={{ cursor: "pointer", marginTop: "10px" }} onClick={() => insertNewParagraph()}>
              Tạo đoạn mới
            </div>
          ) : null}
        </span>
      ) : null}

      {align == "center" ? (
        <span
          {...attributes}
          contentEditable={false}
          className={css`
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
          `}
        >
          {children}
          <img
            contentEditable={false}
            src={element.url}
            className={css`
              display: block;
              max-width: 100%;
              box-shadow: ${selected && focused ? "0 0 0 3px var(--primary-color-70)" : "none"};
              border-radius: 0.3rem;
            `}
            width={width ? width : "100%"}
            height={height ? height : "auto"}
            alt={desc || ""}
          />
          {getControl(element, desc, link, editor, path, selected, focused, width, height, align, showModalEdit, setShowModalEdit)}

          {/* Hiển thị gợi ý tạo đoạn mới => Tùng style lại theo link tham khảo nha: Tham khảo UI: https://onlinehtmleditor.dev/ */}
          {focused && selected ? (
            <div style={{ cursor: "pointer", marginTop: "10px" }} onClick={() => insertNewParagraph()}>
              Tạo đoạn mới
            </div>
          ) : null}
        </span>
      ) : null}
    </Fragment>
  );
};

const getControl = (element, desc, link, editor, path, selected, focused, width, height, align, showModalEdit, setShowModalEdit) => {
  return (
    <Fragment>
      {desc ? (
        <p className="img-desc" style={{ textAlign: "center", fontStyle: "italic" }}>
          {desc}
        </p>
      ) : null}
      <Button
        active
        onClick={() => Transforms.removeNodes(editor, { at: path })}
        className={css`
          display: ${selected && focused ? "inline" : "none"};
          position: absolute;
          top: 0.5em;
          ${align == "left" ? "left: 0.5rem;" : align == "right" ? "left: 3.0rem;" : ``}
          ${align == "center" ? "margin-left: 0;" : ""}            
            background-color: white;
          border-radius: 0.3rem;
          padding: 0.1rem 0.2rem;
          svg {
            width: 2rem;
            height: 2rem;
            fill: var(--error-color);
          }
        `}
      >
        <Icon name="Trash" />
      </Button>
      <Button
        active
        onClick={() => setShowModalEdit(true)}
        className={css`
          display: ${selected && focused ? "inline" : "none"};
          position: absolute;
          top: 0.5em;
          ${align == "left" ? "left: 2.5rem;" : align == "right" ? "left: 5.0rem;" : ``}
          ${align == "center" ? "margin-left: 5.0rem;" : ""}            
            background-color: white;
          border-radius: 0.3rem;
          padding: 0.1rem 0.3rem;
          svg {
            width: 2rem;
            height: 2rem;
            fill: var(--primary-color-90);
          }
        `}
      >
        <Icon name="Pencil" />
      </Button>
      <EditImageModal
        onShow={showModalEdit}
        onHide={() => setShowModalEdit(false)}
        image={element.url}
        width={width || 0}
        height={height || 0}
        desc={desc}
        link={link}
        imgAlign={align}
        onUpdate={(newUrl, link, width, height, desc, imgAlign) => {
          let point = new Date().getTime();

          updateImage(editor, element.url, newUrl, link, width, height, desc, imgAlign, point);
        }}
      />
    </Fragment>
  );
};

export { Image };
