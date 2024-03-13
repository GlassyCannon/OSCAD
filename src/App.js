import React, {useEffect, useState} from "react";
import {Route, BrowserRouter, Routes, useParams} from "react-router-dom";
import Root from "./Root";
import {getAndUpdateTrackerList} from "./factories/trackerFactory";
import {LOCAL_STORAGE_ITEM_LIST} from "./constants";
import Sidebar from "./sidebar/Sidebar";
import ItemView from "./item/ItemView";
import { useNavigate } from 'react-router-dom';
import Home from '@material-ui/icons/Home';
import { IconButton, TextField, Button } from "@material-ui/core";
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from '@material-ui/core/styles';
import RefreshIcon from '@material-ui/icons/Refresh';
import Tooltip from "@material-ui/core/Tooltip";
import RestorePageIcon from '@material-ui/icons/RestorePage';


const useStyles = makeStyles((theme) => ({
    app: {
        display: 'flex',
    },
    appSidebar: {
        flex: '0.2',
        height: '100vh',
        padding: '20px',
        backgroundColor: theme.palette.divider
    },
    appPage: {
        flex: '0.8',
        padding: '20px',
    },
    appSearch: {
        marginBottom: '20px',
    },
    searchContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    formContainer: {
        display: 'flex',
        flexGrow: 1,
        alignItems: 'center',
    },
    btnSearch: {
        marginLeft: '10px',
    },
    searchBarInput: {
        flexGrow: 1,
        marginLeft: '10px',
    },
    sidebarList: {

    }
}));

const darkTheme = createTheme({
    palette: {
        type: 'dark',  // Switching the dark mode on
    },
});

const App = () => {
    const classes = useStyles();  // Just add this line
    const [isLoading, setIsLoading] = useState(true);
    const [isLoaded, setIsLoaded] = useState(true);
    const [itemData, setItemData] = useState([]);
    const [shownItemData, setShownItemData] = useState([]);

    const SidebarContainer = ({onTrackerListUpdate}) => {
        return (
            <div className={classes.appSidebar}>
                <Sidebar items={itemData} listClass={classes.sidebarList} onTrackerListUpdate={onTrackerListUpdate}/>
            </div>
        );
    };

    useEffect(() => {
        const loadData = async () => {
            await getAndUpdateTrackerList();
            setIsLoading(false);
            setIsLoaded(true);
        }

        loadData();
    }, []);

    useEffect(() => {
        if(isLoaded) {
            if(localStorage.getItem(LOCAL_STORAGE_ITEM_LIST)){
                setItemData(JSON.parse(localStorage.getItem(LOCAL_STORAGE_ITEM_LIST)));
                setShownItemData(JSON.parse(localStorage.getItem(LOCAL_STORAGE_ITEM_LIST)));
            }
        }

    }, [isLoaded]);

    const getItemsByProperty = (items, key, value) => {
        return items.filter(item => {
            if(!item[key]) return false;

            if(Array.isArray(item[key])) {
                return item[key].includes(value);
            } else {
                return item[key].toLowerCase() === value.toLowerCase();
            }
        });
    };
    const RootWithFilter = () => {
        const { filter, value } = useParams();
        const fixedValue = value.split('_').join(' ')
        const filteredItems = getItemsByProperty(itemData, filter, fixedValue);
        return <Root items={filteredItems} />
    }

    const onSearchSuccess = ({filteredItems}) => {
        setShownItemData(filteredItems);
    }

    const deleteAndReloadTrackers = async () => {
        localStorage.clear();
        setIsLoading(true);
        setIsLoaded(false);
        await getAndUpdateTrackerList();
        setIsLoading(false);
        setIsLoaded(true);
    };

    const reloadTrackers = async () => {
        setIsLoading(true);
        setIsLoaded(false);
        await getAndUpdateTrackerList();
        setIsLoading(false);
        setIsLoaded(true);
    };

    const onTrackerListUpdate = async () => {
        setIsLoading(true);
        setIsLoaded(false);
        await getAndUpdateTrackerList();
        setIsLoading(false);
        setIsLoaded(true);
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <BrowserRouter location={'/'}>
                <div className={classes.app}>
                    <SidebarContainer onTrackerListUpdate={onTrackerListUpdate}/>
                    <div className={classes.appPage}>
                        <SearchBar items={itemData} onSearch={onSearchSuccess}/>
                        {
                            isLoading ? <div>loading...</div>
                                :
                                <Routes>
                                    <Route path='/' element={<Root items={shownItemData}/>}/>
                                    <Route path="/:author/:item_name" element={<ItemView />} />
                                    <Route path="/s/:filter/:value" element={<RootWithFilter />} />
                                </Routes>
                        }

                        <Tooltip title="Reload Trackers">
                            <IconButton onClick={reloadTrackers}
                                        style={{marginRight: "16px", marginBottom: "16px",
                                            position: "fixed", right: "40px", bottom: "0"}}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete and Reload Trackers">
                            <IconButton onClick={deleteAndReloadTrackers}
                                        style={{marginRight: "16px", marginBottom: "16px",
                                            position: "fixed", right: "0", bottom: "0"}}>
                                <RestorePageIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
            </BrowserRouter>
        </ThemeProvider>
    );
};

const SearchBar = ({items, onSearch}) => {
    const [inputSearch, setInputSearch] = useState("");
    const navigate = useNavigate();
    const handleHomeButtonClick = () => {
        navigate('/');
    };

    const recursiveSearchInItem = (item, query) => {
        for (let val of Object.values(item)) {
            if (Array.isArray(val)) {
                for (let child of val) {
                    // Two cases here:
                    // * If it's an array of objects, recursively search in the child object
                    // * If it's an array of primitives, just check if the string representation includes the query
                    if (typeof child === 'object' && child !== null) {
                        if (recursiveSearchInItem(child, query)) {
                            return true;
                        }
                    } else if (String(child).toLowerCase().includes(query.toLowerCase())) {
                        return true;
                    }
                }
            } else if (String(val).toLowerCase().includes(query.toLowerCase())) {
                return true;
            }
        }
        return false;
    };

    const searchItems = query => items.filter(item => recursiveSearchInItem(item, query));

    const searchHandler = event => {
        event.preventDefault();

        const filteredItems = searchItems(inputSearch);

        setInputSearch(""); // Clear the search input
        onSearch({filteredItems: filteredItems});
    };

    return (
        <div className="app__search">
            <div className="search-container">
                <IconButton onClick={handleHomeButtonClick}>
                    <Home/>
                </IconButton>
                <form onSubmit={searchHandler}>
                    <TextField
                        value={inputSearch}
                        onChange={(event) => setInputSearch(event.target.value)}
                        type="text"
                        placeholder="Search"
                        fullWidth
                    />
                    <Button type="submit" variant="contained" color="primary">
                        Search
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default App;