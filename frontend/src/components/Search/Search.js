import React, {useEffect, useRef, useState} from "react";
import {Alert, Button, Col, Container, Form, InputGroup, Row} from "react-bootstrap";
import {
    Autocomplete,
    CircularProgress, IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Paper,
    Popper, TextField, InputAdornment, Box
} from "@mui/material";
import SearchTabs from "./SearchTabs";
import BuyModal from "../Portfolio/BuyModal";
import Content from "./Content";
import SearchBar from "./SearchBar";
import {useNavigate, useParams} from "react-router-dom";

export default function Search({searchValue, setSearchValue, stock, setStock, summary, setSummary, hourlyData, setHourlyData, topNews, setTopNews, charts, setCharts, insights, setInsights, wList, setWList, pfList, setPfList, balance, setBalance, isFavourite, setIsFavourite, showSellButton, setShowSellButton, stockKey, setStockKey, wStockKey, setWStockKey, contentLoading, setContentLoading, showNDFAlert, setShowNDFAlert, showValidTickerAlert, setShowValidTickerAlert, open, setOpen, fetchWatchlist, fetchPortfolio, handleSearch}) {
    // Search Bar related
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);

    return (
        <Container fluid>
            <Row className={"justify-content-center"}>
                <Col xl={10} lg={11} className={"text-center"}>
                    <h1 className={"mb-4 fw-normal"}>STOCK SEARCH</h1>
                    <SearchBar
                        searchValue={searchValue}
                        wList={wList}
                        pfList={pfList}
                        suggestions={suggestions}
                        setSuggestions={setSuggestions}
                        suggestionsLoading={suggestionsLoading}
                        setSuggestionsLoading={setSuggestionsLoading}
                        open={open}
                        setOpen={setOpen}
                        setSearchValue={setSearchValue}
                        setContentLoading={setContentLoading}
                        setStock={setStock}
                        setSummary={setSummary}
                        setHourlyData={setHourlyData}
                        setTopNews={setTopNews}
                        setCharts={setCharts}
                        setInsights={setInsights}
                        setWList={setWList}
                        setPfList={setPfList}
                        setIsFavourite={setIsFavourite}
                        showSellButton={showSellButton}
                        setShowSellButton={setShowSellButton}
                        stockKey={stockKey}
                        setStockKey={setStockKey}
                        wStockKey={wStockKey}
                        setWStockKey={setWStockKey}
                        setShowNDFAlert={setShowNDFAlert}
                        setShowValidTickerAlert={setShowValidTickerAlert}
                        handleSearch={handleSearch}
                    />
                    {
                        contentLoading ?
                            <CircularProgress style={{ color: '#2324ae', marginTop: "4rem" }} size={60} /> :
                            <Content
                                searchValue={searchValue}
                                stock={stock}
                                summary={summary}
                                hourlyData={hourlyData}
                                topNews={topNews}
                                charts={charts}
                                insights={insights}
                                wList={wList}
                                pfList={pfList}
                                isFavourite={isFavourite}
                                setStock={setStock}
                                setSummary={setSummary}
                                setWList={setWList}
                                setPfList={setPfList}
                                setIsFavourite={setIsFavourite}
                                showSellButton={showSellButton}
                                setShowSellButton={setShowSellButton}
                                balance={balance}
                                setBalance={setBalance}
                                stockKey={stockKey}
                                setStockKey={setStockKey}
                                wStockKey={wStockKey}
                                setWStockKey={setWStockKey}
                                showNDFAlert={showNDFAlert}
                                showValidTickerAlert={showValidTickerAlert}
                                setShowValidTickerAlert={setShowValidTickerAlert}
                                fetchWatchlist={fetchWatchlist}
                                fetchPortfolio={fetchPortfolio}
                                setSearchValue={setSearchValue}
                                handleSearch={handleSearch}
                            />
                    }
                </Col>
            </Row>
        </Container>
    );
}
