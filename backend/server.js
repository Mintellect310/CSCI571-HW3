'use strict';

// Backend related
const cors = require("cors");
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors({
    origin: '*' // This will allow requests from any origin
}));

app.use(express.json());

// External API related
let idx = 0;
// const FINNHUB_KEY = "cn0rq71r01quegsk36agcn0rq71r01quegsk36b0";
const FINNHUB_KEYS = [
    "cn0rq71r01quegsk36agcn0rq71r01quegsk36b0",
    "co2akchr01qvggedvcsgco2akchr01qvggedvct0",
    "co2akshr01qvggedvd30co2akshr01qvggedvd3g",
    "co2all9r01qvggedvdfgco2all9r01qvggedvdg0",
    "co3qnkpr01qj6vn8gs00co3qnkpr01qj6vn8gs0g",
    "co3qnt9r01qj6vn8gsi0co3qnt9r01qj6vn8gsig"
];
const num = FINNHUB_KEYS.length;

const POLYGON_KEYS = ["ctO8iVF_Gi19afBovU1ZSr6UIxqt8Fr3", "JnDxyhDz81Ro0T6V7M02FRMlumGYpfOf"];

// MongoDB related
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://maheeth2013:xJ6FmzBI84IYx8uY@cluster0.uwfcbj9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
client.connect();
const db = client.db("HW3");
const run = async () => {
    await client.db("admin").command({ping: 1});
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
}
run().catch(console.dir);


// Auto-complete
app.get("/autocomplete/:query", async (req, res) => {
    const query = req.params["query"];
    const FINNHUB_KEY = FINNHUB_KEYS[0];
    console.log("autocomplete key: ", FINNHUB_KEY);
    try {
        const url = `https://finnhub.io/api/v1/search?q=${query}&token=${FINNHUB_KEY}`;
        idx++;

        const time1 = new Date();
        let search = await axios.get(url).then(res_ => res_.data);
        const time2 = new Date();
        console.log(`${query} - Search Time: `, (time2-time1)/1000);

        search = search.result
            .filter(item => !item.symbol.includes("."))
            .map(item => ({
                description: item.description,
                symbol: item.symbol
            }));

        res.send(search);
    } catch(error) {
        console.error("Autocomplete error: ", error);
        res.status(500).send("Autocomplete error");
    }
});

// Stock Details
app.get("/stock/:ticker", async (req, res) => {
    const ticker = req.params["ticker"].toUpperCase();

    const stockDetails = {};
    const FINNHUB_KEY = FINNHUB_KEYS[1];
    console.log("stock key: ", FINNHUB_KEY);
    try {
        let url = `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${FINNHUB_KEY}`;
        const profile2 = await axios.get(url).then(res_ => res_.data);
        console.log("profile2: ", profile2);

        stockDetails["ticker"] = ticker;
        stockDetails["name"] = profile2["name"];
        stockDetails["exchange"] = profile2["exchange"];
        stockDetails["logo"] = profile2["logo"];

        url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_KEY}`;
        const quote = await axios.get(url).then(response => response.data);
        console.log("quote: ", quote);
        idx++;

        stockDetails["c"] = quote["c"];
        stockDetails["d"] = quote["d"];
        stockDetails["dp"] = quote["dp"];
        stockDetails["t"] = quote["t"];

        const isMarketClosed = t => ((new Date()-new Date(t*1000))/1000)/60 > 5;
        stockDetails["marketClose"] = isMarketClosed(stockDetails["t"]);

        console.log("stockDetails: ", stockDetails);
        res.send(stockDetails);
    } catch (error) {
        console.error("Error in fetching stock data from Finnhub: ", error);
        res.status(500).send("An error occurred while fetching stock data from Finnhub.");
    }
});

// Summary Tab without Hourly Price Variation
app.get("/summary/:ticker", async (req, res) => {
    const ticker = req.params["ticker"].toUpperCase();

    const summary = {};
    const FINNHUB_KEY = FINNHUB_KEYS[2];
    console.log("summary key: ", FINNHUB_KEY);
    try {
        let url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_KEY}`;
        const quote = await axios.get(url).then(res_ => res_.data);
        console.log("quote: ", quote);

        summary["h"] = quote["h"];
        summary["l"] = quote["l"];
        summary["o"] = quote["o"];
        summary["pc"] = quote["pc"];
        summary["t"] = quote["t"];

        url = `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${FINNHUB_KEY}`;
        const profile2 = await axios.get(url).then(res_ => res_.data);
        console.log("profile2: ", profile2);

        summary["ipo"] = profile2["ipo"];
        summary["finnhubIndustry"] = profile2["finnhubIndustry"];
        summary["weburl"] = profile2["weburl"];

        url = `https://finnhub.io/api/v1/stock/peers?symbol=${ticker}&token=${FINNHUB_KEY}`;
        let peers = await axios.get(url).then(res_ => res_.data);
        peers = peers.filter(peer => !peer.includes("."));
        idx++;

        const seen = new Set();
        summary["peers"] = peers.filter(peer => {
            if (!seen.has(peer)) {
                seen.add(peer);
                return true;
            }
            return false;
        });

        console.log("summary: ", summary);
        res.send(summary);
    } catch (error) {
        console.error("Error in fetching summary from finnhub: ", error);
        res.status(500).send("An error occurred while fetching summary from Finnhub.");
    }
});

