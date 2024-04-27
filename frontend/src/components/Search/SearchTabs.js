import * as React from 'react';
import Box from '@mui/material/Box';
import Tabs, { tabsClasses } from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {PropTypes, Typography} from "@mui/material";
import Summary from "../Summary/Summary";
import TopNews from "../TopNews/TopNews";
import Charts from "../Charts/Charts";
import Insights from "../Insights/Insights";

function useCustomMediaQuery(query) {
    const [matches, setMatches] = React.useState(false);

    React.useEffect(() => {
        const media = window.matchMedia(query);
        const updateMatch = () => setMatches(media.matches);
        updateMatch(); // Initialize match state on mount

        media.addEventListener('change', updateMatch);
        return () => media.removeEventListener('change', updateMatch);
    }, [query]);

    return matches;
}

export default function SearchTabs({stock, summary, hourlyData, hourlyDataColor, topNews, charts, insights, setSearchValue, handleSearch}) {
    const [value, setValue] = React.useState(0);
    const isSmallScreen = useCustomMediaQuery('(max-width: 576px)');

    console.log("summary: ", summary);
    console.log("topNews:", topNews);
    console.log("charts:", charts);
    console.log("insights:", insights);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box
            sx={{
                flexGrow: 1,
                maxWidth: "100%",
                bgcolor: 'background.paper'
            }}
        >
            <Tabs
                value={value}
                onChange={handleChange}
                scrollButtons={isSmallScreen ? 'auto' : 'off'}
                allowScrollButtonsMobile={isSmallScreen}
                variant={isSmallScreen ? "scrollable" : "fullWidth"}
                aria-label="search tabs"
                sx={{
                    [`& .${tabsClasses.scrollButtons}`]: {
                        '&.Mui-disabled': { opacity: 0.3 },
                    },
                    '& .MuiTabs-indicator': {
                        backgroundColor: '#2324ae',
                    }
                }}
            >
                <Tab
                    label="Summary"
                    {...a11yProps(0)}
                    sx={{
                        textTransform: "none",
                        color: '#2324ae',
                        '&.Mui-selected': {
                            color: '#2324ae',
                        },
                        ':hover': {
                            backgroundColor: 'rgba(35, 36, 174, 0.03)',
                        }
                    }}
                />
                <Tab
                    label="Top News"
                    {...a11yProps(1)}
                    sx={{
                        textTransform: "none",
                        color: '#2324ae',
                        '&.Mui-selected': {
                            color: '#2324ae'
                        },
                        ':hover': {
                            backgroundColor: 'rgba(35, 36, 174, 0.03)',
                        }
                    }}
                />
                <Tab
                    label="Charts"
                    {...a11yProps(2)}
                    sx={{
                        textTransform: "none",
                        color: '#2324ae',
                        '&.Mui-selected': {
                            color: '#2324ae'
                        },
                        ':hover': {
                            backgroundColor: 'rgba(35, 36, 174, 0.03)',
                        }
                    }}
                />
                <Tab
                    label="Insights"
                    {...a11yProps(3)}
                    sx={{
                        textTransform: "none",
                        color: '#2324ae',
                        '&.Mui-selected': {
                            color: '#2324ae'
                        },
                        ':hover': {
                            backgroundColor: 'rgba(35, 36, 174, 0.03)',
                        }
                    }}
                />
            </Tabs>
            <TabPanel value={value} index={0}>
                <Summary summary={summary} hourlyData={hourlyData} hourlyDataColor={hourlyDataColor} setSearchValue={setSearchValue}
                 handleSearch={handleSearch} />
            </TabPanel>
            <TabPanel value={value} index={1}>
                {/*TODO: Links to Share buttons, Styling, Orientation */}
                <TopNews topNews={topNews} isSmallScreen={isSmallScreen} />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <Charts charts={charts} />
            </TabPanel>
            <TabPanel value={value} index={3}>
                <Insights insights={insights} name={stock.name} />
            </TabPanel>
        </Box>
    );
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 0 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}
