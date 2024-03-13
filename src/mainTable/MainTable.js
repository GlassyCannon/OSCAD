import React, {useState} from "react";
import '../App.css';
import { Card, CardContent, CardMedia, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
const MainTable = ({items = []}) => {
    const getItemUrl = ({item}) => {
        let combinedName = item.author + '/' + item.title;
        return combinedName.split(' ').join('_');
    }

    return (
        <div className="app">
            <div className="app__page">
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
                    {items.map((item, index) => {
                        const imageMedia = item.media.find(mediaItem => mediaItem.type === 'image');
                        return (
                            <Card key={index} style={{ maxWidth: 345, margin: '10px' }}>
                                {imageMedia &&
                                    <CardMedia
                                        component="img"
                                        alt={item.title}
                                        height="140"
                                        image={imageMedia.link}
                                    />
                                }
                                <CardContent>
                                    <Typography variant="h5" component="div">
                                        <Link to={`/${getItemUrl({item})}`}>{item.title}</Link>
                                    </Typography>
                                    <Typography variant="subtitle1" color="textSecondary">
                                        {item.author}
                                    </Typography>
                                    {/* Display further information in the card content */}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const SearchBar = () => {
    const [inputSearch, setInputSearch] = useState("");

    const searchHandler = (event) => {
        event.preventDefault();
        console.log("Searching", inputSearch);
        setInputSearch("");
    };

    return (
        <div className="app__search">
            <form>
                <input
                    value={inputSearch}
                    onChange={(event) => setInputSearch(event.target.value)}
                    type="text"
                    placeholder="Search"
                />
                <button onClick={searchHandler} type="submit">
                    Search
                </button>
            </form>
        </div>
    );
};

const Homepage = () => {
    return (
        <div className="app__homepage">
            <h1>This is the homepage</h1>
        </div>
    );
};

export default MainTable;