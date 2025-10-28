import React, { useRef, useState } from "react";
import Popover from "components/popover/popover";
import Button from "components/button/button";
import Icon from "components/icon";
import { useOnClickOutside } from "utils/hookCustom";
import "./bulkAction.scss";

export interface BulkActionItemModel {
  title: string;
  callback: any;
}
interface BulkActionProps {
  name: string;
  selectedCount: number;
  bulkActionItems: BulkActionItemModel[];
}
export default function BulkAction(props: BulkActionProps) {
  const { name, selectedCount, bulkActionItems } = props;

  const refLiAction = useRef();
  const refBulkAction = useRef();
  const refBulkActionContainer = useRef();
  const [showBulkAction, setShowBulkAction] = useState<boolean>(false);
  useOnClickOutside(refBulkAction, () => setShowBulkAction(false), ["base-bulk-action__button"]);

  return (
    <>
      {bulkActionItems && bulkActionItems.length > 0 && selectedCount > 0 && (
        <div className="base-bulk-action">
          <ul className="d-flex align-items-center">
            <li className="select-count">
              Có{" "}
              <span>
                {selectedCount}
                {name ? ` ${name.toLowerCase()}` : ""}
              </span>{" "}
              được chọn
            </li>
            <li className="base-bulk-action__button" ref={refBulkActionContainer}>
              <Button type="button" color="secondary" hasIcon={true} onClick={() => setShowBulkAction(!showBulkAction)}>
                Chọn thao tác <Icon name="ChevronDown" />
              </Button>
              {showBulkAction && (
                <Popover
                  alignment="left"
                  isTriangle={true}
                  className="base-bulk-action__popover"
                  refContainer={refBulkActionContainer}
                  refPopover={refBulkAction}
                >
                  {/* <div className="base-bulk-action__popover"> */}
                  <ul ref={refLiAction}>
                    {bulkActionItems.map((item, index) => (
                      <li key={index} onClick={item.callback}>
                        <span className="item-li" onClick={() => setShowBulkAction(false)}>
                          {item.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {/* </div> */}
                </Popover>
              )}
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
