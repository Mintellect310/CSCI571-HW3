function OldSearchBar({ setStock }) {
    const [searchValue, setSearchValue] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [showValidTickerMsg, setShowValidTickerMsg] = useState(false);

    const formControlRef = useRef(null); // Ref for the Form.Control
    const [formControlWidth, setFormControlWidth] = useState(null); // State for the width
    const lastFetchRequest = useRef(null); // Tracks the last fetch request

    // useEffect hook to update the width based on the Form.Control's actual width
    useEffect(() => {
        let isMounted = true; // Track mounted state
        setFormControlWidth(formControlRef.current ? formControlRef.current.offsetWidth : 0);
        const handleResize = () => {
            setFormControlWidth(formControlRef.current ? formControlRef.current.offsetWidth : 0);
        };

        // Update width on window resize
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            // Clean up: abort any ongoing fetch when the component unmounts
            if (fetchControllerRef.current) {
                fetchControllerRef.current.abort();
            }
            isMounted = false;
        }
    }, []);

    const fetchControllerRef = useRef(null);
    const handleSuggestions = async (value) => {
        setLoading(true);

        const currentFetchRequest = Symbol(); // Unique symbol for the current fetch
        lastFetchRequest.current = currentFetchRequest; // Update the ref to the current fetch

        // Cancel the previous request
        if (fetchControllerRef.current) {
            fetchControllerRef.current.abort(); // Abort the previous request
        }

        // Create a new controller for the current request
        const controller = new AbortController();
        fetchControllerRef.current = controller;

        // console.log("in suggestions...");
        // console.log("value: ", value);
        try {
            const response = await fetch(`/autocomplete/${value.trim().toUpperCase()}`, {
                signal: controller.signal,
            });
            const suggestions = await response.json();

            // Only update state if this is the last request made
            if (lastFetchRequest.current === currentFetchRequest) {
                setSuggestions(suggestions);
                setLoading(false); // End loading only if this is the latest request
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                // Ignore the error if the fetch was aborted
                console.log('Fetch aborted');
            } else {
                // Handle other errors
                console.error("Error fetching suggestions: ", error);
                if (lastFetchRequest.current === currentFetchRequest) {
                    setLoading(false); // Ensure loading is stopped on error
                }
            }
        }
    };

    function handleSearch(value = searchValue.trim().toUpperCase()) {
        if(value === "") {
            setShowValidTickerMsg(true);
            setTimeout(() => setShowValidTickerMsg(false), 5000);
        }

        setSearchValue(value);
        // setAnchorEl(null);
        if(value !== "") {
            fetch(`/stock/${value}`)
                .then(res => res.json())
                .then(data => {
                    setStock(data);
                })
                .catch(error => {
                    console.error("Error fetching stock data: ", error);
                });
        }
    }

    const handleFocus = (event) => {
        setAnchorEl(event.currentTarget);
    };

    function handleClear() {
        setSearchValue("");
        setSuggestions([]);
        setStock(null);
    }

    const handleInputChange = async (event) => {
        const newSearchValue = event.target.value;
        setSearchValue(newSearchValue);
        if(newSearchValue.trim() === "") {
            setSuggestions([]);
            setLoading(false);
            return;
        }

        setAnchorEl(event.currentTarget);
        console.log("newSearchValue: ", newSearchValue);
        setLoading(true);
        await handleSuggestions(newSearchValue).then(() => setLoading(false));
    }

    const handleKeyDown = event => {
        if (event.key === "Enter") {
            handleSearch();
        }
        if(event.key === "Esc") {
            handleClear();
        }
    }

    const open = Boolean(anchorEl) && (loading || suggestions.length > 0);
    console.log("Hi!", open, anchorEl);

    return (
        <Container>
            <div className={"text-center"}>
                <h1 className="text-center mb-4">STOCK SEARCH</h1>
            </div>
            <div className={"d-flex justify-content-center mb-4"}>
                <div className="col-9 col-md-6 col-lg-4 px-0">
                    <InputGroup className={"input-group"}>
                        <Form.Control
                            ref={formControlRef}
                            type="search"
                            placeholder="Enter stock ticker symbol"
                            className="search-bar-control"
                            value={searchValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                        />
                        <Button onClick={handleSearch} className={"search-bar-button"}>
                            <i className="bi bi-search"></i>
                        </Button>
                        <Button className={"search-bar-button"} onClick={handleClear}>
                            <i className="bi bi-x-lg search-clear-button"></i>
                        </Button>
                    </InputGroup>
                </div>
                {/*<SimplePaper />*/}
                <Popper
                    open={open}
                    anchorEl={anchorEl}
                    onClose={() => setAnchorEl(null)}
                    placement="bottom-start"
                    style={{ width: formControlWidth ? `${formControlWidth}px` : 'auto' }} // Apply dynamic width here
                >
                    <Paper elevation={6}>
                        <List dense>
                            {loading ? (
                                <ListItem>
                                    <CircularProgress style={{ color: '#2324ae' }}  />
                                </ListItem>
                            ) : (
                                suggestions.map((suggestion) => {
                                    return (
                                        <ListItemButton key={suggestion.symbol} onClick={() => {
                                            console.log(`Before Closing: Clicked ${suggestion.symbol}`);
                                            handleSearch(suggestion.symbol);
                                            setAnchorEl(null);
                                            console.log(`After Closing: Clicked ${suggestion.symbol}`);
                                            console.log(open);
                                        }}>
                                            <ListItemText primary={`${suggestion.symbol} | ${suggestion.description}`} />
                                        </ListItemButton>
                                    );
                                }))}
                        </List>
                    </Paper>
                </Popper>
                {showValidTickerMsg &&
                    <Alert
                        variant={"danger"}
                        onClose={() => setShowValidTickerMsg(false)}
                        dismissible
                    >Please enter a valid ticker</Alert>
                }
            </div>
        </Container>
    );
}

function SimplePaper() {
    const suggestions = ["Apple", "Banana", "Cherry", "Grapes", "Mango", "Papaya"];
    return (
        <Autocomplete
            freeSolo
            options={suggestions}
            renderInput={(params) => (
                <TextField {...params} label="Search" margin="normal" variant="outlined" />
            )}

            // Additional props to manage focus and behavior...
        />
    );
}