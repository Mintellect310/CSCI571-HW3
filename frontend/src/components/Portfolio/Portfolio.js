'use strict';

import {Alert, Button, Card, Col, Container, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {CircularProgress} from "@mui/material";
import PortfolioCard from "./PortfolioCard";

export default function Portfolio({loading, setLoading, pfList, setPfList, balance, setBalance, fetchPortfolio, stockKey, setStockKey, setSearchValue, handleSearch}) {
    // const [loading, setLoading] = useState(true);
    // const [pfList, setPfList] = useState({});
    // const [balance, setBalance] = useState(0);

    // fetchPortfolio in App.js was here
    // useEffect was here
    useEffect(() => {
        fetchPortfolio();
    }, []);

    const [showBuyAlert, setShowBuyAlert] = useState(false);
    const [buyAlertTicker, setBuyAlertTicker] = useState("");

    const [showSellAlert, setShowSellAlert] = useState(false);
    const [sellAlertTicker, setSellAlertTicker] = useState("");

    const handleBuySell = async (buy, _id, quantity, totalCost) => {
        console.log(`Attempting to ${buy ? "buy" : "sell"} ${pfList[_id].ticker}`);
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
                    delete newList[_id];
                    if(_id === stockKey) setStockKey(null);
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
                console.error(`Failed to buy ${pfList[_id].ticker}`);
            }
        } catch (error) {
            console.error("Error buying stock: ", error);
        }
    }

    return (
        <Container fluid style={{padding: "0 1rem"}}>
            <Row className={"justify-content-center"}>
                <Col xl={8} lg={10}>
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
                    <h1>My Portfolio</h1>
                    {!loading && <h3>Money in Wallet: ${balance.toFixed(2)}</h3>}
                    {
                        loading ? (
                            <div className={"text-center"}>
                                <CircularProgress style={{ color: '#2324ae', marginTop: "4rem" }} size={60} />
                            </div>
                        ) : Object.keys(pfList).length > 0 ? (
                            Object.keys(pfList).map((key, index) => {
                                console.log(`${key}: ${JSON.stringify(pfList[key])}`);
                                if(pfList[key].quantity === 0) return null;

                                return <PortfolioCard
                                    key={key}
                                    portfolioItem={pfList[key]}
                                    balance={balance}
                                    handleBuySell={handleBuySell}
                                    setSearchValue={setSearchValue}
                                    handleSearch={handleSearch}
                                />;
                            })
                        ) : (
                            <Alert variant={"warning"} className={"text-center"}>
                                Currently you don't have any stock.
                            </Alert>
                        )
                    }
                </Col>
            </Row>
        </Container>
    )
}

