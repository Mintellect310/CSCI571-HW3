import React, {useEffect, useState} from "react";
import {Alert, Button, Col, Container, Row} from "react-bootstrap";
import BuyModal from "../Portfolio/BuyModal";
import SearchTabs from "./SearchTabs";

export default function Content({searchValue, stock, summary, hourlyData, topNews, charts, insights, wList, pfList, isFavourite, setStock, setSummary, setWList, setPfList, setIsFavourite, showSellButton, setShowSellButton, balance, setBalance, stockKey, setStockKey, wStockKey, setWStockKey, showNDFAlert, showValidTickerAlert, setShowValidTickerAlert, fetchWatchlist, setSearchValue, handleSearch}) {
    // Buy Modal related
    const [showBuyModal, setShowBuyModal] = useState(false);
    const handleBuyOpen = () => setShowBuyModal(true);
    const handleBuyClose = () => setShowBuyModal(false);

    // Sell Modal related
    const [showSellModal, setShowSellModal] = useState(false);
    const handleSellOpen = () => setShowSellModal(true);
    const handleSellClose = () => setShowSellModal(false);

    // Buy Alert related
    const [showBuyAlert, setShowBuyAlert] = useState(false);
    const [buyAlertTicker, setBuyAlertTicker] = useState("");

    // Sell Alert related
    const [showSellAlert, setShowSellAlert] = useState(false);
    const [sellAlertTicker, setSellAlertTicker] = useState("");

    // Watchlist Add related
    const [showAddToWatchlistAlert, setShowAddToWatchlistAlert] = useState(false);
    const [addToWatchlistAlertTicker, setAddToWatchlistAlertTicker] = useState("");

    // Watchlist Remove related
    const [showRemoveFromWatchlistAlert, setShowRemoveFromWatchlistAlert] = useState(false);
    const [removeFromWatchlistAlertTicker, setRemoveFromWatchlistAlertTicker] = useState("");

    const toggleFavourite = async () => {
        const prevIsFav = isFavourite;
        if(isFavourite) {
            // make it not favourite i.e., remove it from watchlist
            console.log(`Attempting to delete ${wStockKey}`);
            try {
                const res = await fetch(`/deleteFromWatchlist/${wStockKey}`, {method: "DELETE"});
                const data = await res.json();
                console.log(data);
                if (data.success) {
                    setWList(currentList => {
                        const newList = {...currentList};
                        delete newList[stock._id];
                        return newList;
                    });
                    setIsFavourite(false);
                    setWStockKey(null);
                    console.log(`isFavourite was ${prevIsFav}, is ${!prevIsFav}`);

                    setRemoveFromWatchlistAlertTicker(stock.ticker);
                    setShowRemoveFromWatchlistAlert(true);
                    setTimeout(() => setShowRemoveFromWatchlistAlert(false), 5000);
                } else {
                    console.error(`Failed to delete ${stock.ticker}`);
                }
            } catch (error) {
                console.error(`Network error when deleting ${stock.ticker}: ${error}`);
            }
        } else {
            // make it favourite i.e., add it to watchlist
            const res = await fetch(`/addToWatchlist/${stock.ticker}`, {method: "POST"});
            const data = await res.json();
            if(data.acknowledged) {
                setIsFavourite(true);
                await fetchWatchlist();
                console.log(`isFavourite was ${prevIsFav}, is ${!prevIsFav}`);
                setWStockKey(data.insertedId);

                setAddToWatchlistAlertTicker(stock.ticker);
                setShowAddToWatchlistAlert(true);
                setTimeout(() => setShowAddToWatchlistAlert(false), 5000);
            }
        }
    };

    const handleFirstBuy = async (ticker, quantity, totalCost) => {
        console.log(`Attempting to buy ${ticker} for the first time`);
        try {
            const res = await fetch(`/portfolio/add/${ticker}/${quantity}/${totalCost}`, {method: "POST"});
            const data = await res.json();
            console.log(data);
            if(!data.acknowledged) data.acknowledged = false;

            const balanceRes = await fetch(`/balance/${balance-totalCost}`, {method: "POST"}).then(res => res.json());

            if(data.acknowledged && balanceRes.success) {
                // update pf list
                // update stock key
                const _id = data.insertedId;
                console.log("new _id: ", _id);
                const newList = {...pfList};
                newList[_id] = {};
                newList[_id]._id = _id;
                newList[_id].ticker = ticker;
                newList[_id].quantity = quantity;
                newList[_id].totalCost = totalCost;
                newList[_id].name = stock.name;
                newList[_id].currentPrice = stock.c;

                newList[_id].avgCost = newList[_id].totalCost / newList[_id].quantity;
                newList[_id].change = newList[_id].currentPrice - newList[_id].avgCost;
                newList[_id].marketValue = newList[_id].quantity * newList[_id].currentPrice;
                setPfList(newList);

                setBalance(balance-totalCost);

                setStockKey(_id);
                setBuyAlertTicker(ticker);
                setShowBuyAlert(true);
                setTimeout(() => setShowBuyAlert(false), 5000);
            }
        } catch (error) {
            console.error("Error buying stock for the first time: ", error);
        }
    }

    const handleBuySell = async (buy, _id, quantity, totalCost) => {
        console.log(`Attempting to ${buy ? "buy" : "sell"} ${stock.ticker}`);
        try {
            const res = await fetch(`/portfolio/buy-sell/${buy}/${_id}/${quantity}/${totalCost}`, {method: "POST"});
            const data = await res.json();
            const balanceRes = await fetch(`/balance/${balance - (buy ? totalCost : -totalCost)}`, {method: "POST"}).then(res => res.json());

            if (data.success && balanceRes.success) {
                if(!buy) quantity = -quantity;
                if(!buy) totalCost = -totalCost;

                const newList = {...pfList};
                newList[_id].quantity += quantity;
                newList[_id].totalCost += totalCost;

                console.log("updated stock info: ", newList[_id]);
                if(newList[_id].quantity === 0) {
                    setStockKey(null);
                    delete newList[_id];
                } else {
                    newList[_id].avgCost = newList[_id].totalCost / newList[_id].quantity;
                    newList[_id].change = newList[_id].currentPrice - newList[_id].avgCost;
                    newList[_id].marketValue = newList[_id].quantity * newList[_id].currentPrice;
                }
                setPfList(newList);

                setBalance(balance-totalCost);
                if(buy) {
                    setBuyAlertTicker(pfList[_id].ticker);
                    setShowBuyAlert(true);
                    setTimeout(() => setShowBuyAlert(false), 5000);
                } else {
                    setSellAlertTicker(pfList[_id].ticker);
                    setShowSellAlert(true);
                    setTimeout(() => setShowSellAlert(false), 5000);
                }
            } else {
                console.error(`Failed to ${buy ? "buy" : "sell"} ${stock.ticker}`);
            }
        } catch (error) {
            console.error(`Error ${buy ? "buy" : "sell"}ing stock: `, error);
        }
    }

    const tspToDate = tsp =>
        new Date(tsp*1000-7*60*60*1000)
            .toISOString()
            .slice(0, -5)
            .replace("T", " ");

    const currentTime = new Date(new Date().getTime()-7*60*60*1000).toISOString().slice(0, -5).replace("T", " ");

    const color = (stock?.d > 0) ? "green" : (stock?.d < 0) ? "red" : "black";

    const placeholderPfItem = {
        _id: null,
        ticker: stock ? stock.ticker : "",
        quantity: 0,
        totalCost: 0,
        change: 0, // 0 is a placeholder
        currentPrice: stock ? stock.c : 0, // if stock is null, stock.c = 0 is a placeholder
        marketValue: 0, // quantity is 0
        name: stock ? stock.name : "", // if stock is null, stock.c = "" is a placeholder
        avgCost: 0, // 0 is a placeholder
    }

    // Reference: https://piazza.com/class/lr3cfhx8jp718d/post/776
    const isMarketOpen = tsp => ((new Date()-new Date(tsp*1000))/1000)/60 <= 5;

    const updateStockAndSummary = async () => {
        if(!searchValue) return;
        // console.log("old stock: ", stock);
        if(!isMarketOpen(stock.t)) return;

        try {
            const updatedStockData = await fetch(`/stock/${searchValue}`).then(res => res.json());
            const updatedSummaryData = await fetch(`/summary/${searchValue}`).then(res => res.json());

            console.log("updatedStockData: ", updatedStockData);
            console.log("updatedSummaryData: ", updatedSummaryData);

            setStock(updatedStockData);
            setSummary(updatedSummaryData);
        } catch (error) {
            console.error('Error fetching updated stock and summary: ', error);
        }
    }

    useEffect(() => {
        const intervalId = setInterval(() => {
            updateStockAndSummary();
        }, 15000);

        return () => clearInterval(intervalId);
    }, [searchValue]);

    console.log("stock: ", stock);

    return (
        <>
            {showBuyAlert &&
                <Alert variant={"success"} className={"text-center"} onClose={() => {
                    setShowBuyAlert(false);
                    setBuyAlertTicker("");
                }} dismissible>
                    {buyAlertTicker} bought successfully.
                </Alert>
            }
            {showSellAlert &&
                <Alert variant={"danger"} className={"text-center"} onClose={() => {
                    setShowSellAlert(false);
                    setSellAlertTicker("");
                }} dismissible>
                    {sellAlertTicker} sold successfully.
                </Alert>
            }
            {showAddToWatchlistAlert &&
                <Alert variant={"success"} className={"text-center"} onClose={() => {
                    setShowAddToWatchlistAlert(false);
                    setAddToWatchlistAlertTicker("");
                }} dismissible>
                    {addToWatchlistAlertTicker} added to Watchlist.
                </Alert>
            }
            {showRemoveFromWatchlistAlert &&
                <Alert variant={"danger"} className={"text-center"} onClose={() => {
                    setShowRemoveFromWatchlistAlert(false);
                    setRemoveFromWatchlistAlertTicker("");
                }} dismissible>
                    {removeFromWatchlistAlertTicker} removed from Watchlist.
                </Alert>
            }
            {showNDFAlert &&
                <Alert variant={"danger"} className={"mt-2 text-center"}>
                    No data found. Please enter a valid ticker.
                </Alert>
            }
            {showValidTickerAlert &&
                <Alert variant={"danger"} className={"text-center"} onClose={() => setShowValidTickerAlert(false)} dismissible>
                    Please enter a valid ticker.
                </Alert>
            }
            {stock &&
                <Container className={"text-center"}>
                    <Row className={"d-flex justify-content-center mb-2"}>
                        <Col className={"text-center px-0"}>
                            <div className={"d-flex justify-content-center"}>
                                <h2 className={"me-2"}>{stock.ticker}</h2>
                                <i className={`fs-5 bi bi-star${isFavourite ? "-fill" : ""}`}
                                   style={{color: isFavourite ? "#ffd80c" : "inherit"}} onClick={toggleFavourite}></i>
                            </div>
                            <h5 style={{color: "grey"}}>{stock.name}</h5>
                            <div className={"mb-2 text-muted"}>{stock.exchange}</div>
                            {/* Buy Button */}
                            <Button variant={"success"} style={{fontSize: "0.9rem"}} onClick={handleBuyOpen}>Buy</Button>
                            <BuyModal
                                modeBuy={true}
                                show={showBuyModal}
                                portfolioItem={stockKey ? pfList[stockKey] : placeholderPfItem}
                                balance={balance}
                                handleClose={handleBuyClose}
                                handleBuySell={handleBuySell}
                                handleFirstBuy={handleFirstBuy}
                            />
                            {/* Sell Button */}
                            {showSellButton &&
                                <>
                                    <Button variant={"danger"} className={"ms-2"} style={{fontSize: "0.9rem"}}
                                            onClick={handleSellOpen}>Sell</Button>
                                    <BuyModal
                                        modeBuy={false}
                                        show={showSellModal}
                                        portfolioItem={stockKey ? pfList[stockKey] : placeholderPfItem}
                                        balance={balance}
                                        handleClose={handleSellClose}
                                        handleBuySell={handleBuySell}
                                    />
                                </>
                            }
                        </Col>
                        <Col className={"px-0"}>
                            <img src={stock.logo} alt={`${stock.ticker} logo`} style={{width: "40%", maxWidth:"90px"}}/>
                        </Col>
                        <Col className={"px-0"} style={{color: color}}>
                            <h2>{stock.c.toFixed(2)}</h2>
                            <h6>
                                {(stock.d > 0) && <i className="fs-6 bi bi-caret-up-fill"></i>}
                                {(stock.d < 0) && <i className="fs-6 bi bi-caret-down-fill"></i>}
                                {stock.d.toFixed(2) || "N/A"} ({stock.dp ? stock.dp.toFixed(2) + "%" : "N/A"})
                            </h6>
                            {/*<div style={{color: "grey"}}>{tspToDate(stock.t)}</div>*/}
                            <div className={"text-muted"}>{currentTime}</div>
                        </Col>
                    </Row>
                    <Row className={"d-flex justify-content-center mb-3"}>
                        <div style={{
                            fontSize: "small",
                            fontWeight: "bold",
                            color: (stock.t) ? (isMarketOpen(stock.t) ? "green" : "red") : "black"
                        }}>{isMarketOpen(stock.t) ? "Market is Open" : `Market Closed on ${tspToDate(stock.t)}`}</div>
                    </Row>
                    <Row>
                        <SearchTabs
                            stock={stock}
                            summary={summary}
                            hourlyData={hourlyData}
                            hourlyDataColor={color}
                            topNews={topNews}
                            charts={charts}
                            insights={insights}
                            setSearchValue={setSearchValue}
                            handleSearch={handleSearch}
                        />
                    </Row>
                </Container>}
        </>
    );
}
