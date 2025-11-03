import React, { Fragment, useEffect, useRef, useState } from "react";
import Tippy from "@tippyjs/react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Icon from "components/icon";
import Input from "components/input/input";
import NummericInput from "components/input/numericInput";
import Switch from "components/switch/switch";
import SelectCustom from "components/selectCustom/selectCustom";
import CustomerService from "services/CustomerService";
import { showToast } from "utils/common";
import Button from "components/button/button";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { useOnClickOutside } from "utils/hookCustom";

import "./index.scss";

export default function DynamicChart({ lstChartDynamic, callBack }) {
  const [lstField, setLstField] = useState([]);
  const [isLoadingField, setIsLoadingField] = useState<boolean>(false);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);

  const handleLstField = async () => {
    setIsLoadingField(true);

    const response = await CustomerService.fieldChart();

    if (response.code === 0) {
      const result = [...response.result].map((item) => {
        return {
          value: item.field,
          label: item.description,
          type: item.dataType,
          source: item.source,
          id: item.id,
        };
      });
      setLstField(result);
    } else {
      showToast(response.mesage ?? "Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }

    setIsLoadingField(false);
  };

  useEffect(() => {
    handleLstField();
  }, []);

  const lstConditionColumn = [
    {
      value: "avg",
      label: "AVG",
    },
    {
      value: "count",
      label: "COUNT",
    },
    {
      value: "max",
      label: "MAX",
    },
    {
      value: "min",
      label: "MIN",
    },
    {
      value: "sum",
      label: "SUM",
    },
    {
      value: "variance",
      label: "VARIANCE",
    },
    {
      value: "stddev",
      label: "STDDEV",
    },
  ];

  const lstConditionOrder = [
    {
      value: "avg",
      label: "AVG",
    },
    {
      value: "count",
      label: "COUNT",
    },
    {
      value: "max",
      label: "MAX",
    },
    {
      value: "min",
      label: "MIN",
    },
    {
      value: "sum",
      label: "SUM",
    },
  ];

  const lstConditionFilter = [
    {
      value: "in",
      label: "IN",
    },
    {
      value: "nin",
      label: "NIN",
    },
    {
      value: "eq",
      label: "EQUAL",
    },
    {
      value: "like",
      label: "LIKE",
    },
    {
      value: "ne",
      label: "NOT_EQUAL",
    },
    {
      value: "gt",
      label: "GREATER_THAN",
    },
    {
      value: "lt",
      label: "LESS_THAN",
    },
    {
      value: "gte",
      label: "GREATER_THAN_OR_EQUAL",
    },
    {
      value: "lte",
      label: "LESS_THAN_OR_EQUAL",
    },
    {
      value: "is_not_null",
      label: "IS_NOT_NULL",
    },
    {
      value: "is_null",
      label: "IS_NULL",
    },
  ];

  const lstOptionConditionFilter = [
    {
      value: "and",
      label: "AND",
    },
    {
      value: "or",
      label: "OR",
    },
  ];

  const [lstChart, setLstChart] = useState([]);
  const [idxChart, setIdxChart] = useState<number>(null);
  const [isLoadingSaveChart, setIsLoadingSaveChart] = useState<boolean>(false);

  const handleViewChart = async (dataProps) => {
    if (!dataProps) return;

    let chartData = null;

    const response = await CustomerService.viewChartDynamicChart(dataProps.id);

    if (response.code === 0) {
      const result = response.result;

      const total = result.reduce((sum, item) => sum + Object.values(item)[0], 0);
      let remainingPercentage = 100;

      // Tính tỉ lệ phần trăm cho mỗi mục trong dữ liệu và làm tròn
      const changeResult = result.map((item, index) => {
        const percentage = (((Object.values(item)[0] || 0) as number) / total) * 100;
        let roundedPercentage = Math.round(percentage);

        if (index === result.length - 1) {
          roundedPercentage += remainingPercentage;
        } else {
          remainingPercentage -= roundedPercentage;
        }

        const { count, ...rest } = item;

        return {
          name: Object.values(rest)[0] || "",
          sum: Object.values(item)[0],
          y: roundedPercentage || 0,
        };
      });

      if (dataProps.chartType === "table") {
        chartData = [...result];
      } else if (dataProps.chartType === "pie") {
        chartData = {
          chart: {
            type: "pie",
          },
          title: {
            text: "",
          },
          credits: {
            enabled: false,
          },
          accessibility: {
            announceNewData: {
              enabled: true,
            },
            point: {
              valueSuffix: "%",
            },
          },
          plotOptions: {
            pie: {
              allowPointSelect: true,
              borderWidth: 2,
              cursor: "pointer",
              dataLabels: {
                enabled: true,
                distance: 20,
                format: "{point.name}",
              },
            },
          },
          tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.sum} người</b> (chiếm: {point.y}%)',
          },
          series: [
            {
              name: "",
              colorByPoint: true,
              data: changeResult,
            },
          ],
        };
      } else if (dataProps.chartType === "bar") {
        chartData = {
          chart: {
            type: "bar",
          },
          title: {
            text: "",
          },
          credits: {
            enabled: false,
          },
          accessibility: {
            announceNewData: {
              enabled: true,
            },
          },
          xAxis: {
            type: "category",
          },
          yAxis: {
            title: {
              text: "",
            },
          },
          legend: {
            enabled: false,
          },
          plotOptions: {
            column: {
              colorByPoint: true,
            },
            series: {
              borderWidth: 0.3,
              dataLabels: {
                enabled: true,
                format: "{point.y:.1f}%",
                style: {
                  fontWeight: "bold",
                },
              },
            },
          },
          tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">Số lượng</span>: <b>{point.sum}</b>',
          },
          series: [
            {
              name: "",
              colorByPoint: true,
              data: changeResult,
            },
          ],
        };
      } else {
        chartData = {
          chart: {
            type: "column",
            margin: [40, 0, 0],
          },
          title: {
            text: "",
          },
          credits: {
            enabled: false,
          },
          xAxis: {
            categories: result.map((item) => Object.values(item)[1]).flat(),
            crosshair: true,
            labels: {
              style: {
                fontSize: "1.4rem",
              },
            },
          },
          yAxis: {
            min: 0,
            title: "",
          },
          tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><br>',
            pointFormat: '<span style="color:{point.color}">Số lượng</span>: <b>{point.sum} người</b>',
          },
          plotOptions: {
            column: {
              pointPadding: 0.2,
              borderWidth: 0,
            },
          },
          series: changeResult.map((item) => {
            return {
              name: item.name,
              data: [item.sum],
            };
          }),
        };
      }
    } else {
      showToast(response.message || "Biểu đồ đang lỗi. Vui lòng xem lại sau !", "error");
    }

    return chartData;
  };

  const fetchDataChart = async () => {
    if (lstChartDynamic && lstChartDynamic.length > 0 && lstField && lstField.length > 0) {
      const changeLstChartDynamic = await Promise.all(
        lstChartDynamic.map(async (item) => {
          const viewChart = await handleViewChart(item);
          return {
            id: item.id,
            name: item.name,
            nameChart: `Chart ${item.chartType}`,
            viewChart: viewChart,
            chartType: item.chartType,
            objectType: item.objectType,
            fields: item.fields,
            filters: {
              operator: item.filters.operator,
              conditions: [...item.filters.conditions].map((el) => {
                const takeTypeCondition = lstField.find((ol) => ol.value === el.fieldName);
                return {
                  ...el,
                  type: takeTypeCondition.type,
                };
              }),
            },
            groups: item.groups.map((el) => {
              const takeData = lstField.find((ol) => ol.value === el);
              return {
                fieldName: takeData ? takeData.value : "",
              };
            }),
            order: item.order,
            isFilter: true,
            isGroup: true,
            isOrder: true,
            isView: true,
          };
        })
      );

      setLstChart(changeLstChartDynamic);
    }
  };

  useEffect(() => {
    fetchDataChart();
  }, [lstChartDynamic, lstField]);

  const handleChangeValueNameChart = (e, idx) => {
    const value = e.target.value;

    setLstChart((prev) =>
      prev.map((item, index) => {
        if (idx === index) {
          return {
            ...item,
            name: value,
          };
        }

        return item;
      })
    );
  };

  const handleConditionFilter = (isCheck, idx) => {
    setLstChart((prev) =>
      prev.map((item, index) => {
        if (idx === index) {
          return {
            ...item,
            isFilter: isCheck,
          };
        }

        return item;
      })
    );
  };

  const handleConditionGroup = (isCheck, idx) => {
    setLstChart((prev) =>
      prev.map((item, index) => {
        if (idx === index) {
          return {
            ...item,
            isGroup: isCheck,
          };
        }

        return item;
      })
    );
  };

  const handleConditionOrder = (isCheck, idx) => {
    setLstChart((prev) =>
      prev.map((item, index) => {
        if (idx === index) {
          return {
            ...item,
            isOrder: isCheck,
          };
        }

        return item;
      })
    );
  };

  const handleConditionView = (isCheck, idx) => {
    setLstChart((prev) =>
      prev.map((item, index) => {
        if (idx === index) {
          return {
            ...item,
            isView: isCheck,
          };
        }

        return item;
      })
    );
  };

  //TODO: Start logic column
  const handleAddColumn = (idx) => {
    setLstChart((prev) =>
      prev.map((item, index) => {
        if (idx === index) {
          const newFieldItem = {
            source: "",
            fieldName: "",
            aggregation: "",
            alias: "",
            id: null,
          };

          return {
            ...item,
            fields: [...item.fields, newFieldItem],
          };
        }

        return item;
      })
    );
  };

  const handleChangeValueFieldName = (e, index, idx) => {
    setLstChart((prev) =>
      prev.map((item, ik) => {
        if (idx === ik) {
          return {
            ...item,
            fields: item.fields.map((el, ij) => {
              if (ij === index) {
                return {
                  ...el,
                  fieldName: e.value,
                  alias: e.label,
                  id: e.id,
                  source: e.source,
                };
              }

              return el;
            }),
          };
        }

        return item;
      })
    );
  };

  const handleChangeValueAggregation = (e, index, idx) => {
    const value = e.value;

    setLstChart((prev) =>
      prev.map((item, ik) => {
        if (idx === ik) {
          return {
            ...item,
            fields: item.fields.map((el, ij) => {
              if (ij === index) {
                return {
                  ...el,
                  aggregation: value,
                };
              }

              return el;
            }),
          };
        }

        return item;
      })
    );
  };

  const handleChangeValueAlias = (e, index, idx) => {
    const value = e.target.value;

    setLstChart((prev) =>
      prev.map((item, ik) => {
        if (idx === ik) {
          return {
            ...item,
            fields: item.fields.map((el, ij) => {
              if (ij === index) {
                return {
                  ...el,
                  alias: value,
                };
              }

              return el;
            }),
          };
        }

        return item;
      })
    );
  };

  const handleDeleteItemColumn = (index, idx) => {
    setLstChart((prev) =>
      prev.map((item, ik) => {
        if (ik === idx) {
          return {
            ...item,
            fields: item.fields.filter((_, il) => il !== index),
          };
        }

        return item;
      })
    );
  };
  //TODO: End logic column

  //TODO: Start logic filter
  const handleChangeValueOperator = (e, idx) => {
    const value = e.value;

    setLstChart((prev) =>
      prev.map((item, index) => {
        if (index === idx) {
          return {
            ...item,
            filters: {
              ...item.filters,
              operator: value,
            },
          };
        }

        return item;
      })
    );
  };

  const handleAddFilter = (idx) => {
    setLstChart((prev) =>
      prev.map((item, index) => {
        if (idx === index) {
          const newItemFilter = {
            fieldName: "",
            operator: "",
            value: "",
            type: "",
            id: null,
          };

          return {
            ...item,
            filters: {
              ...item.filters,
              conditions: [...item.filters.conditions, newItemFilter],
            },
          };
        }

        return item;
      })
    );
  };

  const handleChangeValueFilterName = (e, index, idx) => {
    setLstChart((prev) =>
      prev.map((item, ik) => {
        if (ik === idx) {
          return {
            ...item,
            filters: {
              ...item.filters,
              conditions: [...item.filters.conditions].map((el, il) => {
                if (il === index) {
                  return {
                    ...el,
                    fieldName: e.value,
                    type: e.type,
                    id: e.id,
                  };
                }

                return el;
              }),
            },
          };
        }

        return item;
      })
    );
  };

  const handleChangeValueFilterOperator = (e, index, idx) => {
    const value = e.value;

    setLstChart((prev) =>
      prev.map((item, ik) => {
        if (ik === idx) {
          return {
            ...item,
            filters: {
              ...item.filters,
              conditions: [...item.filters.conditions].map((el, il) => {
                if (il === index) {
                  return {
                    ...el,
                    operator: value,
                  };
                }

                return el;
              }),
            },
          };
        }

        return item;
      })
    );
  };

  const handleChageValueFilterValueNumber = (e, index, idx) => {
    const value = e.floatValue;

    setLstChart((prev) =>
      prev.map((item, ik) => {
        if (ik === idx) {
          return {
            ...item,
            filters: {
              ...item.filters,
              conditions: [...item.filters.conditions].map((el, il) => {
                if (il === index) {
                  return {
                    ...el,
                    value: value,
                  };
                }

                return el;
              }),
            },
          };
        }

        return item;
      })
    );
  };

  const handleChangeValueFilterValue = (e, index, idx) => {
    const value = e.target.value;

    setLstChart((prev) =>
      prev.map((item, ik) => {
        if (ik === idx) {
          return {
            ...item,
            filters: {
              ...item.filters,
              conditions: [...item.filters.conditions].map((el, il) => {
                if (il === index) {
                  return {
                    ...el,
                    value: value,
                  };
                }

                return el;
              }),
            },
          };
        }

        return item;
      })
    );
  };

  const handleDeleteItemFilter = (index, idx) => {
    setLstChart((prev) =>
      prev.map((item, ik) => {
        if (ik === idx) {
          return {
            ...item,
            filters: {
              ...item.filters,
              conditions: [...item.filters.conditions].filter((_, il) => il !== index),
            },
          };
        }

        return item;
      })
    );
  };
  //TODO: End logic filter

  //TODO: Start logic group
  const handleAddGroup = (idx) => {
    setLstChart((prev) =>
      prev.map((item, index) => {
        if (index === idx) {
          const newItemGroup = {
            fieldName: "",
          };

          return {
            ...item,
            groups: [...item.groups, newItemGroup],
          };
        }

        return item;
      })
    );
  };

  const handleChangeValueGroupName = (e, index, idx) => {
    const value = e.value;

    setLstChart((prev) =>
      prev.map((item, ik) => {
        if (ik === idx) {
          return {
            ...item,
            groups: [...item.groups].map((el, il) => {
              if (il === index) {
                return {
                  ...el,
                  fieldName: value,
                };
              }

              return el;
            }),
          };
        }

        return item;
      })
    );
  };

  const handleDeleteItemGroup = (index, idx) => {
    setLstChart((prev) =>
      prev.map((item, ik) => {
        if (ik === idx) {
          return {
            ...item,
            groups: [...item.groups].filter((_, il) => il !== index),
          };
        }

        return item;
      })
    );
  };
  //TODO: End logic group

  //TODO: Start logic order
  const handleChangeValueFieldOrder = (e, idx) => {
    const value = e.value;

    setLstChart((prev) =>
      prev.map((item, index) => {
        if (idx === index) {
          return {
            ...item,
            order: {
              ...item.order,
              fieldName: value,
            },
          };
        }

        return item;
      })
    );
  };

  const handleChangeValueAggregationOrder = (e, idx) => {
    const value = e.value;

    setLstChart((prev) =>
      prev.map((item, index) => {
        if (idx === index) {
          return {
            ...item,
            order: {
              ...item.order,
              aggregation: value,
            },
          };
        }

        return item;
      })
    );
  };

  const handleChangeConditionOrder = (value, idx) => {
    setLstChart((prev) =>
      prev.map((item, index) => {
        if (idx === index) {
          return {
            ...item,
            order: {
              ...item.order,
              direction: value,
            },
          };
        }

        return item;
      })
    );
  };

  const handleChageValueFieldOrderLimit = (e, idx) => {
    const value = e.floatValue;

    setLstChart((prev) =>
      prev.map((item, index) => {
        if (idx === index) {
          return {
            ...item,
            order: {
              ...item.order,
              limit: value,
            },
          };
        }

        return item;
      })
    );
  };
  //TODO: End logic order

  const onDelete = async (id: number) => {
    const response = await CustomerService.deleteChartDynamicChart(id);

    if (response.code === 0) {
      showToast("Xóa biểu đồ thành công", "success");
      const result = [...lstChart].filter((item) => item.id !== id);
      setLstChart(result);
      callBack(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const showDialogConfirmDelete = (item?: any) => {
    const contentDialog: IContentDialog = {
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: <Fragment>Xóa...</Fragment>,
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa biểu đồ
          {item ? <strong> {item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => onDelete(item.id),
    };
    setContentDialog(contentDialog);
    setShowDialog(true);
  };

  const handleSaveChart = async (item) => {
    setIsLoadingSaveChart(true);

    const body = {
      ...item,
      filters: {
        ...item.filters,
        conditions: [...item.filters.conditions].map((el) => {
          return {
            fieldName: el.fieldName,
            operator: el.operator,
            value: el.value,
          };
        }),
      },
      groups: [...item.groups].map((ol) => Object.values(ol)).flat(),
    };

    delete body.isFilter;
    delete body.isGroup;
    delete body.isOrder;
    delete body.nameChart;

    const response = await CustomerService.updateChartDynamicChart(body);

    if (response.code === 0) {
      const updatedItem = lstChart.find((el) => el.id === item.id);

      if (updatedItem) {
        const updatedViewChart = await handleViewChart(updatedItem);
        const updatedLstChart = lstChart.map((el) => (el.id === item.id ? { ...el, viewChart: updatedViewChart } : el));

        setLstChart(updatedLstChart);
      }

      showToast("Lưu biểu đồ thành công", "success");
    } else {
      showToast(response.message || "Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
    }

    setIsLoadingSaveChart(false);
  };

  const refOptionViewChart = useRef();
  const refOptionContainerViewChart = useRef();

  const [showViewOption, setShowViewOption] = useState<boolean>(false);
  useOnClickOutside(refOptionViewChart, () => setShowViewOption(false), ["box__option"]);

  const lstOptionView = [
    {
      label: "Sửa",
      icon: "Pencil",
      type: "edit",
    },
    {
      label: "Xóa",
      icon: "Trash",
      type: "delete",
    },
  ];

  const handleOptionView = (value, data, idx) => {
    setShowViewOption(false);

    if (value.type === "edit") {
      setLstChart((prev) =>
        prev.map((item, index) => {
          if (index === idx) {
            return {
              ...item,
              isView: false,
            };
          }

          return item;
        })
      );
    } else {
      showDialogConfirmDelete(data);
    }
  };

  const divRefs = useRef([]);

  const [width, setWidth] = useState<number>(1024);

  useEffect(() => {
    lstChart.forEach((_, idx) => {
      const divElement = divRefs.current[idx];
      if (divElement) {
        const width = divElement.clientWidth;
        setWidth(width - 20);
      }
    });
  }, [lstChart, idxChart]);

  return (
    <div className="box__dynamic--chart">
      {lstChart && lstChart.length > 0 && (
        <div className="lst__chart--dynamic">
          {lstChart.map((item, idx) => {
            return item.isView ? (
              <div key={idx} className="regime__view--chart" onClick={() => setIdxChart(idx)}>
                <div className="info__chart">
                  <h2 className="name--chart">{item.name}</h2>

                  <div
                    ref={refOptionContainerViewChart}
                    className={`icon__option--view ${showViewOption && idx === idxChart ? "active__option--view" : ""}`}
                    onClick={() => setShowViewOption(!showViewOption)}
                  >
                    <Icon name="Bars" />

                    {showViewOption && idx === idxChart && (
                      <div className="lst__option-view-chart" ref={refOptionViewChart}>
                        {lstOptionView.map((el, ik) => {
                          return (
                            <div
                              key={ik}
                              className="item__option-view-chart"
                              onClick={(e) => {
                                e && e.preventDefault();
                                handleOptionView(el, item, idx);
                              }}
                            >
                              <Icon name={el.icon} /> {el.label}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="desc__chart">
                  {item.chartType === "table" ? (
                    <table className="chart-table">
                      <thead>
                        <tr>
                          {item.viewChart &&
                            item.viewChart.map((el, il) => {
                              return (
                                <th key={il} className="th-chart">
                                  {Object.values(el)[1]}
                                </th>
                              );
                            })}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {item.viewChart &&
                            item.viewChart.map((el, il) => {
                              return (
                                <td key={il} className="td-chart">
                                  {Object.values(el)[0]}
                                </td>
                              );
                            })}
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <HighchartsReact highcharts={Highcharts} allowChartUpdate={true} options={item.viewChart} />
                  )}
                </div>
              </div>
            ) : (
              <div
                key={idx}
                className={`item__chart--dynamic ${idx === idxChart ? "item__chart--dynamic--active" : ""}`}
                onClick={() => setIdxChart(idx)}
                ref={(el) => (divRefs.current[idx] = el)}
              >
                <div className="name__chart">
                  <Input
                    name="name"
                    value={item.name}
                    fill={true}
                    placeholder="Nhập tên biểu đồ"
                    onChange={(e) => handleChangeValueNameChart(e, idx)}
                  />
                </div>

                <div className="view__chart">
                  {item.chartType === "table" ? (
                    <table className="chart-table">
                      <thead>
                        <tr>
                          {item.viewChart &&
                            item.viewChart.map((el, il) => {
                              return (
                                <th key={il} className="th-chart">
                                  {Object.values(el)[1]}
                                </th>
                              );
                            })}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {item.viewChart &&
                            item.viewChart.map((el, il) => {
                              return (
                                <td key={il} className="td-chart">
                                  {Object.values(el)[0]}
                                </td>
                              );
                            })}
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <div className="content__chart" style={!item.isView ? { width: `${width}px` } : {}}>
                      {width != 1024 && <HighchartsReact highcharts={Highcharts} allowChartUpdate={true} options={item.viewChart} />}
                    </div>
                  )}
                </div>

                <div className="query__chart">
                  <div className="query__chart--header">
                    <div className="confirm-chart">
                      Biểu đồ: <span style={{ fontWeight: "500" }}>{item.nameChart}</span>
                    </div>
                    <div className="condition-chart">
                      <div className="condition-chart--filter">
                        <Switch name="filter" label="Filter" checked={item.isFilter} onChange={(e) => handleConditionFilter(e.target.checked, idx)} />
                      </div>
                      <div className="condition-chart--group">
                        <Switch name="group" label="Group" checked={item.isGroup} onChange={(e) => handleConditionGroup(e.target.checked, idx)} />
                      </div>
                      <div className="condition-chart--order">
                        <Switch name="order" label="Order" checked={item.isOrder} onChange={(e) => handleConditionOrder(e.target.checked, idx)} />
                      </div>
                      <div className="condition-chart--view">
                        <Switch name="view" label="View" checked={item.isView} onChange={(e) => handleConditionView(e.target.checked, idx)} />
                      </div>
                    </div>
                  </div>
                  <div className="query__chart--body">
                    <div className="box__data--item box__data--column">
                      <span className="name-item name-column">Column</span>
                      <div className="lst-item lst__column">
                        {item.fields.map((ol, index) => {
                          return (
                            <div key={index} className="item-item item-column">
                              <div className="info-column">
                                <div className="form-column">
                                  <SelectCustom
                                    name="fieldName"
                                    value={ol.fieldName}
                                    fill={true}
                                    options={lstField}
                                    isLoading={isLoadingField}
                                    placeholder="Chọn trường dữ liệu"
                                    onChange={(e) => handleChangeValueFieldName(e, index, idx)}
                                  />
                                </div>
                                <div className="form-column">
                                  <SelectCustom
                                    name="aggregation"
                                    value={ol.aggregation}
                                    fill={true}
                                    options={lstConditionColumn}
                                    placeholder="Chọn điều kiện"
                                    onChange={(e) => handleChangeValueAggregation(e, index, idx)}
                                  />
                                </div>
                                <div className="form-column">
                                  <Input
                                    name="alias"
                                    value={ol.alias}
                                    fill={true}
                                    placeholder="Nhập tên thay thế"
                                    onChange={(e) => handleChangeValueAlias(e, index, idx)}
                                  />
                                </div>
                              </div>
                              <div className="action-column">
                                <div className="action-column-item action-column-trash" onClick={() => handleDeleteItemColumn(index, idx)}>
                                  <Icon name="Trash" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div
                          style={item.fields.length > 0 ? { marginTop: "2.2rem" } : {}}
                          className="item-add item-column--add"
                          onClick={() => handleAddColumn(idx)}
                        >
                          <Icon name="PlusCircleFill" /> Add column
                        </div>
                      </div>
                    </div>
                    {item.isFilter && (
                      <div className="box__data--item box__data--filter">
                        <span className="name-item name-filter">Filter</span>

                        <div className="lst-item lst__filter">
                          {item.filters.conditions.length > 0 && (
                            <div className="condition-filter">
                              <SelectCustom
                                name="operator"
                                value={item.filters.operator}
                                options={lstOptionConditionFilter}
                                fill={true}
                                onChange={(e) => handleChangeValueOperator(e, idx)}
                              />
                            </div>
                          )}

                          {item.filters.conditions.map((ol, index) => {
                            return (
                              <div key={index} className="item-item item-filter">
                                <div className="info-filter">
                                  <div className="form-filter">
                                    <SelectCustom
                                      name="fieldName"
                                      value={ol.fieldName}
                                      fill={true}
                                      options={lstField}
                                      isLoading={isLoadingField}
                                      placeholder="Chọn trường dữ liệu"
                                      onChange={(e) => handleChangeValueFilterName(e, index, idx)}
                                    />
                                  </div>
                                  <div className="form-filter">
                                    <SelectCustom
                                      name="operator"
                                      value={ol.operator}
                                      fill={true}
                                      options={lstConditionFilter}
                                      placeholder="Chọn điều kiện"
                                      onChange={(e) => handleChangeValueFilterOperator(e, index, idx)}
                                    />
                                  </div>
                                  <div className="form-filter">
                                    {ol.type === "number" ? (
                                      <NummericInput
                                        name="value"
                                        value={ol.value || ""}
                                        fill={true}
                                        placeholder="Nhập giá trị"
                                        disabled={!ol.fieldName}
                                        thousandSeparator={true}
                                        onValueChange={(e) => handleChageValueFilterValueNumber(e, index, idx)}
                                      />
                                    ) : (
                                      <Input
                                        name="value"
                                        value={ol.value || ""}
                                        fill={true}
                                        disabled={!ol.fieldName}
                                        placeholder="Nhập giá trị"
                                        onChange={(e) => handleChangeValueFilterValue(e, index, idx)}
                                      />
                                    )}
                                  </div>
                                </div>
                                <div className="action-filter">
                                  <div className="action-filter-item action-filter-trash" onClick={() => handleDeleteItemFilter(index, idx)}>
                                    <Icon name="Trash" />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          <div
                            style={item.filters.conditions.length > 0 ? { marginTop: "2.2rem" } : {}}
                            className="item-add item-filter--add"
                            onClick={() => handleAddFilter(idx)}
                          >
                            <Icon name="PlusCircleFill" /> Add filter
                          </div>
                        </div>
                      </div>
                    )}
                    {item.isGroup && (
                      <div className="box__data--item box__data--group">
                        <span className="name-item name-group">Group</span>

                        <div className="lst-item lst__group">
                          {item.groups.map((ol, index) => {
                            return (
                              <div key={index} className="item-item item-group">
                                <div className="info-group">
                                  <div className="form-group">
                                    <SelectCustom
                                      name="fieldName"
                                      value={ol.fieldName}
                                      fill={true}
                                      options={lstField}
                                      isLoading={isLoadingField}
                                      placeholder="Chọn trường dữ liệu"
                                      onChange={(e) => handleChangeValueGroupName(e, index, idx)}
                                    />
                                  </div>
                                  <div className="action-group">
                                    <div className="action-group-item action-group-trash" onClick={() => handleDeleteItemGroup(index, idx)}>
                                      <Icon name="Trash" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div
                          style={item.groups.length > 0 ? { marginTop: "2.2rem" } : {}}
                          className="item-add item-group--add"
                          onClick={() => handleAddGroup(idx)}
                        >
                          <Icon name="PlusCircleFill" /> Add group
                        </div>
                      </div>
                    )}
                    {item.isOrder && (
                      <div className="box__data--item box__data--order">
                        <span className="name-item name-group">Order</span>

                        <div className="lst-item lst__order">
                          <div className="item-item item-order">
                            <div className="info-order">
                              <div className="form-order">
                                <SelectCustom
                                  name="fieldName"
                                  value={item.order.fieldName}
                                  fill={true}
                                  options={lstField}
                                  isLoading={isLoadingField}
                                  placeholder="Chọn trường dữ liệu"
                                  onChange={(e) => handleChangeValueFieldOrder(e, idx)}
                                />
                              </div>
                              <div className="form-order">
                                <SelectCustom
                                  name="aggregation"
                                  value={item.order.aggregation}
                                  fill={true}
                                  options={lstConditionOrder}
                                  placeholder="Chọn điều kiện"
                                  onChange={(e) => handleChangeValueAggregationOrder(e, idx)}
                                />
                              </div>
                              <div className="condition-order">
                                <Tippy content="Sắp xếp tăng dần">
                                  <div
                                    className={`condition-order-up ${item.order.direction === "asc" ? "active-condition-order" : ""}`}
                                    onClick={() => handleChangeConditionOrder("asc", idx)}
                                  >
                                    <Icon name="ConditionUp" />
                                  </div>
                                </Tippy>
                                <Tippy content="Sắp xếp giảm dần">
                                  <div
                                    className={`condition-order-down ${item.order.direction === "desc" ? "active-condition-order" : ""}`}
                                    onClick={() => handleChangeConditionOrder("desc", idx)}
                                  >
                                    <Icon name="ConditionDown" />
                                  </div>
                                </Tippy>
                              </div>
                              <div className="form-order">
                                <NummericInput
                                  name="limit"
                                  value={item.order.limit}
                                  fill={true}
                                  placeholder="Nhập giới hạn"
                                  thousandSeparator={true}
                                  onValueChange={(e) => handleChageValueFieldOrderLimit(e, idx)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="action__confirm--chart">
                  <div className="delete-chart">
                    <Button disabled={idx === idxChart && isLoadingSaveChart} color="destroy" onClick={() => showDialogConfirmDelete(item)}>
                      Xóa
                    </Button>
                  </div>
                  <div className="save-chart">
                    <Button disabled={idx === idxChart && isLoadingSaveChart} onClick={() => handleSaveChart(item)}>
                      Lưu {idx === idxChart && isLoadingSaveChart && <Icon name="Loading" />}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
