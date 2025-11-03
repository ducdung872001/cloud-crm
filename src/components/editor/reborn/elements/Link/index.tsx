import React, { useCallback, useMemo, ReactElement } from 'react'
import { useSelected, useFocused, useSlateStatic } from "slate-react";
import { removeLink } from '../../utils/link';
import Icon from "components/icon";
import Button from "components/button/button";

import "./index.scss";

const Link = ({ attributes, element, children }) => {
    const editor = useSlateStatic();
    const selected = useSelected();
    const focused = useFocused();

    return (
        <span className="element-link">
            <a {...attributes} href={element.href}>
                {children}
            </a>
            {selected && focused && (
                <span className="popup" contentEditable={false}>
                    <a href={element.href} rel="noreferrer" target="_blank">
                        {/* Thêm icon điểm neo nữa ở đây */}
                        {/* https://codesandbox.io/s/35inm */}
                        {element.href}
                    </a>
                    <Button
                        type="button"
                        color="transparent"
                        className="btn-action-dropdown"
                        onlyIcon={true}
                        onClick={() => removeLink(editor)}
                    >
                        <Icon name="Trash" />
                    </Button>
                </span>
            )}
        </span>
    );
};

export {
    Link
};
