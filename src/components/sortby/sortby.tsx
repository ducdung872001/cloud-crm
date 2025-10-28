import React, { useEffect, useRef, useState } from "react";
import { ISortItem } from "model/OtherModel";
import Button from "components/button/button";
import Icon from "components/icon";
import Popover from "components/popover/popover";
import Radio from "components/radio/radio";
import CustomScrollbar from "components/customScrollbar";
import { useOnClickOutside } from "utils/hookCustom";
import "./sortby.scss";

interface SortProps {
  params: any;
  listSort: ISortItem[];
  callback: (value: string) => void;
}

export default function SortBy(props: SortProps) {
  const { listSort, params, callback } = props;
  const refSortBy = useRef();
  const refSortByContainer = useRef();
  const [showPopoverSortby, setShowPopoverSortby] = useState<boolean>(false);
  useOnClickOutside(refSortBy, () => setShowPopoverSortby(false), ["sortby"]);

  const [sortByItems, setSortByItems] = useState<ISortItem[]>(listSort);

  useEffect(() => {
    setSortByItems(listSort);
  }, [listSort]);

  return (
    <div className="sortby" ref={refSortByContainer}>
      <Button type="button" color="secondary" className="btn-sortby" onlyIcon={true} onClick={() => setShowPopoverSortby(!showPopoverSortby)}>
        <Icon name="Sortby" />
      </Button>
      {showPopoverSortby && (
        <Popover alignment="right" isTriangle={true} className="popover-sortby" refPopover={refSortBy} refContainer={refSortByContainer}>
          <CustomScrollbar width="100%" height="300" autoHide={true}>
            <div className="list-sortby">
              {sortByItems?.map((item, index) => (
                <Radio
                  key={index}
                  name="sortby"
                  value={item.value}
                  checked={params.sort_by ? item.value === params.sort_by : item.value === ""}
                  label={item.label}
                  onChange={(e) => callback(e.target.value)}
                />
              ))}
            </div>
          </CustomScrollbar>
        </Popover>
      )}
    </div>
  );
}
