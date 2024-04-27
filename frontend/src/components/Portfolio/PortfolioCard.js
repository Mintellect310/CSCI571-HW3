import {Button, Card, Col, Container, Row} from "react-bootstrap";
import React, {useState} from "react";
import BuyModal from "./BuyModal";
import {useNavigate} from "react-router-dom";
import {formatNumber} from "../../helper";

export default function PortfolioCard({ portfolioItem, balance, handleBuySell, setSearchValue, handleSearch }) {
    const navigate = useNavigate();

    const [showBuyModal, setShowBuyModal] = useState(false);
    const handleBuyOpen = () => setShowBuyModal(true);
    const handleBuyClose = () => setShowBuyModal(false);

    const [showSellModal, setShowSellModal] = useState(false);
    const handleSellOpen = () => setShowSellModal(true);
    const handleSellClose = () => setShowSellModal(false);

    const handleCardClick = () => {
        navigate(`/search/${portfolioItem.ticker}`);
        setSearchValue(portfolioItem.ticker);
        handleSearch(null, portfolioItem.ticker);
    };

    const styling = "text-" + ((portfolioItem.change > 0) ? "success" : (portfolioItem.change < 0) ? "danger" : "dark");

    return (
        <>
            <Card className={"mb-3"}>
                {/* Piazza: https://piazza.com/class/lr3cfhx8jp718d/post/838*/}
                <Card.Header> {/*onClick = {handleCardClick} style={{cursor: "pointer"}}>*/}
                    <h3 className={"d-inline me-2"}>{portfolioItem.ticker}</h3>
                    <h5 className={"text-muted d-inline"}>{portfolioItem.name}</h5>
                </Card.Header>
                <Container fluid className={"my-3 h5"}>
                    <Row>
                        <Col xs={12} sm={6}>
                            <Row>
                                <Col xs={7}>Quantity:</Col>
                                <Col xs={5}>{portfolioItem.quantity}</Col>
                            </Row>
                            <Row>
                                <Col xs={7}>Avg. Cost / Share:</Col>
                                <Col xs={5}>{formatNumber(portfolioItem.avgCost)}</Col>
                            </Row>
                            <Row>
                                <Col xs={7}>Total Cost:</Col>
                                <Col xs={5}>{formatNumber(portfolioItem.totalCost)}</Col>
                            </Row>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Row>
                                <Col xs={7}>Change:</Col>
                                <Col xs={5} className={styling}>
                                    {portfolioItem.change > 0 && <i className="bi bi-caret-up-fill me-1 fs-6"></i>}
                                    {portfolioItem.change < 0 && <i className="bi bi-caret-down-fill me-1 fs-6"></i>}
                                    {formatNumber(portfolioItem.change)}
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={7}>Current Price:</Col>
                                <Col xs={5} className={styling}>{formatNumber(portfolioItem.currentPrice)}</Col>
                            </Row>
                            <Row>
                                <Col xs={7}>Market Value:</Col>
                                <Col xs={5} className={styling}>{formatNumber(portfolioItem.marketValue)}</Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
                <Card.Footer>
                    <Button variant={"primary"} className={"me-2"} style={{fontSize: "0.9rem"}} onClick={handleBuyOpen}>Buy</Button>
                    <Button variant={"danger"} style={{fontSize: "0.9rem"}} onClick={handleSellOpen}>Sell</Button>
                </Card.Footer>
            </Card>
            <BuyModal
                modeBuy={true}
                show={showBuyModal}
                portfolioItem={portfolioItem}
                balance={balance}
                handleClose={handleBuyClose}
                handleBuySell={handleBuySell}
            />
            <BuyModal
                modeBuy={false}
                show={showSellModal}
                portfolioItem={portfolioItem}
                balance={balance}
                handleClose={handleSellClose}
                handleBuySell={handleBuySell}
            />
        </>
    )
}
