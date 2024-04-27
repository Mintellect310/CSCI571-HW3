import React, {useState} from "react";
import {Container} from "react-bootstrap";
import {
    Autocomplete,
    CircularProgress, Grid,
    IconButton,
    InputAdornment,
    ListItem,
    ListItemText, Paper,
    TextField
} from "@mui/material";
import {useNavigate} from "react-router-dom";

export default function SearchBar({ searchValue, wList, pfList, suggestions, setSuggestions, suggestionsLoading, setSuggestionsLoading, open, setOpen, setSearchValue, setContentLoading, setStock, setSummary, setHourlyData, setTopNews, setCharts, setInsights, setWList, setPfList, setIsFavourite, showSellButton, setShowSellButton, stockKey, setStockKey, wStockKey, setWStockKey, setShowNDFAlert, setShowValidTickerAlert, handleSearch }) {
    const navigate = useNavigate();

    // Handles the fetch suggestions
    const handleSuggestionsFetchRequested = async ({ value }) => {
        setSuggestionsLoading(true);
        try {
            const response = await fetch(`/autocomplete/${value.trim().toUpperCase()}`);
            const data = await response.json();
            setSuggestionsLoading(false);
            setSuggestions(data);
            if(data.length === 0) setShowNDFAlert(true);
        } catch (error) {
            setSuggestionsLoading(false);
            console.error('Error fetching suggestions:', error);
        }
    };

    const handleInputFocus = (event) => {
        setOpen(true);
    };

    // Clears the search field
    const handleClear = () => {
        setSearchValue('');
        setOpen(false);
        setStock(null);
        setSuggestions([]);
        setShowNDFAlert(false);
        setShowValidTickerAlert(false);
        navigate(`/search/home`);
    };

    // Handles input change and fetches suggestions
    const handleInputChange = (event, value, reason) => {
        console.log("handleInputChange - value: ", value);
        setSearchValue(value);
        if (reason === 'input') {
            handleSuggestionsFetchRequested({ value });
        }
    };

    const searchBarHandleSearch = async (event, value) => {
        handleSearch(event, value);
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

        navigate(`/search/${symbol}`);
    }

    // Render the search input field
    return (
        <Container className={"d-flex justify-content-center mb-4"}>
            <Grid container justifyContent="center">
                <Grid item xs={12} sm={10} md={8} lg={6}>
                    <Autocomplete
                        freeSolo
                        open={open}
                        onOpen={() => setOpen(true)}
                        onClose={() => {
                            setOpen(false);
                            setSuggestions([]);
                        }}
                        onInputChange={handleInputChange}
                        onChange={searchBarHandleSearch}
                        getOptionLabel={(option) => option.symbol}
                        options={suggestions}
                        loading={suggestionsLoading}
                        loadingText={<CircularProgress style={{ color: '#2324ae' }}  />}
                        inputValue={searchValue}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Enter stock ticker symbol"
                                variant="outlined"
                                fullWidth
                                onFocus={handleInputFocus}
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <InputAdornment position={"end"}>
                                            <IconButton
                                                onClick={(event) => searchBarHandleSearch(event, searchValue)}>
                                                <i className="bi bi-search" style={{color: "#2324ae", fontSize: "1rem"}}></i>
                                            </IconButton>
                                            <IconButton
                                                onClick={handleClear}>
                                                <i className="bi bi-x-lg" style={{color: "#2324ae", fontSize: "1rem"}}></i>
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    style: {
                                        padding: "0 16px"
                                    }
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderColor: "#2324ae",
                                        borderWidth: "3px",
                                        borderRadius: "50px",
                                        "& fieldset": {
                                            borderColor: "#2324ae",
                                            borderWidth: "3px",
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "#2324ae",
                                            borderWidth: "3px",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "#2324ae",
                                            borderWidth: "3px",
                                        }
                                    }
                                }}
                            />
                        )}
                        PaperComponent={(props) => {
                            return (
                                <Paper elevation={6} {...props} style={{...props.style}} />
                            );
                        }}
                        renderOption={(props, option) => (
                            <ListItem {...props} key={option.symbol}>
                                <ListItemText primary={`${option.symbol} | ${option.description}`} />
                            </ListItem>
                        )}
                    />
                </Grid>
            </Grid>
        </Container>
    );
}
