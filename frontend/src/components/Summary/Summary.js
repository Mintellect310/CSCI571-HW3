import {Col, Container, Row} from "react-bootstrap";
import Highcharts from 'highcharts';
import HighchartsReact from "highcharts-react-official";
import "./Summary.css";
import {useNavigate} from "react-router-dom";

export default function Summary({summary, hourlyData, hourlyDataColor, setSearchValue, handleSearch}) {
    const navigate = useNavigate();

    if(!summary) return (
        <Container>
            Loading Summary...
        </Container>
    );

    return (
        <Container fluid className={"mt-3"}>
            <Row>
                <Col className={"text-08rem mt-1"} sm={12} md={6}>
                    <Row className={"mb-5"}>
                        <Col sm={12} lg={6}>
                            <div><b>High Price:</b> {summary.h ? summary.h.toFixed(2) : "N/A"}</div>
                            <div><b>Low Price:</b> {summary.l ? summary.l.toFixed(2) : "N/A"}</div>
                            <div><b>Open Price:</b> {summary.o ? summary.o.toFixed(2) : "N/A"}</div>
                            <div><b>Prev. Close:</b> {summary.pc ? summary.pc.toFixed(2) : "N/A"}</div>
                        </Col>
                    </Row>
                    <Row>
                        <p className={"fw-bold text-decoration-underline mb-4"} style={{fontSize: "large"}}>About the Company</p>
                        <p><b>IPO Start Date:</b> {summary.ipo || "N/A"}</p>
                        <p><b>Industry:</b> {summary.finnhubIndustry || "N/A"}</p>
                        <p>
                            <b>Webpage: </b>
                            <a href={`${summary.weburl || ""}`} target="_blank" rel="noopener noreferrer">
                                {summary.weburl || "N/A"}
                            </a>
                        </p>
                        <p>
                            <b>Company Peers:</b>
                        </p>
                        <p>
                            {
                                summary.peers &&
                                summary.peers.map((peerTicker, index) => <a className={"link-underline-primary"} style={{cursor: "pointer"}} key={index} onClick={() => {
                                    navigate(`/search/${peerTicker}`);
                                    setSearchValue(peerTicker);
                                    handleSearch(null, peerTicker);
                                }}>{peerTicker}, </a>)
                            }
                            {
                                !summary.peers && (<a>peers info not available</a>)
                            }
                        </p>
                    </Row>
                </Col>
                <Col sm={12} md={6}>
                    <HourlyChart data={hourlyData} color={hourlyDataColor} />
                </Col>
            </Row>
        </Container>
    )
}

const HourlyChart = ({ data, color }) => {
    if(!data || !data.results) return (
        <Container>
            Hourly Chart N/A
        </Container>
    );

    const prices = data.results.map(item => ({
        x: item.t-7*60*60*1000,
        y: item.c
    }));

    const options = {
        rangeSelector: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        navigator: {
            enabled: false
        },
        title: {
            text: `<a style="font-size: 15px">${data.ticker} Hourly Price Variation</a>`,
            style:{
                color: 'gray'
            }
        },
        chart: {
            type: 'line',
            backgroundColor:'#f0f0f0'
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                hour: '%H:%M'
            }
        },
        yAxis: {
            title: {
                text: ''
            },
            labels: {
                align: 'right',
                x: -3
            },
            opposite: true
        },
        series: [{
            name: `${data.ticker}`,
            data: prices,
            color: color,
            tooltip: {
                valueDecimals: 2
            }
        }],
        legend: {
            enabled: false,
        },
        plotOptions: {
            series: {
                marker: {
                    enabled: false
                }
            }
        },
        credits: {
            enabled: true
        }
    };

    return <HighchartsReact
        highcharts={Highcharts}
        options={options}
        constructorType={"stockChart"}
    />;
};