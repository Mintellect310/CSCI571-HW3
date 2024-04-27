import React, {useEffect, useState} from "react";
import {Alert, Container, Row, Col} from "react-bootstrap";
import {CircularProgress} from "@mui/material";
import "./Watchlist.css";
import StockCard from "./StockCard";

export default function Watchlist({loading, setLoading, wList, setWList, fetchWatchlist, wStockKey, setWStockKey, setSearchValue, handleSearch}) {
    // const [loading, setLoading] = useState(true);
    // const [wList, setWList] = useState({});

    // fetchWatchlist in App.js was here
    // useEffect was here
    useEffect(() => {
        fetchWatchlist();
    }, []);

    return (
        <Container fluid style={{ padding: "0 1rem" }}>
            <Row className={"justify-content-center"}>
                <Col xl={8} lg={10}>
                    <h1 className={"mb-5 mb-lg-5"}>My Watchlist</h1>
                    {
                        loading ? (
                            <div className={"text-center"}>
                                <CircularProgress style={{ color: '#2324ae', marginTop: "4rem" }} size={60} />
                            </div>
                        ) : Object.keys(wList).length > 0 ? (
                            Object.keys(wList).map((key, index) => <StockCard stock={wList[key]} key={key} setList={setWList} wStockKey={wStockKey} setWStockKey={setWStockKey} setSearchValue={setSearchValue} handleSearch={handleSearch}/>)
                        ) : (
                            <Alert variant={"warning"} className={"text-center"}>
                                Currently you don't have any stock in your watchlist.
                            </Alert>
                        )
                    }
                </Col>
            </Row>
        </Container>
    )
}