// Hourly Price Variation (https://piazza.com/class/lr3cfhx8jp718d/post/510)
app.get("/summary/hourly/:ticker", async (req, res) => {
    const ticker = req.params["ticker"];
    const FINNHUB_KEY = FINNHUB_KEYS[3];
    console.log("summary hourly key: ", FINNHUB_KEY);
    const getIsMarketOpen = async () => {
        let url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_KEY}`;
        try {
            const quote = await axios.get(url).then(res_ => res_.data);
            const latestTime = new Date(quote.t * 1000);
            const now = new Date();
            const isOpen = (now-latestTime)/(1000 * 60) <= 5;
            console.log("timeDiff: ", isOpen);
            return isOpen;
        } catch (error) {
            console.error("Error fetching last quote: ", error.message);
            return true;
        }
    }

    try {
        const isMarketOpen = await getIsMarketOpen(ticker);
        const to_date = new Date();
        to_date.setHours(0,0,0,0);
        const from_date = new Date(to_date.getTime());
        from_date.setDate(to_date.getDate() - (isMarketOpen ? 1 : 2));

        let url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/hour/`
            +`${from_date.toISOString().slice(0,10)}/`
            +`${to_date.toISOString().slice(0,10)}?adjusted=true&sort=asc&apiKey=${POLYGON_KEYS[0]}`;
        console.log("hourly url:", url);
        let aggs = await axios.get(url).then(res_ => res_.data);
        console.log("aggs.results.length: ", aggs.results ? aggs.results.length : 0);
        res.send(aggs);
    } catch (error) {
        console.error("Error fetching hourly prices from Polygon");
        res.status(500).send("An error occured while fetching hourly prices from Polygon");
    }
})

// Top News Tab
app.get("/topNews/:ticker", async (req, res) => {
    const ticker = req.params["ticker"].toUpperCase();
    const topNews = [];

    const toDate = new Date();
    const fromDate = new Date(toDate - 7*24*60*60*1000);

    const FINNHUB_KEY = FINNHUB_KEYS[4];
    console.log("topNews key: ", FINNHUB_KEY);
    const url = `https://finnhub.io/api/v1/company-news?symbol=${ticker}`
        +`&from=${fromDate.toISOString().slice(0, 10)}&to=${toDate.toISOString().slice(0, 10)}&token=${FINNHUB_KEY}`;
    console.log("topNews url: ", url);
    try {
        const news = await axios.get(url).then(res_ => res_.data);
        idx++;

        let count = 0;
        for (let i = 0; i < news.length && count < 20; i++) {
            if (news[i].source === "" || news[i].datetime === "" || news[i].headline === "" || news[i].summary === "" || news[i].url === "" || news[i].image === "") continue;

            topNews[count] = {};
            topNews[count].source = news[i].source;
            topNews[count].datetime = news[i].datetime;
            topNews[count].headline = news[i].headline;
            topNews[count].summary = news[i].summary;
            topNews[count].url = news[i].url;
            topNews[count].image = news[i].image;
            count++;
        }

        res.send(topNews);
    } catch(error) {
        console.error("Error when fetching top news from Finnhub: ", error);
        res.status(500).send("An error occurred while fetching top news from Finnhub");
    }
});

