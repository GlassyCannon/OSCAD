import React, { useEffect, useState } from 'react';
import { useTheme, List, Button,
    Dialog, DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, TextField, Box, withStyles, Grid
} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import AuthorSection from "./AuthorSection";
import TagSection from "./TagSection";
import GroupSection from "./GroupSection";
import LZString from "lz-string";
import {LOCAL_STORAGE_TRACKER_LIST} from "../constants";

// Add your custom styles here
const StyledTableCell = withStyles((theme) => ({
    body: {
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.common.white,
    },
}))(TableCell);

const Sidebar = ({ items, listClass, onTrackerListUpdate }) => {
    const theme = useTheme();
    const [open, setOpen] = useState({});
    const [openModal, setOpenModal] = useState(false);
    const [showAddLink, setShowAddLink] = useState(false);
    const [newLink, setNewLink] = useState('');
    const [trackerLinks, setTrackerLinks] = useState([]);

    useEffect(() => {
        const savedLinks = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem(LOCAL_STORAGE_TRACKER_LIST)));
        if (savedLinks) setTrackerLinks(savedLinks);
    }, []);

    const onNewLinkChange = (event) => {
        setNewLink(event.target.value);
    };

    const onAddNewLink = () => {
        const newLinks = [...trackerLinks, newLink];
        setTrackerLinks(newLinks);
        localStorage.setItem('LOCAL_STORAGE_TRACKER_LIST', LZString.compressToUTF16(JSON.stringify(newLinks)));
        setNewLink('');
        setShowAddLink(false);
        onTrackerListUpdate();
    };

    const handleClose = () => {
        setOpenModal(false);
        setShowAddLink(false);
    };

    const handleOpen = () => {
        setOpenModal(true);
    };

    const toggleCollapse = (section) => {
        setOpen(prevOpen => ({ ...prevOpen, [section]: !prevOpen[section] }));
    };

    const getItemUrl = (item) => {
        let combinedName = item.author + '/' + item.title;
        return combinedName.split(' ').join('_');
    };

    const getTagUrl = (tag) => {
        let tagUrl = 's/tags/' + tag;
        return tagUrl.split(' ').join('_');
    };

    const getGroupUrl = (group) => {
        let groupUrl = 's/devGroup/' + group;
        return groupUrl.split(' ').join('_');
    };

    const onDeleteLink = (index) => {
        const newLinks = [...trackerLinks];
        newLinks.splice(index, 1);
        setTrackerLinks(newLinks);
        localStorage.setItem('LOCAL_STORAGE_TRACKER_LIST', LZString.compressToUTF16(JSON.stringify(newLinks)));
        onTrackerListUpdate();
    };

    const uniqueAuthors = [...new Set(items.map(item => item.author))];
    const uniqueTags = [...new Set(items.flatMap(item => item.tags))];
    const uniqueGroups = [...new Set(items.map(item => item.devGroup))];

    return (
        <List component='nav' className={listClass} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <AuthorSection uniqueAuthors={uniqueAuthors} open={open} handleClick={toggleCollapse} items={items} getItemUrl={getItemUrl} />
            <TagSection uniqueTags={uniqueTags} open={open} handleClick={toggleCollapse} getTagUrl={getTagUrl} />
            <GroupSection uniqueGroups={uniqueGroups} open={open} handleClick={toggleCollapse} getGroupUrl={getGroupUrl} />
            <Button color="primary" variant="contained" onClick={handleOpen} style={{ marginTop: 'auto' }}>
                Open Tracker List
            </Button>
                <Dialog open={openModal} onClose={() => setOpenModal(false)}>
                    <DialogTitle>
                        Tracker Links
                        <IconButton style={{ position: 'absolute', right: '10px', top: '10px' }} onClick={handleClose}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ backgroundColor: theme.palette.primary.light, color: theme.palette.common.white, display:"flex", justifyContent:"space-between", flex:"auto" }}>
                                            <Box style={{display:"flex", justifyContent:"space-between", flex:"auto", alignItems:"center"}}>
                                                <span>Link</span>
                                                <IconButton aria-label="add" onClick={() => setShowAddLink(true)}>
                                                    <AddIcon />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {trackerLinks.map((link, index) => (
                                        <TableRow key={index}>
                                            <StyledTableCell component="th" scope="row">
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <a href={link} target="_blank" rel="noreferrer">{link}</a>
                                                    <IconButton aria-label="delete" onClick={() => onDeleteLink(index)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </div>
                                            </StyledTableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {showAddLink && (
                            <Box m={1}>
                                <Grid container spacing={1} alignItems="flex-end">
                                    <Grid item style={{ flexGrow: 1 }}>
                                        <TextField fullWidth value={newLink} onChange={onNewLinkChange} label="New Link" />
                                    </Grid>
                                    <Grid item>
                                        <Button onClick={onAddNewLink} variant="contained" color="primary">
                                            Save
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </DialogContent>
                </Dialog>
            </List>
    );
};

export default Sidebar;