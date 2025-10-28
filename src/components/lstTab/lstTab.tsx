import React, { useState, useEffect } from "react";
import classNames from "classnames";
import Button from "components/button/button";
import { IAction, ILstDataTab } from "types/OtherModel";
import "./lstTab.scss";

interface ILstTabProps {
  name?: string;
  isSaveLocalStorage?: boolean;
  lstData: ILstDataTab[];
  action?: IAction[];
  callback?: (dataTab: string) => void;
}

export default function LstTab(props: ILstTabProps) {
  const { lstData, name, callback, isSaveLocalStorage = true, action } = props;

  const [valueTab, setValueTab] = useState<string>(lstData[0].key);

  const saveDataTabInLocalStorage = localStorage.getItem(`active${name}`);

  useEffect(() => {
    if (saveDataTabInLocalStorage && name && isSaveLocalStorage) {
      setValueTab(JSON.parse(saveDataTabInLocalStorage) || "tab_one");
    }
  }, [saveDataTabInLocalStorage, name, isSaveLocalStorage]);

  useEffect(() => {
    if (valueTab && isSaveLocalStorage) {
      callback(valueTab);
    }
  }, [valueTab, isSaveLocalStorage]);

  return (
    <div className={classNames("wrapper__lst--tab")}>
      <ul className="lst__tab">
        {lstData.map((item, idx) => {
          return (
            <li
              key={idx}
              className={item.key === valueTab ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setValueTab(item.key);

                isSaveLocalStorage && localStorage.setItem(`active${name}`, JSON.stringify(item.key));
              }}
            >
              {item.name}
            </li>
          );
        })}
      </ul>

      {action && action.length > 0 && (
        <div className="action__tab">
          {action.map((el, index) => {
            return (
              <Button
                type="button"
                color={el.color}
                disabled={el.disabled}
                variant={el.variant}
                key={index}
                onClick={() => el.callback()}
                dataTip={el.data_tip}
              >
                {el.icon}
                {el.title}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
