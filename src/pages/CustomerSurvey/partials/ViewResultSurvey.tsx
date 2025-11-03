import React, { Fragment, useEffect, useMemo, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Modal, { ModalBody, ModalFooter, ModalHeader } from "components/modal/modal";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IActionModal } from "model/OtherModel";
import Loading from "components/loading";
import SelectCustom from "components/selectCustom/selectCustom";
import SurveyFormService from "services/SurveyFormService";
import { showToast } from "utils/common";
import "./ViewResultSurvey.scss";

interface IViewResultSurveyProps {
  onShow: boolean;
  onHide: () => void;
  data: any;
}

export default function ViewResultSurvey(props: IViewResultSurveyProps) {
  const { onShow, onHide, data } = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lstParams, setLstParams] = useState([]);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [dataChoose, setDataChoose] = useState([]);

  const [chartData, setChartData] = useState({
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
      pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.sum} người đánh giá</b> (chiếm: {point.y}%)',
    },

    series: [
      {
        name: "",
        colorByPoint: true,
        data: [],
      },
    ],
  });

  const handGetStatisticSurvey = async (id: number, params?: any) => {
    if (!id) return;

    setIsLoading(true);

    const response = await SurveyFormService.statistic(id, params);

    if (response.code === 0) {
      const result = response.result;

      const checkData = result.filter((item) => item.count !== 0).length > 0;
      console.log("checkData : ", checkData);

      if (checkData) {
        const total = result.reduce((sum, item) => sum + item.count, 0);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let remainingPercentage = 100;

        // Tính tỉ lệ phần trăm cho mỗi mục trong dữ liệu và làm tròn
        const changeResult = result.map((item) => {
          const percentage = (item.count / total) * 100;
          const roundedPercentage = Math.round(percentage);
          remainingPercentage -= roundedPercentage;
          return {
            name: `${item.rating} sao`,
            sum: item.count,
            y: roundedPercentage,
          };
        });

        setChartData({
          ...chartData,
          series: [
            {
              ...chartData.series,
              data: changeResult,
            } as any,
          ],
        });
        setIsNoItem(false);
      } else {
        setIsNoItem(true);
      }
    } else {
      showToast("Có lỗi xảy ra. Vui lòng thử lại sau !", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (onShow && data) {
      const changeData = data.params ? JSON.parse(data.params) : [];

      const result = changeData
        .map((item) => {
          if (item.key !== "" && item.value !== "") {
            // const newObj = {};
            // newObj[item.key] = item.value;
            return {
              label: item.key,
              value: item.value,
            };
          } else {
            return null;
          }
        })
        .filter(Boolean);

      setLstParams(result);
    }
  }, [onShow, data]);

  const handleChangeValueParams = (e) => {
    setDataChoose(e);
  };

  const handleClearForm = () => {
    onHide();
    setDataChoose([]);
    setIsNoItem(false);
  };

  useEffect(() => {
    if (data) {
      if (dataChoose && dataChoose.length > 0) {
        const changeDataChoose: any = dataChoose.reduce((result, item) => {
          if (item.label && item.value) {
            result[item.label] = item.value;
          }
          return result;
        }, {});

        handGetStatisticSurvey(data.id, changeDataChoose);
      } else {
        handGetStatisticSurvey(data.id);
      }
    }
  }, [dataChoose, data]);

  const actions = useMemo<IActionModal>(
    () => ({
      actions_right: {
        buttons: [
          {
            title: "Đóng",
            color: "primary",
            variant: "outline",
            callback: () => {
              handleClearForm();
            },
          },
        ],
      },
    }),
    []
  );

  return (
    <Fragment>
      <Modal
        isFade={true}
        isOpen={onShow}
        isCentered={true}
        staticBackdrop={true}
        toggle={() => handleClearForm()}
        className="modal-view-result-survey"
      >
        <div className="box-view-result-survey">
          <ModalHeader title={`Kết quả khảo sát`} toggle={() => handleClearForm()} />
          <ModalBody>
            <div className="body__result--survey">
              <div className="filter__parmas--chart">
                <SelectCustom
                  name="params"
                  fill={true}
                  options={lstParams}
                  placeholder="Chọn tham số lọc"
                  onChange={(e) => handleChangeValueParams(e)}
                  isMulti={true}
                  value={dataChoose}
                  special={true}
                />
              </div>

              {!isNoItem && !isLoading ? (
                <div className="chart__common">
                  <HighchartsReact highcharts={Highcharts} allowChartUpdate={true} options={chartData} />
                </div>
              ) : isLoading ? (
                <Loading />
              ) : (
                <SystemNotification description={<span>Hiện tại chưa có kết quả khảo sát nào.</span>} type="no-item" />
              )}
            </div>
          </ModalBody>
          <ModalFooter actions={actions} />
        </div>
      </Modal>
    </Fragment>
  );
}
