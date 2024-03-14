import React, {useState} from "react";
import '../App.css';
import { Card, CardContent, CardMedia, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import Pagination from '@material-ui/lab/Pagination';
import { makeStyles } from '@material-ui/core/styles';

const ITEMS_PER_PAGE = 6;
const useStyles = makeStyles({
    paginationContainer: {
        position: 'fixed',
        bottom: '25px',
        left: '290px',
        width: '100%',
    },
});

const MainTable = ({items = []}) => {
    const classes = useStyles();
    const [page, setPage] = useState(1);
    const handleChange = (event, value) => {
        setPage(value);
    };

    const getItemUrl = ({item}) => {
        let combinedName = item.author + '/' + item.title;
        return combinedName.split(' ').join('_');
    }

    let paginatedItems = [...items].splice((page - 1) * ITEMS_PER_PAGE, ITEMS_PER_PAGE);

    return (
        <div className="app">
            <div className="app__page">
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
                    {paginatedItems.map((item, index) => {
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
                <div className={classes.paginationContainer}>
                    <Pagination count={Math.ceil(items.length / ITEMS_PER_PAGE)} page={page} onChange={handleChange}/>
                </div>
            </div>
        </div>
    );
};

export default MainTable;