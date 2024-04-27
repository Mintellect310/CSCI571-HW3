import {Card, Col, Container, Modal, Row, Image} from "react-bootstrap";
import {useState} from "react";
import "./TopNews.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {dateFormat} from "../../helper";
import {faSquareFacebook, faXTwitter} from "@fortawesome/free-brands-svg-icons";

export default function TopNews({topNews, isSmallScreen}) {
    if(!topNews) return (
        <Container>Top News N/A</Container>
    )

    return (
        <Container>
            <Row>
                {
                    topNews.map((topNewsItem, index) => {
                        return <TopNewsCard
                            key={index}
                            topNewsItem={topNewsItem}
                            isSmallScreen={isSmallScreen}
                        />
                    })
                }
            </Row>
        </Container>
    );
}

function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
}

function TopNewsCard({ topNewsItem, isSmallScreen }) {
    console.log("topNewsItem: ", topNewsItem);
    const [show, setShow] = useState(false);
    const handleOpen = () => setShow(true);
    const handleClose = () => setShow(false);

    return (
        <>
            <Col md={12} lg={6} className={"mt-3"}>
                <Card onClick={handleOpen} className={"card-bg h-100"} style={{cursor: "pointer", padding: "0.8rem"}}>
                    <Container className={"px-0"}>
                        <Row className={"align-items-center"}>
                            <Col xs={12} sm={5} md={3}>
                                <Image
                                    src={topNewsItem.image}
                                    rounded
                                    fluid
                                    style={{
                                        width: isSmallScreen ? '95%' : '130px',
                                        height: isSmallScreen ? '20vh': '80px',
                                        objectFit: "cover"
                                    }}
                                />
                            </Col>
                            <Col xs={12} sm={7} md={9}>
                                <Card.Text>{truncateText(topNewsItem.headline, 80)}</Card.Text>
                            </Col>
                        </Row>
                    </Container>
                </Card>
            </Col>
            <NewsModal
                show={show}
                handleClose={handleClose}
                topNewsItem={topNewsItem}
            />
        </>
    );
}

/*
{
    "source":"Yahoo",
    "datetime":1710971118,
    "headline":"Apple (AAPL) Surpasses Market Returns: Some Facts Worth Knowing",
    "summary":"In the closing of the recent trading day, Apple (AAPL) stood at $178.66, denoting a +1.46% change from the preceding trading day.",
    "url":"https://finnhub.io/api/news?id=eef328d9b0a254107020c488464783a8268a68433a20be58b598fe2fa03471da",
    "image":"https://media.zenfs.com/en/zacks.com/0c6f98f4bf655bec3b199bc1a71b8b85"
}
*/

function NewsModal({show, handleClose, topNewsItem }) {
    return (
        <Modal show={show} onHide={handleClose} scrollable>
            <Modal.Header className={"d-flex justify-content-between"}>
                <div>
                    <h3 className={"mb-0"}>{topNewsItem.source}</h3>
                    <div className={"text-muted"}>{dateFormat(topNewsItem.datetime)}</div>
                </div>
                <div onClick={handleClose} className={"text-primary close-icon"} aria-label={"Close"}></div>
            </Modal.Header>
            <Modal.Body>
                <h5 className={"mb-0"}>{topNewsItem.headline}</h5>
                <div>{truncateText(topNewsItem.summary, 500)}</div>
                <div className={"text-muted mb-5"}>
                    For more details click <a href={topNewsItem.url} target="_blank" rel="noopener noreferrer">here</a>
                </div>
                <div className={"alert border mb-0"}>
                    <p>Share</p>
                    <a className="twitter-share-button"
                       href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(topNewsItem.headline)} ${encodeURIComponent(topNewsItem.url)}`}
                       target={"_blank"}
                       rel={"noopener noreferrer"}
                    >
                        <FontAwesomeIcon
                            icon={faXTwitter}
                            className={"me-2"}
                            size={"2x"}
                            style={{color: "black"}}
                        />
                    </a>
                    <a className="facebook-share-button"
                       href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(topNewsItem.url)}`}
                       target="_blank"
                       rel="noopener noreferrer"
                    >
                        <FontAwesomeIcon
                            icon={faSquareFacebook}
                            size={"2x"}
                            style={{color: "blue"}}
                        />
                    </a>
                </div>
            </Modal.Body>
        </Modal>
    )
}
