// React Imports
import React, { useEffect, useState } from "react";

// Bootstrap Imports
import { Container, Nav, Navbar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// React Router Imports
import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes, Link, useLocation, useNavigate,
} from "react-router-dom";

// My Imports
import "./App.css";
import Search from "./components/Search/Search";
import Watchlist from "./components/Watchlist/Watchlist";
import Portfolio from "./components/Portfolio/Portfolio";
import ErrorPage from "./ErrorPage";

export default function App() {
  // Watchlist state variables
  const [wLoading, setWLoading] = useState(true);
  const [wList, setWList] = useState({});

  // Portfolio state variables
  const [pLoading, setPLoading] = useState(true);
  const [pfList, setPfList] = useState({});
  const [balance, setBalance] = useState(0);

  // Search state variables
  const [searchValue, setSearchValue] = useState('');
  const [stock, setStock] = useState(null);
  const [summary, setSummary] = useState(null);
  const [hourlyData, setHourlyData] = useState(null);
  const [topNews, setTopNews] = useState(null);
  const [charts, setCharts] = useState(null);
  const [insights, setInsights] = useState(null);
  // const [isFavourite, setIsFavourite] = useState(false);
  // const [showSellButton, setShowSellButton] = useState(false);
  const [stockKey, setStockKey] = useState(null);
  const [wStockKey, setWStockKey] = useState(null);
  let isFavourite = Boolean(wStockKey);
  const setIsFavourite = (val) => {isFavourite = val;}
  let showSellButton = Boolean(stockKey);
  const setShowSellButton = (val) => {showSellButton = val;}

  // Search related
  const [contentLoading, setContentLoading] = useState(false);
  const [showNDFAlert, setShowNDFAlert] = useState(false);
  const [showValidTickerAlert, setShowValidTickerAlert] = useState(false);

  // Search Bar related
  const [open, setOpen] = useState(false);

  async function fetchWatchlist() {
    setWLoading(true);
    const watchlistResponse = await fetch("/getWatchlist");
    const watchlist = await watchlistResponse.json();
    console.log("watchlist: ", watchlist);

    const stocks = await Promise.all(
      watchlist.map(async (watchlistItem) => {
        const response = await fetch(`/stock/${watchlistItem.ticker}`);
        const data = await response.json();
        return { ...data, _id: watchlistItem._id };
      })
    );
    console.log("stocks: ", stocks);

    const stocksObject = stocks.reduce((acc, current) => {
      const key = current._id;
      acc[key] = current;
      return acc;
    }, {});
    console.log("stocksObject: ", stocksObject);

    setWList(stocksObject);
    setWLoading(false);
  }

  async function fetchPortfolio() {
    setPLoading(true);
    const res = await fetch("/portfolio/get");
    const data = await res.json();
    console.log("Portfolio: ", data);

    const portfolioItems = await Promise.all(
      data.map(async (dataItem) => {
        const stock = await fetch(`/stock/${dataItem.ticker}`).then((res) =>
          res.json()
        );
        const portfolioItem = { ...dataItem };
        portfolioItem.name = stock.name;
        portfolioItem.avgCost =
          portfolioItem.totalCost / portfolioItem.quantity;

        portfolioItem.currentPrice = stock.c;
        portfolioItem.change =
          portfolioItem.currentPrice - portfolioItem.avgCost;
        portfolioItem.marketValue =
          portfolioItem.quantity * portfolioItem.currentPrice;

        return portfolioItem;
      })
    );
    console.log("portfolioItems: ", portfolioItems);
    console.log("portfolioItems.length: ", portfolioItems.length);

    const newList = portfolioItems.reduce((acc, current) => {
      const key = current["_id"];
      acc[key] = current;
      return acc;
    }, {});
    console.log("newList: ", newList);
    console.log("newListLength: ", Object.keys(newList).length);
    setPfList(newList);

    // const purchasedCost = portfolioItems.reduce((acc, current) => acc+current.totalCost, 0);
    // setBalance(balance-purchasedCost);
    const balanceRes = await fetch("/balance").then((res) => res.json());
    setBalance(balanceRes.balance);

    setPLoading(false);
  }

  // Handles the search action
  const handleSearch = async (event, value) => {
    console.log("value: ", value);

    let symbol;
    if (typeof value === 'object' && value !== null && value.symbol) {
      symbol = value.symbol.trim().toUpperCase();
    } else if (typeof value === 'string') {
      symbol = value.trim().toUpperCase();
    } else {
      // Handle case where value is neither an object with a symbol nor a string
      console.error('Invalid value type:', value);
      return;
    }

    if(!symbol || symbol === "") {
      setContentLoading(false);
      setShowValidTickerAlert(true);
      setTimeout(() => setShowValidTickerAlert(false), 5000);
      return;
    }

    setStock(null); // Clear current stock
    setSummary(null);
    setHourlyData(null);
    setTopNews(null);
    setCharts(null);
    setInsights(null);
    setStockKey(null);
    setWStockKey(null);

    console.log("symbol: ", symbol);
    setSearchValue(symbol);
    setContentLoading(true);
    console.log("searchValue: ", searchValue);
    try {
      // Fetch stock
      const stockResponse = await fetch(`/stock/${symbol}`);
      const stockData = await stockResponse.json();
      if(stockData.d === null) {
        setContentLoading(false);
        setShowNDFAlert(true);
        setTimeout(() => setShowNDFAlert(false), 5000);
        return;
      }
      setShowNDFAlert(false);
      setShowValidTickerAlert(false);
      setStock(stockData);

      console.log("searchValue: ", searchValue);
      // Check if it is in watchlist
      function findStockById(wList, tickerToFind) {
        for (const id in wList) {
          if (wList.hasOwnProperty(id)) {
            const stock = wList[id];
            if (stock.ticker === tickerToFind) {
              return id; // This is the unique ID of the stock
            }
          }
        }
        return null; // Returns null if the ticker is not found
      }

      const uniqueId = findStockById(wList, symbol);
      if (uniqueId) {
        console.log('Watchlist ID found:', uniqueId);
      } else {
        console.log('Ticker not found in the watchlist.');
      }
      // const isInWList = Object.values(wList).find(wListItem => wListItem.ticker === symbol);
      // console.log("isInWList: ", isInWList);
      setWStockKey(uniqueId);
      setIsFavourite(Boolean(uniqueId));

      // Show sell button
      // const isInPfList = Object.values(pfList).find(pfListItem => pfListItem.ticker === searchValue);
      const pfMatch = Object.entries(pfList).find(([key, value]) => {
        console.log(key, value);
        return value.ticker === symbol;
      });
      const stockKey = pfMatch ? pfMatch[0] : null;
      console.log("stockKey: ", stockKey);
      setStockKey(stockKey);
      setShowSellButton(Boolean(stockKey));

      // Fetch summary
      const summaryResponse = await fetch(`/summary/${symbol}`);
      const summaryData = await summaryResponse.json();
      console.log("summary: ", summaryData);
      setSummary(summaryData);

      // Fetch hourly data
      const hourlyDataResponse = await fetch(`/summary/hourly/${symbol}`);
      const hourlyData = await hourlyDataResponse.json();
      console.log("hourly data: ", hourlyData);
      setHourlyData(hourlyData);

      // Only after successfully setting the summary, we stop the loading.
      setContentLoading(false);

      // Since the remaining fetches are not awaited, they do not affect the loading state.
      // Fetch top news
      fetch(`/topNews/${symbol}`)
        .then(res => res.json())
        .then(data => {
          console.log("topNews: ", data);
          setTopNews(data);
        })
        .catch(error => {
          console.error('Error fetching topNews: ', error);
        });

      // Fetch charts
      fetch(`/charts/${symbol}`)
        .then(res => res.json())
        .then(data => {
          console.log("charts: ", data);
          setCharts(data);
        })
        .catch(error => {
          console.error('Error fetching charts: ', error);
        });

      // Fetch insights
      fetch(`/insights/${symbol}`)
        .then(res => res.json())
        .then(data => {
          console.log("insights: ", data);
          setInsights(data);
        })
        .catch(error => {
          console.error('Error fetching insights: ', error);
        });

      // navigate(`/search/${symbol}`);
      setSearchValue(symbol);
    } catch (error) {
      console.error('Error in the fetch chain:', error);
      setContentLoading(false); // Ensure we handle error by stopping the loading
    }

    setOpen(false);
  };

  useEffect(async () => {
    await fetchWatchlist();
    await fetchPortfolio();
  }, []);

  const searchElement = (
      <Search
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          stock={stock}
          setStock={setStock}
          summary={summary}
          setSummary={setSummary}
          hourlyData={hourlyData}
          setHourlyData={setHourlyData}
          topNews={topNews}
          setTopNews={setTopNews}
          charts={charts}
          setCharts={setCharts}
          insights={insights}
          setInsights={setInsights}
          wList={wList}
          setWList={setWList}
          pfList={pfList}
          setPfList={setPfList}
          balance={balance}
          setBalance={setBalance}
          isFavourite={isFavourite}
          setIsFavourite={setIsFavourite}
          showSellButton={showSellButton}
          setShowSellButton={setShowSellButton}
          stockKey={stockKey}
          setStockKey={setStockKey}
          wStockKey={wStockKey}
          setWStockKey={setWStockKey}
          contentLoading={contentLoading}
          setContentLoading={setContentLoading}
          showNDFAlert={showNDFAlert}
          setShowNDFAlert={setShowNDFAlert}
          showValidTickerAlert={showValidTickerAlert}
          setShowValidTickerAlert={setShowValidTickerAlert}
          open={open}
          setOpen={setOpen}
          fetchWatchlist={fetchWatchlist}
          fetchPortfolio={fetchPortfolio}
          handleSearch={handleSearch}
      />
  );

  return (
      <Router>
          <div className="app-container">
              <NavBar searchValue={searchValue}/>
              <div className={"mb-5"}>
                  <Routes>
                      <Route path={"/"} element={<Navigate to="/search/home" replace/>}/>
                      <Route
                          path={"/search/home"}
                          element={searchElement}
                      />
                      <Route
                          path={"/search/:ticker"}
                          element={searchElement}
                      />
                      <Route
                          path={"/watchlist"}
                          element={
                          <Watchlist
                              loading={wLoading}
                              setLoading={setWLoading}
                              wList={wList}
                              setWList={setWList}
                              fetchWatchlist={fetchWatchlist}
                              wStockKey={wStockKey}
                              setWStockKey={setWStockKey}
                              setSearchValue={setSearchValue}
                              handleSearch={handleSearch}
                          />
                      }
                      />
                      <Route
                          path={"/portfolio"}
                          element={
                          <Portfolio
                              loading={pLoading}
                              setLoading={setPLoading}
                              pfList={pfList}
                              setPfList={setPfList}
                              balance={balance}
                              setBalance={setBalance}
                              fetchPortfolio={fetchPortfolio}
                              stockKey={stockKey}
                              setStockKey={setStockKey}
                              setSearchValue={setSearchValue}
                              handleSearch={handleSearch}
                          />
                      }
                      />
                      <Route path={"*"} element={<ErrorPage/>}/>
                  </Routes>
              </div>
              <Footer/>
          </div>
      </Router>
  );
}

