import React, { useEffect, useRef, useState } from "react";
import DynamicChart from "./partials/DynamicChart";
import Demographic from "./partials/Demographic";
import TransactionHistory from "./partials/TransactionHistory";
import BehaviorOrInterests from "./partials/BehaviorOrInterests";
import Other from "./partials/Other";
import Icon from "components/icon";
import Input from "components/input/input";
import { useOnClickOutside } from "utils/hookCustom";
import CustomerService from "services/CustomerService";
import { showToast } from "utils/common";

import "./index.scss";

export default function CustomerSourceAnalysis() {
  const refOptionChart = useRef();
  const refContainerOptionChart = useRef();

  const [searchChart, setSearchChart] = useState<string>("");
  const [isShowOptionChart, setIsShowOptionChart] = useState<boolean>(false);

  useOnClickOutside(refOptionChart, () => setIsShowOptionChart(false), ["search__chart"]);

  const defaultOptionView = [
    {
      id: 0,
      name: "Nhân khẩu học",
    },
    {
      id: 1,
      name: "Lịch sử giao dịch",
    },
    {
      id: 2,
      name: "Hành vi, sở thích",
    },
    {
      id: 3,
      name: "Khác",
    },
  ];

  const lstType = [
    {
      name: "Doanh nghiệp",
      type: "enterprise",
    },
    {
      name: "Cá nhân",
      type: "personal",
    },
  ];

  const lstOptionChart = [
    {
      name: "Bar chart",
      type: "column",
      icon: <Icon name="Barchart" />,
      description: "Biểu đồ phân loại có hỗ trợ nhóm",
    },
    {
      name: "Bar gauge",
      type: "bar",
      icon: <Icon name="Bargauge" />,
      description: "Biểu đồ phân loại có hỗ trợ nhóm",
    },
    {
      name: "Table chart",
      type: "table",
      icon: <Icon name="Charttable" />,
      description: "Biểu đồ phân loại có hỗ trợ nhóm",
    },
    {
      name: "Pie chart",
      type: "pie",
      icon: <Icon name="Piechart" />,
      description: "Biểu đồ phân loại có hỗ trợ nhóm",
    },
  ];

  const [activeOptionView, setActiveOptionView] = useState(0);
  const [infoType, setInfoType] = useState("enterprise");

  const handleChangeValueChart = (e) => {
    const value = e.target.value;
    setSearchChart(value);
    setIsShowOptionChart(true);
  };

  const [lstChartDynamic, setLstChartDynamic] = useState([]);  

  const handleLstChart = async () => {
    const response = await CustomerService.lstChartDynamicChart();

    if (response.code === 0) {
      const result = [...response.result].reverse();
      setLstChartDynamic(result);
    } else {
      showToast(response.message || "Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }
  };

  useEffect(() => {
    if (infoType === "enterprise") {
      handleLstChart();
    }
  }, [infoType]);

  const handleAddChartItem = async (item) => {
    const body = {
      name: "",
      chartType: item.type,
      objectType: "customer",
      fields: [],
      filters: {
        operator: "and",
        conditions: [],
      },
      groups: [],
      order: {
        id: null,
        fieldName: "",
        aggregation: "",
        direction: "desc",
        limit: "",
      },
    };

    const response = await CustomerService.updateChartDynamicChart(body);

    if (response.code === 0) {
      const result = response.result;
      setLstChartDynamic([result, ...lstChartDynamic]);
      showToast("Thêm mới biểu đồ thành công", "success");
    } else {
      showToast(response.mess || "Thêm mới biểu đồ đang lỗi. Vui lòng thử lại sau !", "error");
    }
  };

  return (
    <div className="page__customer__source--analysic">
      <div className="type__analysis">
        <div className="choose__type">
          {lstType.map((item, idx) => {
            return (
              <div
                key={idx}
                className={`item__choose ${item.type === infoType ? "item__choose--active" : ""}`}
                onClick={() => setInfoType(item.type)}
              >
                {item.name}
              </div>
            );
          })}
        </div>
        {infoType === "personal" ? (
          <div className="lst__option--view">
            {defaultOptionView.map((item, idx) => {
              return (
                <div
                  key={idx}
                  className={`option__view ${item.id === activeOptionView ? "active__option" : ""}`}
                  onClick={() => setActiveOptionView(item.id)}
                >
                  {item.name}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="search__chart" ref={refContainerOptionChart}>
            <div className="info--search" onClick={() => setIsShowOptionChart(!isShowOptionChart)}>
              <Input
                name="searchChart"
                fill={true}
                value={searchChart}
                onChange={(e) => handleChangeValueChart(e)}
                placeholder="Tìm kiếm biểu đồ"
                icon={<Icon name="Search" />}
                iconPosition="left"
              />
            </div>

            {isShowOptionChart && (
              <div className="lst__option--chart" ref={refOptionChart}>
                {lstOptionChart.map((item, idx) => {
                  return (
                    <div
                      key={idx}
                      className="item__chart"
                      onClick={() => {
                        setIsShowOptionChart(false);
                        handleAddChartItem(item);
                      }}
                    >
                      <div className="icon-chart">{item.icon}</div>

                      <div className="info-chart">
                        <h4 className="name-chart">{item.name}</h4>
                        <span className="desc-chart">{item.description}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {infoType == "enterprise" ? (
        <DynamicChart lstChartDynamic={lstChartDynamic} callBack={(data) => setLstChartDynamic(data)} />
      ) : activeOptionView === 0 ? (
        <Demographic />
      ) : activeOptionView === 1 ? (
        <TransactionHistory />
      ) : activeOptionView === 2 ? (
        <BehaviorOrInterests />
      ) : (
        <Other />
      )}
    </div>
  );
}
