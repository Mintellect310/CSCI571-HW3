import {useNavigate} from "react-router-dom";
import {Card, CloseButton, Col, Row} from "react-bootstrap";
import React from "react";
import {formatNumber} from "../../helper";

export default function StockCard({ stock, key, setList, wStockKey, setWStockKey, setSearchValue, handleSearch}) {
    const navigate = useNavigate();
    const handleCardClick = () => {
        navigate(`/search/${stock.ticker}`);
        setSearchValue(stock.ticker);
        handleSearch(null, stock.ticker);
    };

    const handleClose = async (e) => {
        e.stopPropagation();

        console.log(`Attempting to delete ${stock._id}`);
        try {
            let res = await fetch(`/deleteFromWatchlist/${stock._id}`, {method: "DELETE"});
            const data = await res.json();
            console.log(data);
            if (data.success) {
                setList(currentList => {
                    const newList = {...currentList};
                    delete newList[stock._id];
                    return newList;
                });
                if(stock._id === wStockKey) {
                    setWStockKey(null);
                }
            } else {
                console.error(`Failed to delete ${stock.ticker}`);
            }
        } catch (error) {
            console.error(`Network error when deleting ${stock.ticker}: ${error}`);
        }
    }

    return (
        <Card key={key} className={"mb-3 card-pointer"} onClick={handleCardClick}>
            <CloseButton style={{fontSize: "0.45rem", padding: "1rem"}} onClick={(e) => handleClose(e)}/>
            <div style={{padding: "0 1rem 1rem 1rem"}}>
                <Row>
                    <Col>
                        <h3>{stock.ticker}</h3>
                    </Col>
                    <Col>
                        <h3 className={stock.d < 0 ? "text-danger" : stock.d > 0 ? "text-success" : "text-dark"}>
                            {stock.c ? formatNumber(stock.c) : "N/A"}
                        </h3>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <h6 className={"mb-2 text-muted"}>{stock.name}</h6>
                    </Col>
                    <Col>
                        <h6 className={stock.d < 0 ? "text-danger" : stock.d > 0 ? "text-success" : "text-dark"}>
                            {stock.d >= 0 ? <i className="bi bi-caret-up-fill"></i> :
                                <i className="bi bi-caret-down-fill"></i>}
                            {stock.d ? formatNumber(stock.d) : "N/A"} ({stock.dp ? formatNumber(stock.dp)+"%" : "N/A"})
                        </h6>
                    </Col>
                </Row>
            </div>
        </Card>
    );
}