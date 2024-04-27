import {Col, Container, Row, Table} from "react-bootstrap";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import highchartsMore from "highcharts/highcharts-more";
import highstock from "highcharts/modules/stock";
import HC_sma from "highcharts/indicators/indicators";
import HC_vbp from "highcharts/indicators/volume-by-price";
import HC_stock from "highcharts/modules/stock";

highchartsMore(Highcharts);
highstock(Highcharts);
HC_sma(Highcharts);
HC_vbp(Highcharts);
HC_stock(Highcharts);

export default function Insights({insights, name}) {
    if(!insights) {
        return <Container>Insights N/A</Container>
    }

    return (
        <Container className={"mt-3"}>
            <Row className={"justify-content-center mb-3"}>
                <Col md={6}>
                    <h4>Insider Sentiments</h4>
                    <div>
                        <Table>
                            <tbody>
                                <tr>
                                    <th>{name}</th>
                                    <th>MSPR</th>
                                    <th>Change</th>
                                </tr>
                                <tr>
                                    <th>Total</th>
                                    <td>{insights.insights.mspr_t.toFixed(2)}</td>
                                    <td>{insights.insights.change_t}</td>
                                </tr>
                                <tr>
                                    <th>Positive</th>
                                    <td>{insights.insights.mspr_p.toFixed(2)}</td>
                                    <td>{insights.insights.change_p}</td>
                                </tr>
                                <tr>
                                    <th>Negative</th>
                                    <td>{insights.insights.mspr_n.toFixed(2)}</td>
                                    <td>{insights.insights.change_n}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col sm={12} md={6}>
                    <RecoTrendsChart reco={insights.reco} />
                </Col>
                <Col sm={12} md={6}>
                    <EPSChart earnings={insights.earnings} />
                </Col>
            </Row>
        </Container>
    );
}

const RecoTrendsChart = ({ reco }) => {
    const options = {
        chart: {
            type: 'column',
            backgroundColor: "#f0f0f0"
        },
        credits: {
            enabled: true
        },
        title: {
            text: 'Recommendation Trends'
        },
        xAxis: {
            categories: reco.map(item => item.period.substring(0, 7)),
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: '# Analysis'
            }
        },
        tooltip: {
            headerFormat: `<b>{point.x}</b><br/>`,
            pointFormat: `{series.name}: {point.y}<br/>Total: {point.stackTotal}`
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: true,
                    // color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                }
            }
        },
        series: [{
            name: 'Strong Buy',
            data: reco.map(item => item.strongBuy),
            color: '#186f38'
        }, {
            name: 'Buy',
            data: reco.map(item => item.buy),
            color: '#1db956'
        }, {
            name: 'Hold',
            data: reco.map(item => item.hold),
            color: '#ba8b23'
        }, {
            name: 'Sell',
            data: reco.map(item => item.sell),
            color: '#f35b5c'
        }, {
            name: 'Strong Sell',
            data: reco.map(item => item.strongSell),
            color: '#813230'
        }]
    };

    return (
        <HighchartsReact
            highcharts={Highcharts}
            options={options}
        />
    );
};

const EPSChart = ({ earnings }) => {
    const options = {
        title: {
            text: 'Historical EPS Surprises'
        },
        credits: {
            enabled: true
        },
        chart : {
            backgroundColor: "#f0f0f0"
        },
        xAxis: {
            categories: earnings.map(item => `${item.period}<br/>Surprise: ${item.surprise.toFixed(4)}`),
        },
        yAxis: {
            title: {
                text: 'Quarterly EPS'
            }
        },
        tooltip: {
            shared: true,
            pointFormat: '<span><b>{series.name}</b></span>: <b style="color:{series.color}">{point.y}</b><br/>',
            valueSuffix: ' ',
            split: false
        },
        series: [{
            name: 'Actual',
            data: earnings.map(item => item.actual),
            type: 'spline'
        }, {
            name: 'Estimate',
            data: earnings.map(item => item.estimate),
            type: 'spline'
        }],
        plotOptions: {
            spline: {
                marker: {
                    radius: 4
                }
            }
        }
    };

    return <HighchartsReact
        highcharts={Highcharts}
        options={options}
    />;
};