// Charts.js Tab
app.get("/charts/:ticker", async (req, res) => {
    const ticker = req.params["ticker"].toUpperCase();

    const to_date = new Date();
    const from_date = new Date(to_date);
    // Piazza: https://piazza.com/class/lr3cfhx8jp718d/post/598
    from_date.setFullYear(from_date.getFullYear() - 2);

    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/`
        +`${from_date.toISOString().slice(0,10)}/`
        +`${to_date.toISOString().slice(0,10)}?adjusted=true&sort=asc&apiKey=${POLYGON_KEYS[1]}`;
    console.log("charts url: ", url);
    try {
        const aggs = await axios.get(url).then(res_ => res_.data);
        res.send(aggs);
    } catch(error) {
        console.error("Error when fetching chart data from Polygon: ", error);
        res.status(500).send("An error occurred when fetching chart data from Polygon");
    }
});

// Insights Tab
app.get("/insights/:ticker", async (req, res) => {
    const ticker = req.params["ticker"].toUpperCase();
    const FINNHUB_KEY = FINNHUB_KEYS[5];
    console.log("insights key: ", FINNHUB_KEY);

    try {
        let url = `https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${ticker}&from=2022-01-01&token=${FINNHUB_KEY}`;
        const insider = await axios.get(url).then(res_ => res_.data);

        const insights = {"mspr_t": 0, "mspr_p": 0, "mspr_n": 0, "change_t": 0, "change_p": 0, "change_n": 0};
        for (let i = 0; i < insider.data.length; i++) {
            const data = insider.data[i];

            insights.mspr_t += data.mspr;
            if (data.mspr > 0) insights.mspr_p += data.mspr;
            else insights.mspr_n += data.mspr;

            insights.change_t += data.change;
            if (data.change > 0) insights.change_p += data.change;
            else insights.change_n += data.change;
        }

        url = `https://finnhub.io/api/v1/stock/recommendation?symbol=${ticker}&token=${FINNHUB_KEY}`;
        const reco = await axios.get(url).then(res_ => res_.data);

        url = `https://finnhub.io/api/v1/stock/earnings?symbol=${ticker}&token=${FINNHUB_KEY}`;
        const earnings = await axios.get(url).then(res_ => res_.data);
        for (let i = 0; i < earnings.length; i++) {
            for (let key in earnings[i]) {
                earnings[i][key] = earnings[i][key] || 0;
            }
        }

        res.send({"insights": insights, "reco": reco, "earnings": earnings});
    } catch(error) {
        console.error("Error when fetching insights from Finnhub: ", error);
        res.status(500).send("An error occured when fetching insights from Finnhub");
    }
});

app.get("/getWatchlist", async (req, res) => {
    try {
        const collection = db.collection("watchlist");
        const stockTickers = await collection.find({}).toArray();

        console.log("stockTickers: ", stockTickers);
        res.send(stockTickers);
    } catch (error) {
        console.error("Error fetching watchlist: ", error);
        res.status(500).send("Error fetching watchlist");
    }
});

app.post("/addToWatchlist/:ticker", async (req, res) => {
    const ticker = req.params["ticker"];
    try {
        const collection = db.collection("watchlist");
        const result = await collection.insertOne({"ticker": ticker});

        console.log(result);
        res.send(result);
    } catch (error) {
        console.error("Error inserting to watchlist: ", error);
        res.status(500).send("Error inserting to watchlist");
    }
});

