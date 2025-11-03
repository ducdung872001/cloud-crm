import React, { Fragment, memo, useEffect, useRef, useState } from "react";
import "./ReportTimeCall.scss";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";

export default function ReportTimeCall(props: any) {
  const { onShow } = props;

  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({
    chart: {
        type: 'column'
    },
    title: {
        text: '',
        align: 'left'
    },
    subtitle: {
        text:
            '',
        align: 'left'
    },
    xAxis: {
        categories: ['18/8', '19/8', '20/8', '21/8', '22/8', '23/8'],
        crosshair: true,
        accessibility: {
            description: 'Day'
        }
    },
    yAxis: {
        min: 0,
        title: {
            text: ''
        }
    },
    tooltip: {
        valueSuffix: ' (s)'
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0
        }
    },
    series: [
        {
            name: 'Thời gian bắt máy',
            data: [90, 80, 50, 75, 83, 82],
            color: '#3366CC'
        },
        {
            name: 'Thời gian đàm thoại',
            data: [300, 430, 190, 360, 240, 380],
            color: '#FF9900'
        }
    ]
});


  return (
        <div className="card-box box__item report-time-call">
            <div className="title d-flex align-items-start justify-content-between">
              <div style={{ display: "flex", alignItems: "center", marginBottom: '1.5rem' }}>
                <span style={{fontSize: 18, fontWeight:'600'}}>Thời gian bắt máy và đàm thoại</span>
              </div>
            </div>

            <div className="chart__common">
                <HighchartsReact highcharts={Highcharts} ref={chartRef} allowChartUpdate={true} options={chartData} />
            </div>
            
        </div>
  );
}
