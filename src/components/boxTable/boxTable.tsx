/* eslint-disable prefer-const */
import React, {Fragment, useCallback, useEffect, useState, memo} from "react";
import BulkAction, { BulkActionItemModel } from "components/bulkAction/bulkAction";
import Checkbox from "components/checkbox/checkbox";
import ReactTooltip from "react-tooltip";
import { Pagination, PaginationProps } from "components/pagination/pagination";
import { IAction } from "model/OtherModel";
import Action from "./partials/action";
import "./boxTable.scss";

export interface BoxTableItem {
  id: number;
  [key: string]: unknown;
}

export interface BoxTableProps {
  name?: string;
  titles: string[];
  actions?: (item: BoxTableItem) => IAction[];
  actionType?: "dropdown" | "inline";
  items: BoxTableItem[];
  className?: string;
  style?: React.CSSProperties;
  dataMappingArray: (item: BoxTableItem, index: number) => void;
  dataFormat?: string[];
  dataSize?: (string | number)[];
  onClickRow?: (item: BoxTableItem) => void;
  striped?: boolean;
  isActivity?: boolean;
  isBulkAction?: boolean;
  bulkActionItems?: BulkActionItemModel[];
  isPagination?: boolean;
  dataPagination?: PaginationProps;
  listIdChecked?: number[];
  setListIdChecked?: (listId: number[]) => void;
  renderDetail?: (item: BoxTableItem) => React.ReactNode;
  listDetailData?: BoxTableItem[];
  listIdDetailShow?: number[];
  isSummary?: boolean;
  dataSummary?: React.ReactNode[];
}

