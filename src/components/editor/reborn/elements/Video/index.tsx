import React, { Fragment, useState } from "react";
import { Transforms } from "slate";
import { useSlateStatic, useSelected, useFocused, ReactEditor } from "slate-react";
import { css } from "@emotion/css";
import Icon from "components/icon";
import { Button } from "../../../components";
import { createParagraphNode } from "utils/editor";

const Video = ({ attributes, children, element }) => {
    const editor = useSlateStatic()
    const path = ReactEditor.findPath(editor, element)
    const [desc, setDesc] = useState<string>("");

    const [playVideo, setPlayVideo] = useState<boolean>(false);
    const [showModalEdit, setShowModalEdit] = useState<boolean>(false);

    const selected = useSelected()
    const focused = useFocused()

    const types = new Map([["avi", "video"], ["mp4", "video"], ["3gp", "video"]])
    const url = new URL(element?.url)
    const extension = url.pathname.split(".")[1]

    const insertNewParagraph = () => {
        Transforms.insertNodes(editor, createParagraphNode());
    }

    return (
        <Fragment>
            {
                playVideo ?
                    <p {...attributes} contentEditable={false}>
                        {children}
                        <video controls style={{ width: '100%', height: 'auto' }}>
                            <source src={element?.url} type={`video/${extension}`} />
                            Trình duyệt không hỗ trợ thẻ video
                        </video>

                        {/* Hiển thị gợi ý tạo đoạn mới => Tùng style lại theo link tham khảo nha: Tham khảo UI: https://onlinehtmleditor.dev/ */}
                        {
                            focused && selected ?
                                <div style={{ cursor: 'pointer', marginTop: '10px' }} onClick={() => insertNewParagraph()}>Tạo đoạn mới</div>
                                : null
                        }
                    </p> :
                    <Fragment>
                        <div
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
                                src={element?.thumbnail}
                                className={css`
                                    display: block;
                                    max-width: 100%;                              
                                    box-shadow: ${selected && focused ? "0 0 0 3px var(--primary-color-70)" : "none"};
                                    border-radius: 0.3rem;
                                `}
                                width={"100%"}
                                height={"auto"}
                                alt={desc || ""}
                            />
                            {/* Thêm Icon Play giữa ảnh vào đây => Ấn vào nút này thì chuyển chế độ */}
                            <Icon name="PlayVideo" onClick={() => setPlayVideo(!playVideo)}
                                className={css`position: absolute;    
                                                cursor: pointer;
                                                height: 100%;
                                                padding: 96px;
                                                fill: white;`}>
                            </Icon>

                            {desc ? <p className="video-desc" style={{ textAlign: "center", fontStyle: "italic" }}>{desc}</p> : null}
                            <Button
                                active
                                onClick={() => Transforms.removeNodes(editor, { at: path })}
                                className={css`
                                display: ${selected && focused ? "inline" : "none"};
                                position: absolute;
                                top: 0.5em;      
                                margin-left: 0;
                                background-color: white;
                                border-radius: 0.3rem;
                                padding: 0.1rem 0.2rem;
                                svg {
                                    width: 2rem;
                                    height: 2rem;
                                    fill: var(--error-color);
                                }
                                max-width: 100%;
                                `}>
                                <Icon name="Trash" />
                            </Button>
                            <Button
                                active
                                onClick={() => setShowModalEdit(true)}
                                className={css`
                                display: ${selected && focused ? "inline" : "none"};
                                position: absolute;
                                top: 0.5em;      
                                margin-left: 5.0rem;
                                background-color: white;
                                border-radius: 0.3rem;
                                padding: 0.1rem 0.3rem;
                                svg {
                                    width: 2rem;
                                    height: 2rem;
                                    fill: var(--primary-color-90);
                                }
                                max-width: 100%;
                                `}
                            >
                                <Icon name="Pencil" />
                            </Button>

                            {/* Hiển thị gợi ý tạo đoạn mới => Tùng style lại theo link tham khảo nha: Tham khảo UI: https://onlinehtmleditor.dev/ */}
                            {
                                focused && selected ?
                                    <div style={{ cursor: 'pointer', marginTop: '10px' }} onClick={() => insertNewParagraph()}>Tạo đoạn mới</div>
                                    : null
                            }
                        </div>
                    </Fragment>
            }
        </Fragment >
    )
}

export {
    Video
}