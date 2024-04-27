import {Button, InputGroup, Modal, Form, Container} from "react-bootstrap";
import {useState} from "react";
import "./Portfolio.css";

export default function BuyModal({modeBuy, show, portfolioItem, balance, handleClose, handleBuySell, handleFirstBuy}) {
    const [quantity, setQuantity] = useState(0);
    const total = quantity * portfolioItem.currentPrice;

    const handleChange = (event) => setQuantity(event.target.value);
    const closeModal = () => {
        setQuantity(0);
        handleClose();
    }

    const handleKeyDown = (event) => {
        const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'];
        if (allowedKeys.includes(event.key)) return;

        if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) return;

        if (!/[0-9]/.test(event.key)) {
            event.preventDefault();
        }
    };

    return (
        <Modal show={show} onHide={closeModal}>
            <Modal.Header className={"d-flex justify-content-between"}>
                <div>{portfolioItem.ticker}</div>
                <div onClick={closeModal} className={"text-primary close-icon"} aria-label={"Close"}></div>
            </Modal.Header>
            <Modal.Body>
                <Container className={"mb-2"}>
                    Current Price: {portfolioItem.currentPrice}
                    <br/>
                    Money in Wallet: ${balance.toFixed(2)}
                    <br/>
                    <div className={"d-flex align-items-center"}>
                        <div className={"me-2"}>Quantity:</div>
                        <Form.Control
                            id="quantity"
                            type="number"
                            value={quantity}
                            min="0"
                            step="1"
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    {modeBuy && (total > balance) && <div className={"text-danger"}>Not enough money in wallet!</div>}
                    {!modeBuy && (quantity > portfolioItem.quantity) &&
                        <div className={"text-danger"}>You cannot sell the stocks you don't have!</div>}
                </Container>
            </Modal.Body>
            <Modal.Footer className={"d-flex justify-content-between"}>
                <div>Total : {total.toFixed(2)}</div>
                {modeBuy && <Button
                    variant="success"
                    disabled={quantity <= 0 || total > balance}
                    onClick={() => {
                        if(portfolioItem._id) handleBuySell(true, portfolioItem._id, parseInt(quantity), parseFloat(total));
                        else handleFirstBuy(portfolioItem.ticker, parseInt(quantity), parseFloat(total));
                        closeModal();
                    }}
                >Buy</Button>}
                {!modeBuy && <Button
                    variant="success"
                    disabled={!(0 < quantity && quantity <= portfolioItem.quantity)}
                    onClick={() => {
                        handleBuySell(false, portfolioItem._id, parseInt(quantity), parseFloat(total));
                        closeModal();
                    }}
                >Sell</Button>}
            </Modal.Footer>
        </Modal>
    )
}
