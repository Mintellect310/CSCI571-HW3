import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import highchartsMore from "highcharts/highcharts-more";
import highstock from "highcharts/modules/stock";
import HC_sma from "highcharts/indicators/indicators";
import HC_vbp from "highcharts/indicators/volume-by-price";
import HC_stock from "highcharts/modules/stock";
import {Container} from "react-bootstrap";

highchartsMore(Highcharts);
highstock(Highcharts);
HC_sma(Highcharts);
HC_vbp(Highcharts);
HC_stock(Highcharts);

export default function Charts({ charts }) {
    if(!charts) {
        return <Container>Chart N/A</Container>
    }

    const chartData = charts?.results?.map((data) => {
        const timestamp = data.t - 7*60*60*1000;
        return [timestamp, data.o, data.h, data.l, data.c];
    });
    console.log("Chart Data:", chartData);

    const volumeData = charts?.results?.map((data) => {
        const timestamp = data.t - 7*60*60*1000;
        return [timestamp, data.v];
    });
    console.log("Volume Data:", volumeData);

    const options = {
        rangeSelector: {
            buttons: [
                {
                    type: "month",
                    count: 1,
                    text: "1m",
                },
                {
                    type: "month",
                    count: 3,
                    text: "3m",
                },
                {
                    type: "month",
                    count: 6,
                    text: "6m",
                },
                {
                    type: "ytd",
                    text: "YTD",
                },
                {
                    type: "year",
                    count: 1,
                    text: "1y",
                },
                {
                    type: "all",
                    text: "All",
                },
            ],
            selected: 2,
            inputEnabled: true,
        },
        title: {
            text: `${charts.ticker} Historical`
        },
        subtitle: {
            text: "With SMA and Volume by Price technical indicators",
        },
        chart: {
            type: "line",
            backgroundColor: "#f0f0f0",
            height: 700
        },
        series: [
            {
                type: "ohlc",
                name: `${charts.ticker} Stock Price`,
                data: chartData,
                id: "ohlc",
                threshold: null,
            },
            {
                type: "candlestick",
                linkedTo: "ohlc",
                data: chartData,
                zIndex: 1,
                color: "#2aa7fb",
                marker: {
                    enabled: false,
                },
                enableMouseTracking: false,
            },
            {
                type: "sma",
                linkedTo: "ohlc",
                zIndex: 1,
                color: "#fc6844",
                marker: {
                    enabled: false,
                },
            },
            {
                type: "column",
                name: "Volume",
                data: volumeData,
                id: "volume",
                yAxis: 1,
                threshold: null,
                color: "#494ab9",
            },
            {
                type: "vbp",
                linkedTo: "ohlc",
                volumeSeriesID: "volume",
                zIndex: -1,
                dataLabels: {
                    enabled: false,
                },
                zoneLines: {
                    enabled: false,
                },
            },
        ],
        xAxis: {
            type: "datetime",
        },
        yAxis: [
            {
                labels: {
                    align: "right",
                    x: -4,
                },
                title: {
                    text: "OHLC",
                },
                height: "60%",
                lineWidth: 3,
                resize: {
                    enabled: true,
                },
            },
            {
                labels: {
                    align: "right",
                    x: -3,
                },
                title: {
                    text: "Volume",
                },
                top: "65%",
                height: "35%",
                offset: 1,
                lineWidth: 3,
            },
        ],
        tooltip: {
            split: true,
        },
        responsive: {
            rules: [
                {
                    condition: {
                        maxWidth: 768,
                    },
                    chartOptions: {
                        // Options for mobile view
                    },
                },
            ],
        },
    };

    return (
        <HighchartsReact
            highcharts={Highcharts}
            options={options}
            constructorType={"stockChart"}
        />
    );
}