app.delete("/deleteFromWatchlist/:id", async (req, res) => {
    const id = req.params["id"];
    try {
        const collection = db.collection("watchlist");
        const deleteResult = await collection.deleteOne({"_id": new ObjectId(id)});

        console.log(deleteResult);
        if(deleteResult.deletedCount === 1) {
            res.send({success: true});
        } else {
            res.status(404).json({success: false, message: "ID not in watchlist"});
        }
    } catch (error) {
        console.error("Error deleting from watchlist: ", error);
        res.status(500).send("Error deleting from watchlist");
    }
});

app.get("/portfolio/get", async (req, res) => {
    try {
        const collection = db.collection("portfolio");
        const portfolio = await collection.find({}).toArray();
        console.log("portfolio: ", portfolio);
        res.send(portfolio);
    } catch (error) {
        console.error("Error fetching portfolio: ", error);
        res.status(500).send("Error fetching portfolio");
    }
});

app.post("/portfolio/add/:ticker/:quantity/:totalCost", async (req, res) => {
    const ticker = req.params["ticker"];
    let quantity = parseInt(req.params["quantity"]);
    let totalCost = parseFloat(req.params["totalCost"]);
    console.log(`ticker: ${ticker}, quantity: ${quantity}, totalCost: ${totalCost}`);

    try {
        const collection = db.collection("portfolio");
        const result = await collection.insertOne({"ticker": ticker, "quantity": quantity, "totalCost": totalCost});

        console.log(result);
        res.send(result);
    } catch (error) {
        console.error("Error in buying ", ticker);
        res.status(404).send(`Error in buying ${ticker}`);
    }
});

app.post("/portfolio/buy-sell/:buy/:_id/:quantity/:totalCost",async (req, res) => {
    let buy = req.params["buy"] === "true";
    const _id = req.params["_id"];
    let quantity = parseInt(req.params["quantity"]);
    let totalCost = parseFloat(req.params["totalCost"]);

    console.log(`Trying to ${buy ? "buy" : "sell"} ${_id}`);
    if(!buy) {
        quantity = -quantity;
        totalCost = -totalCost;
    }

    try {
        const collection = await db.collection("portfolio");
        const document = await collection.findOne({"_id": new ObjectId(_id)});
        console.log("Found: ", document);

        if(!buy && document.quantity+quantity === 0) {
            const result = await collection.deleteOne({"_id": new ObjectId(_id)});

            console.log(result);
            if(result.deletedCount === 1) {
                res.send({success: true});
            } else {
                res.status(404).send({success: false, message: "stock not in portfolio"});
            }
            return;
        }

        const result = await collection.updateOne(
            { _id: new ObjectId(_id) },
            {
                $inc: {
                    "quantity": quantity,
                    "totalCost": totalCost
                }
            }
        );

        console.log(result.modifiedCount + ' document(s) updated');
        res.send({success: true});
    } catch (error) {
        console.error("Error updating portfolio: ", error);
        res.status(404).send({success: false, message: "Error updating portfolio"});
    }
});

app.get("/balance", async (req, res) => {
    try {
        const collection = await db.collection("balance");
        const balanceDoc = await collection.findOne({});
        console.log("balanceDoc: ", balanceDoc);
        res.send({success: true, balance: balanceDoc.balance});
    } catch (error) {
        console.error("Error fetching balance: ", error);
        res.status(404).send({success: false});
    }
});

app.post("/balance/:value", async (req, res) => {
    const value = parseFloat(req.params["value"]);

    try {
        const collection = await db.collection("balance");
        const balanceDoc = await collection.findOne({});

        const result = await collection.updateOne(
            { _id: new ObjectId(balanceDoc._id) },
            {
                $set: {
                    "balance": value,
                }
            }
        );

        console.log(result.modifiedCount + ' document(s) updated');
        res.send({success: true});
    } catch (error) {
        console.error("Error fetching balance: ", error);
        res.status(404).send({success: false});
    }
});

// Serve React frontend from backend
app.use(express.static(path.join(__dirname, "..", "frontend/build")));

// Universal Handler: Serve the React App
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "frontend/build/index.html"));
});

// Listening...
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

