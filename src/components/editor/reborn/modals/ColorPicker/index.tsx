import React, { Fragment, useMemo, useEffect, useState } from "react";
import { IColorPickerModal } from "model/editor/PropsModel";
import { IActionModal } from "model/OtherModel";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { SketchPicker } from 'react-color';

import "./index.scss";

export default function ColorPicker(props: IColorPickerModal) {
    const { onShow, onHide } = props;
    const [color, setColor] = useState<string>('#fff');

    useEffect(() => {
        setColor(props.color || '#fff');
    }, [props]);

    const handleOnChange = (colorObj) => {
        setColor(colorObj.hex);

        //Gọi để chèn vào trình soạn thảo giá trị màu này
        if (props.callback) {
            props.callback(colorObj.hex);
        }
    }

    const actions = useMemo<IActionModal>(
        () => ({
            actions_right: {
                buttons: [
                    {
                        title: "Hủy",
                        color: "primary",
                        variant: "outline",
                        callback: () => {
                            onHide()
                        },
                    },
                    {
                        title: "Chọn màu",
                        type: "button",
                        color: "primary",
                        disabled: !color,
                        callback: () => {
                            //Gọi chèn vào trình soạn thảo
                            if (props.callback) {
                                props.callback(color);
                                onHide();
                            }
                        },
                    },
                ],
            },
        }),
        [color]
    );

    return (
        <Fragment>
            <Modal
                isFade={false}
                isOpen={onShow}
                isCentered={true}
                staticBackdrop={false}
                toggle={() => onHide()}
                className="modal-color-picker"
            >
                <div className="form-add-color">
                    <ModalBody>
                        <SketchPicker
                            color={color}
                            onChangeComplete={handleOnChange}
                        />
                    </ModalBody>
                </div>
            </Modal>
        </Fragment>
    )
}