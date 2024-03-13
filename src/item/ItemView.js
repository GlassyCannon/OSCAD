import React, {useEffect, useState} from "react";
import {Box, Grid, Chip, IconButton, Typography, makeStyles, Container} from "@material-ui/core";
import { getItemFromLocalStorage } from "../factories/itemFactory";
import {useParams, useNavigate, Link} from "react-router-dom";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '28vh', // Changed from 100vh to auto to avoid unnecessary scroll
        width: '100%'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px',
    },
    titleBox: {
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'left',
    },
    detailsBox: {
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'right',
    },
    content: {
        overflowY: 'auto',
        flex: '1 0 auto',
        padding: '1em',
        textAlign: 'center'
    },
    media: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '20px',
        marginBottom: '20px',
    },
    carouselImage: {
        height: '40vh',
    },
    chip: {
        margin: '5px',
    },
    twoColumnLayout: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    columnItem:{
        width:'48%'
    }
});

const ItemView = () => {
    const [item, setItem] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();
    const { author, item_name } = useParams();
    const classes = useStyles();

    useEffect(() => {
        const loadItem = async () => {
            let item = await getItemFromLocalStorage(author, item_name.replace(/_/g, ' '));
            if(item) {
                setItem(item);
                setIsLoading(false);
            }
        }
        loadItem();
    }, [author, item_name]);

    const previousSlide = () => {
        const prevIndex = currentSlide - 1 < 0 ? item.media.length - 1 : currentSlide - 1;
        setCurrentSlide(prevIndex);
    };

    const nextSlide = () => {
        const nextIndex = currentSlide + 1 === item.media.length ? 0 : currentSlide + 1;
        setCurrentSlide(nextIndex);
    };

    return isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <Typography variant="h6">Loading...</Typography>
        </Box>
    ) : (
        <Box className={classes.root}>
            <Box className={classes.header}>
                <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
                <Box className={classes.titleBox}>
                    <Typography variant="h3" gutterBottom>{item.title}</Typography>
                    <Typography variant="h5">By {item.author}</Typography>
                </Box>
                <Box className={classes.detailsBox}>
                    <Typography variant="body1">Published on {item.datePublished}</Typography>
                    <Typography variant="body1">Last updated on {item.lastUpdated}</Typography>
                </Box>
            </Box>
            <Container maxWidth="md" className={classes.content}>
            <Box className={classes.media}>
                <IconButton onClick={previousSlide}>
                    <NavigateBeforeIcon/>
                </IconButton>
                {item.media.length > 0 && (
                    item.media[currentSlide].type === 'image' ?
                        <img className={classes.carouselImage} src={item.media[currentSlide].link} alt={item.title} key={item.media[currentSlide].link}/> :
                        <div dangerouslySetInnerHTML={{__html: item.media[currentSlide].link}} key={item.media[currentSlide].link}/>
                )}
                <IconButton onClick={nextSlide}>
                    <NavigateNextIcon/>
                </IconButton>
            </Box>
                <Box className={classes.root}>
                    {/* ...your previous code... */}
                    <Container maxWidth="md" className={classes.content}>
                        {/* ...your previous code for media carousel... */}
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h4">Description</Typography>
                                <Typography variant="body1">{item.description}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h4">Download Links</Typography>
                                {
                                    item.downloadLinks.map(link =>
                                        <Typography key={link.description}>
                                            <Link to={link.link}>{link.description}</Link>
                                        </Typography>)
                                }
                                <Typography variant="h4">Dev Group</Typography>
                                <Typography variant="body1">{item.devGroup}</Typography>
                                <Typography variant="h4">Other Links</Typography>
                                {
                                    item.otherLinks.map(link =>
                                        <Typography key={link.description}>
                                            <Link to={link.link}>{link.description}</Link>
                                        </Typography>)
                                }
                                <Typography variant="h4">Version</Typography>
                                <Typography variant="body1">{item.version}</Typography>
                                <Typography variant="h4">Tags</Typography>
                                {
                                    item.tags.map(tag => <Chip label={tag} className={classes.chip} />)
                                }
                            </Grid>
                        </Grid>
                    </Container>
                </Box>
        </Container>
        </Box>
    );
};

export default ItemView;