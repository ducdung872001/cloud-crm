import React, { useContext, useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

export default function StackedBar(props: any) {
  const { classNames, data } = props;

  const [chartData, setChartData] = useState({
    chart: {
        type: 'bar'
    },
    title: {
        text: 'Ferry passengers by vehicle type 2024'
    },
    xAxis: {
        categories: [
            'January', 'February', 'March', 'April', 'May'
        ]
    },
    yAxis: {
        min: 0,
        title: {
            text: ''
        }
    },
    legend: {
        reversed: true
    },
    plotOptions: {
        series: {
            stacking: 'normal',
            dataLabels: {
                enabled: true
            }
        }
    },
    series: [{
        name: 'Motorcycles',
        data: [74, 27, 52, 93, 1272]
    }, {
        name: 'Null-emission vehicles',
        data: [2106, 2398, 3046, 3195, 4916]
    }, {
        name: 'Conventional vehicles',
        data: [12213, 12721, 15242, 16518, 25037]
    }]
});

  return (
      
      <div className="chart-revenue">
        <HighchartsReact highcharts={Highcharts} allowChartUpdate={true} options={chartData} />
      </div>
  );
}