function BoxTable(props: BoxTableProps) {
  const {
    name,
    titles,
    actionType,
    items,
    className,
    style,
    onClickRow,
    striped,
    isActivity,
    isBulkAction,
    isPagination,
    dataPagination,
    dataMappingArray,
    dataFormat,
    dataSize,
    listIdChecked,
    setListIdChecked,
    renderDetail,
    listDetailData,
    listIdDetailShow,
    isSummary,
    dataSummary,
  } = props;

  let { actions, bulkActionItems } = props;
  bulkActionItems = (bulkActionItems || []).filter((item) => item);

  const [listItem, setListItem] = useState<{ id: number; data: void; raw: BoxTableItem; showActionRow: boolean; onShowDetail: boolean }[]>();
  const checkAll = useCallback((isChecked: boolean) => {
    if (isChecked) {
      setListIdChecked &&
        setListIdChecked(
          items.map((i) => {
            return i.id;
          })
        );
    } else {
      setListIdChecked && setListIdChecked([]);
    }
  }, [items, setListIdChecked]);

  const checkOne = useCallback((id: number, isChecked: boolean) => {
    if (isChecked) {
      setListIdChecked && setListIdChecked([...(listIdChecked ?? []), id]);
    } else {
      setListIdChecked && setListIdChecked(listIdChecked?.filter((i) => i !== id) ?? []);
    }
  }, [listIdChecked, setListIdChecked]);

  const mapData = (data: BoxTableItem[]) => {
    return data?.map((item, index) => ({
      id: item.id,
      data: dataMappingArray(item, index),
      raw: item,
      showActionRow: false,
      onShowDetail: false,
    }));
  };

  useEffect(() => {
    setListItem(mapData(items));
    return () => {
      setListItem([]);
    };
  }, [items]);

  useEffect(() => {
    ReactTooltip.rebuild();
  }, [listItem]);

  const handleShowActionRow = useCallback((id: number, isShow?: boolean) => {
    setListItem((prev) => prev?.map((item) => {
      return {
        ...item,
        showActionRow: id === 0 ? false : item.id === id ? isShow : false,
      };
    }));
  }, []);

  return (
    <div className="box-table" style={style || {}}>
      <div className="box-table__wrapper">
        <table className={`table${striped ? " table-striped" : ""}${isPagination ? " has-pagination" : ""}${className ? ` ${className}` : ""}`}>
          <thead>
            <tr>
              {isBulkAction && bulkActionItems && bulkActionItems?.length > 0 && listIdChecked && setListIdChecked && (
                <th className="checkbox">
                  <Checkbox
                    indeterminate={listIdChecked?.length > 0 && listIdChecked?.length < items.length}
                    checked={listIdChecked?.length === items.length}
                    onChange={(e) => checkAll(e.target.checked)}
                  />
                  <BulkAction name={name} selectedCount={listIdChecked?.length} bulkActionItems={bulkActionItems} />
                </th>
              )}
              {titles?.map((title, idx) => (
                <th key={idx} className={`${dataFormat ? dataFormat[idx] : ""}`}>
                  {title}
                </th>
              ))}
              {actions && actions?.length > 0 && (
                <th className={`actions${!actionType || actionType === "dropdown" ? " actions-dropdown" : ""}`}></th>
              )}
            </tr>
          </thead>
          <tbody>
            {listItem?.map((item, index) => {
              const isChecked = listIdChecked && setListIdChecked && listIdChecked.some((id) => id === item.id) ? true : false;
              const itemDetail = listDetailData?.find((d) => d.id === item.id);
              return (
                <Fragment key={item.id}>
                  <tr
                    onClick={() => onClickRow && onClickRow(item.raw)}
                    className={`${onClickRow ? "cursor-pointer" : ""}${
                      isBulkAction && bulkActionItems && bulkActionItems?.length > 0 && isChecked ? " has-choose" : ""
                    }${isActivity && (item.raw.type === 1 ? " type--positive" : " type--negative")}`}
                  >
                    {isBulkAction && bulkActionItems && bulkActionItems?.length > 0 && listIdChecked && setListIdChecked && (
                      <td className="checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={isChecked} onChange={(e) => checkOne(item.id, e.target.checked)} />
                      </td>
                    )}
                    {item.data?.map((d: unknown, idx: number) => (
                      // remaing: Trường dùng để đánh dấu màu sắc kế toán (> 0 thì xanh, còn <0 thì đỏ)
                      <td
                        className={`${dataFormat ? dataFormat[idx] : ""} ${
                          titles[idx] == "Tồn" ? (item.raw.remaining >= 0 ? "text-success" : "text-error") : ""
                        }`}
                        key={idx}
                      >
                        {typeof d === "string" || typeof d === "number" ? (
                          <div style={dataSize ? { width: `${typeof dataSize[idx] === "string" ? "auto" : `${dataSize[idx]}rem`}` } : {}}>{d}</div>
                        ) : (
                          <div style={dataSize ? { width: `${typeof dataSize[idx] === "string" ? "auto" : `${dataSize[idx]}rem`}` } : {}}>{d}</div>
                        )}
                      </td>
                    ))}
                    {actions && actions?.length > 0 && (
                      <td
                        className={`actions${!actionType || actionType === "dropdown" ? " actions-dropdown" : ""}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Action
                          item={item}
                          actionType={actionType}
                          handleShowActionRow={(id, value) => handleShowActionRow(id, value)}
                          actions={actions}
                        />
                      </td>
                    )}
                  </tr>
                  {itemDetail && (
                    <tr className={`row-detail${listIdDetailShow?.find((id) => id === item.id) ? "" : " d-none"}`}>
                      <td colSpan={item.data.length + (isBulkAction ? 1 : 0) + (actions ? 1 : 0)}>{renderDetail(itemDetail)}</td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {isSummary && dataSummary && dataSummary.length > 0 && (
              <tr className="summary">
                {dataSummary.map((item, idx) => {
                  return (
                    <td key={idx} className={`item-summary ${item?.startsWith("Tổng") ? "merge-text" : "text-right"}`}>
                      <span>{item}</span>
                    </td>
                  );
                })}
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {isPagination && dataPagination && (
        <Pagination
          name={dataPagination.name}
          displayNumber={dataPagination.displayNumber}
          page={dataPagination.page}
          setPage={(page) => dataPagination.setPage(page)}
          sizeLimit={dataPagination.sizeLimit}
          totalItem={dataPagination.totalItem}
          totalPage={dataPagination.totalPage}
          isChooseSizeLimit={dataPagination.isChooseSizeLimit}
          chooseSizeLimit={(limit) => dataPagination.chooseSizeLimit && dataPagination.chooseSizeLimit(limit)}
        />
      )}
      <ReactTooltip />
    </div>
  );
}

export default memo(BoxTable);
