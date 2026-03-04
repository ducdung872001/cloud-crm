import React, { Fragment, useState, useEffect, useRef } from "react";
import _ from "lodash";
import Tippy from "@tippyjs/react";
import Button from "components/button/button";
import { PaginationProps, DataPaginationDefault } from "components/pagination/pagination";
import Icon from "components/icon";
import NetLoan from "./partials/NetLoan";
import NetDeposit from "./partials/NetDeposit";
import NetServiceCharge from "./partials/NetServiceCharge";

import "./index.scss";

export default function CustomerRevenue({ data }) {
  const [tab, setTab] = useState<string>("tab_one");
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);

  const listTabItems = [
    {
      title: "Thu từ tiền vay",
      is_active: "tab_one",
    },
    {
      title: "Thu thuần tiền gửi",
      is_active: "tab_two",
    },
    {
      title: "Thu phí dịch vụ",
      is_active: "tab_three",
    },
  ];

  const [params, setParams] = useState<any>({
    name: "",
    customerId: data.id,
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Thu thuần từ khách hàng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {      
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
    }
    return () => {
      abortController.abort();
    };
  }, [params]); 

  return (
    <div className={`page-content customer__revenue`}>
      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <ul className="action__option--title">
            {listTabItems.map((item, idx) => {
              return (
                <li
                  key={idx}
                  className={item.is_active == tab ? "active" : ""}
                  onClick={(e) => {
                    e && e.preventDefault();
                    setTab(item.is_active);
                  }}
                >
                  {item.title}
                </li>
              );
            })}
          </ul>
          <Tippy
            content={`${tab === "tab_one" ? "Thêm mới thu từ tiền vay" : (tab === "tab_one" ? "Thêm mới thu từ tiền gửi" : "Thêm mới thu phí dịch vụ")}`}
            delay={[100, 0]}
            animation="scale-extreme"
            placement="left"
          >
            <div className="add-item">
              <Button
                color="success"
                onClick={() => {
                  setShowModalAdd(true);
                }}
              >
                <Icon name="PlusCircle" />
              </Button>
            </div>
          </Tippy>
        </div>
        <div className="details__tab--choose">
          {tab === "tab_one" ? (
            <NetLoan
              data={data}
              onShow={showModalAdd}
              callBack={(isShow) => {
                if (isShow) {
                  setShowModalAdd(true);
                } else {
                  setShowModalAdd(false);
                }
              }}
            />
          ) : tab === "tab_two" ? (
            <NetDeposit
              data={data}
              onShow={showModalAdd}
              callBack={(isShow) => {
                if (isShow) {
                  setShowModalAdd(true);
                } else {
                  setShowModalAdd(false);
                }
              }}
            />
          ) : (
            <NetServiceCharge
              data={data}
              onShow={showModalAdd}
              callBack={(isShow) => {
                if (isShow) {
                  setShowModalAdd(true);
                } else {
                  setShowModalAdd(false);
                }
              }}
            />
          )}
        </div >
      </div>
    </div>
  );
}