function NavBar({searchValue}) {
    console.log("NavBar - searchValue: ", searchValue);

    const location = useLocation(); // Hook to get the current location
    // Function to determine if a link should be highlighted as active
    const isActive = (pathname) => location.pathname.startsWith(pathname);

  return (
    <Navbar
      collapseOnSelect
      expand="lg"
      data-bs-theme="dark"
      className="mb-5 custom-navbar pe-md-3"
    >
      <Container fluid>
        <Navbar.Brand href="/">Stock Search</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav" className={"pt-3 pt-lg-0"}>
          <Nav className="ms-auto">
            <Nav.Link
                as={Link}
                to={searchValue ? `/search/${searchValue}` : "/search/home"}
                className={`px-3 me-5 me-lg-0 ${isActive('/search') ? 'active' : ''}`}
            >Search</Nav.Link>
            <Nav.Link
                as={Link}
                to="/watchlist"
                className={`px-3 me-5 me-lg-0 ${isActive('/watchlist') ? 'active' : ''}`}
            >Watchlist</Nav.Link>
            <Nav.Link
                as={Link}
                to="/portfolio"
                className={`px-3 me-5 me-lg-0 ${isActive('/portfolio') ? 'active' : ''}`}
            >Portfolio</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

function Footer() {
  return (
    <footer className={"custom-footer"}>
      <Container>
        <span>
          Powered by{" "}
            <a
                href="https://finnhub.io"
                target="_blank"
                rel="noopener noreferrer"
            >
            Finnhub.io
          </a>
        </span>
      </Container>
    </footer>
  );
}
