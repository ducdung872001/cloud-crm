import React, { useState, useEffect, useRef, useContext } from "react";
import Icon from "components/icon";
import Button from "components/button/button";
import Popover from "components/popover/popover";
import { ContextType, UserContext } from "contexts/userContext";
import { useOnClickOutside, useWindowDimensions } from "utils/hookCustom";
import "./pagination.scss";
import { getDomain } from "reborn-util";
import Input from "components/input/input";
import NummericInput from "components/input/numericInput";

export interface PaginationProps {
  name?: string;
  displayNumber: number;
  page: number;
  sizeLimit: any;
  totalPage: number;
  totalItem: number;
  setPage?: (page: number) => void;
  chooseSizeLimit?: (limit: number) => void;
  isChooseSizeLimit?: boolean;
}

export const DataPaginationDefault: PaginationProps = {
  name: "",
  displayNumber: 3,
  page: 1,
  sizeLimit: 10,
  totalPage: 10,
  totalItem: 100,
  setPage: () => undefined,
};

const sourceDomain = getDomain(decodeURIComponent(document.location.href));
const checkSubdomainTNEX = sourceDomain.includes("tnex");

const listSizeLimit: any[] = checkSubdomainTNEX ? [5, 10, 20, 30, 40, 50, 100] : [10, 30, 50, 100];

