import Button from "components/button/button";
import Icon from "components/icon";
import Popover from "components/popover/popover";
import { IAction } from "model/OtherModel"; 
import React, { Fragment, useRef } from "react";
import { useOnClickOutside } from "utils/hookCustom";

interface ActionProps {
  item: any;
  actions: (item: any) => IAction[];
  actionType?: "dropdown" | "inline";
  handleShowActionRow: (id: number, value?: boolean) => void;
}

export default function Action(props: ActionProps) {
  const { item, actions, actionType, handleShowActionRow } = props;

  const refActions = useRef();
  const refActionsContainer = useRef();
  useOnClickOutside(refActions, () => handleShowActionRow(0), ["actions"]);

  return (
    <div className={`actions-${item.id}`} onClick={(e) => e.stopPropagation()} ref={refActionsContainer}>
      {!actionType || actionType === "dropdown" ? (
        <Fragment>
          <Button
            type="button"
            color="transparent"
            className="btn-action-dropdown"
            onlyIcon={true}
            onClick={() => handleShowActionRow(item.id, !item.showActionRow)}
          >
            <Icon name="ThreeDotVertical" />
          </Button>
          {item.showActionRow && (
            <Popover alignment="right" direction="bottom" className="row-actions-popover" refContainer={refActionsContainer} refPopover={refActions}>
              <ul>
                {actions(item.raw).map((a, idx) => {
                  return (
                    <li
                      key={idx}
                      onClick={() => {
                        a.callback();
                        handleShowActionRow(0);
                      }}
                    >
                      {a.icon}
                      {a.title}
                    </li>
                  );
                })}
              </ul>
            </Popover>
          )}
        </Fragment>
      ) : (
        <Fragment>
          {actions(item.raw).map((a, idx) => {
            return (
              <Button
                type="button"
                disabled={a.disabled}
                color="transparent"
                onlyIcon={true}
                onClick={() => a.callback()}
                key={idx}
                dataTip={a.title}
              >
                {a.icon}
              </Button>
            );
          })}
        </Fragment>
      )}
    </div>
  );
}