export function Pagination(props: PaginationProps) {
  const { isCollapsedSidebar } = useContext(UserContext) as ContextType;
  const { width } = useWindowDimensions();
  const { name, displayNumber, page, sizeLimit, totalPage, totalItem, setPage, chooseSizeLimit, isChooseSizeLimit } = props;
  const isEven = (n) => {
    return n % 2 === 0;
  };

  const [listPage, setListPage] = useState<number[]>([]);
  const caculateDisplayListPage = () => {
    const arrPage: number[] = [];
    let numberSub = 1;
    let numberPlus = 0;
    if (isEven(displayNumber)) {
      numberSub = 2;
      numberPlus = 1;
    }
    let startPage = 1;
    let endPage = totalPage;
    if (totalPage > displayNumber) {
      startPage = page - (displayNumber - numberSub) / 2 > 0 ? page - (displayNumber - numberSub) / 2 : 1;
      endPage = page + displayNumber / 2 <= displayNumber ? displayNumber : page + displayNumber / 2;
      startPage = page + (displayNumber - numberSub) / 2 >= totalPage ? totalPage - (displayNumber - numberSub + numberPlus) : startPage;
      endPage = endPage >= totalPage ? totalPage : endPage;
    }
    for (let i = startPage; i <= endPage; i++) {
      if (i > 1 && i < totalPage) {
        arrPage.push(i);
      }
    }
    setListPage(arrPage);
  };

  useEffect(() => {
    caculateDisplayListPage();
  }, [props]);

  const refSizeLimit = useRef();
  const refSizeLimitContainer = useRef();
  const [showSizeLimit, setShowSizeLimit] = useState<boolean>(false);
  useOnClickOutside(
    refSizeLimit,
    () => {
      setShowSizeLimit(false);
      chooseSizeLimit(limitTnex);
    },
    ["display-item__button"]
  );

  const [showGotoNext, setShowGotoNext] = useState(false);
  const [showGotoPrev, setShowGotoPrev] = useState(false);
  const refButtonNext = useRef();
  const refButtonPrev = useRef();
  useOnClickOutside(refButtonPrev, () => setShowGotoPrev(false), ["page-item__ellipsis-prev"]);
  useOnClickOutside(refButtonNext, () => setShowGotoNext(false), ["page-item__ellipsis-next"]);

  //tnex nhập số limit của 1 trang
  const [limitTnex, setLimitTnex] = useState(sizeLimit);

  return (
    <div
      className={`pagination d-flex align-items-center flex-wrap${isChooseSizeLimit ? " has-choose-size-limit" : ""}${
        isCollapsedSidebar ? " has-sidebar-collapsed" : ""
      }`}
    >
      <div className="count-item">
        Hiển thị kết quả từ {page > 1 ? (page - 1) * sizeLimit + 1 : 1} -{" "}
        {isNaN(page * sizeLimit < totalItem ? page * sizeLimit : totalItem) ? 1 : page * sizeLimit < totalItem ? page * sizeLimit : totalItem} trên
        tổng
        {` ${isNaN(totalItem) ? 1 : totalItem}`}
      </div>
      {isChooseSizeLimit && (
        <div className="display-item d-flex align-items-center">
          Hiển thị
          <div className="display-item__button" ref={refSizeLimitContainer}>
            <Button type="button" color="secondary" onClick={() => setShowSizeLimit(!showSizeLimit)}>
              {sizeLimit} <Icon name="CaretUp" />
            </Button>
            {showSizeLimit && (
              <Popover
                alignment="center"
                isTriangle={true}
                direction="top"
                className="popover-size-limit"
                refPopover={refSizeLimit}
                refContainer={refSizeLimitContainer}
              >
                <ul>
                  {listSizeLimit.map((size, index) => {
                    return (
                      <li
                        key={index}
                        onClick={() => {
                          chooseSizeLimit(size);
                          setShowSizeLimit(!showSizeLimit);
                        }}
                        className={`${size == sizeLimit ? "active" : ""}`}
                      >
                        {size}
                      </li>
                    );
                  })}

                  {checkSubdomainTNEX ? (
                    <div className="input-number-page">
                      <NummericInput
                        // fill={true}
                        name=""
                        label=""
                        value={limitTnex}
                        onBlur={(e) => {
                          const value = e.target.value;
                          chooseSizeLimit(value);
                          setLimitTnex(value);
                        }}
                        onChange={(e) => {
                          const value = e.target.value;
                          setLimitTnex(value);
                          // setLink(e.target.value);
                        }}
                        placeholder=""
                      />
                    </div>
                  ) : null}
                </ul>
              </Popover>
            )}
          </div>
          {name ? ` ${name.toLowerCase()}` : " dòng"}
        </div>
      )}
      {totalPage > 1 && (
        <div className="pager d-flex align-items-center justify-content-center justify-content-md-end">
          <ul className="d-flex align-items-center flex-wrap">
            {totalPage > displayNumber && (
              <li className={`page-prev ${page === 1 ? "disabled" : ""}`} onClick={page > 1 ? () => setPage(page - 1) : undefined}>
                <Icon name="ChevronLeft" />
                {(width > 1550 && isCollapsedSidebar) || width > 1750 ? "Trang trước " : ""}
              </li>
            )}
            <li className={`page-item${page === 1 ? " active" : ""}`} onClick={() => setPage(1)}>
              1
            </li>
            {page - 4 >= 1 && (
              <li className="page-item page-item__ellipsis page-item__ellipsis-prev">
                <Button type="button" color="transparent" onlyIcon={true} onClick={() => setShowGotoPrev(!showGotoPrev)}>
                  <Icon name="ThreeDot" />
                </Button>
                {showGotoPrev && (
                  <GotoPage
                    number={+page - 3}
                    lastPage={totalPage}
                    onChange={(e) => {
                      setPage(e);
                      setShowGotoPrev(false);
                    }}
                    refContainer={refButtonPrev}
                  />
                )}
              </li>
            )}
            {totalPage > 1 &&
              listPage.map((number) => {
                return (
                  <li key={number} className={`page-item${page === number ? " active" : ""}`} onClick={() => setPage(number)}>
                    {number}
                  </li>
                );
              })}
            {+page + 4 < totalPage && (
              <li className="page-item page-item__ellipsis page-item__ellipsis-next">
                <Button type="button" color="transparent" onlyIcon={true} onClick={() => setShowGotoNext(!showGotoNext)}>
                  <Icon name="ThreeDot" />
                </Button>
                {showGotoNext && (
                  <GotoPage
                    number={+page + 3}
                    lastPage={totalPage}
                    onChange={(e) => {
                      setPage(e);
                      setShowGotoNext(false);
                    }}
                    refContainer={refButtonNext}
                  />
                )}
              </li>
            )}
            {totalPage > 1 && (
              <li className={`page-item${page === totalPage ? " active" : ""}`} onClick={() => setPage(totalPage)}>
                {totalPage}
              </li>
            )}
            {totalPage > displayNumber && (
              <li className={`page-next ${page === totalPage ? "disabled" : ""}`} onClick={page < totalPage ? () => setPage(page + 1) : undefined}>
                {(width > 1550 && isCollapsedSidebar) || width > 1750 ? "Trang sau " : ""}
                <Icon name="ChevronRight" />
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export const GotoPage = ({ number, lastPage, onChange, refContainer }) => {
  const [numberTemp, setNumberTemp] = useState(number);
  return (
    <div className="goto-container" ref={refContainer}>
      <div className="goto-wrapper">
        <h4>Chuyển tới trang</h4>
        <div className="d-flex">
          <input type="text" className="count" autoFocus value={numberTemp} onChange={(e) => setNumberTemp(e.target.value)} />
          <span
            className="button-count"
            onClick={() => {
              if (numberTemp > 1) setNumberTemp(numberTemp - 1);
            }}
          >
            <Icon name="Minus" />
          </span>
          <span
            className="button-count"
            onClick={() => {
              if (numberTemp < lastPage) setNumberTemp(numberTemp + 1);
            }}
          >
            <Icon name="Plus" />
          </span>
          <Button type="button" color="secondary" onClick={() => onChange(numberTemp > lastPage ? lastPage : numberTemp < 1 ? 1 : numberTemp)}>
            OK
          </Button>
        </div>
      </div>
    </div>
  );
};
