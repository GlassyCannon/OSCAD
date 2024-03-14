import React, { useEffect, useState } from 'react';
import {
    useTheme, List, Button,
    Dialog, DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, TextField, Box, withStyles, Grid, TextareaAutosize
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
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

// Add your custom styles here
const StyledTableCell = withStyles((theme) => ({
    body: {
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.common.white,
    }
}))(TableCell);

const StyledDialog = withStyles({
    paper: {
        minWidth: '1000px',
    },
})(Dialog);

// Helper function to recursively initialize fields
// Put the example item JSON here
const exampleItemStructure = {
    "title": "",
    "description": "",
    "media": [
        {
            "type": "",
            "link": ""
        }
    ],
    "author": "",
    "tags": [""],
    "datePublished": "",
    "lastUpdated": "",
    "version": "",
    "downloadLinks": [
        {
            "description": "",
            "link": ""
        }
    ],
    "devGroup": "",
    "otherLinks": [
        {
            "description": "",
            "link": ""
        }
    ]
};

const mediaTypes = ['image', 'embed'];

// Helper function to recursively initialize fields
function recursivelyInitializeFields(layer) {
    let initialValues = {};
    for (let key in layer) {
        if (Array.isArray(layer[key])) {
            if (typeof layer[key][0] === 'object') {
                initialValues[key] = [recursivelyInitializeFields(layer[key][0])];
            } else {
                initialValues[key] = ['']; // initialize for primitive type array
            }
        } else if (typeof layer[key] === 'object') {
            initialValues[key] = recursivelyInitializeFields(layer[key]);
        } else {
            initialValues[key] = '';
        }
    }
    return initialValues;
}

const initialValues = recursivelyInitializeFields(exampleItemStructure);

const Sidebar = ({ items, listClass, onTrackerListUpdate }) => {
    const theme = useTheme();
    const [open, setOpen] = useState({});
    const [openModal, setOpenModal] = useState(false);
    const [showAddLink, setShowAddLink] = useState(false);
    const [newLink, setNewLink] = useState('');
    const [trackerLinks, setTrackerLinks] = useState([]);
    const [openJsonModal, setOpenJsonModal] = useState(false);
    const [itemData, setItemData] = useState(initialValues);
    const [jsonOutput, setJsonOutput] = useState('');
    const [jsonOutputVisible, setJsonOutputVisible] = useState(false);

    useEffect(() => {
        let savedLinks;
        try {
            let decompressed = LZString.decompressFromUTF16(localStorage.getItem(LOCAL_STORAGE_TRACKER_LIST));
            // Let's prevent JSON parsing when decompressed value is null
            if (decompressed) {
                savedLinks = JSON.parse(decompressed);
            } else {
                console.log("No links are found or the decompressed value is null.");
            }
        } catch (e) {
            console.error("Error while decompressing and parsing the tracker link list:", e);
        }
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

    const handleItemDataChange = (path, value) => {
        let itemDataCopy = {...itemData};
        let pointer = itemDataCopy;
        for (let i = 0; i < path.length - 1; i++) {
            pointer = pointer[path[i]];
        }
        pointer[path[path.length - 1]] = value;
        setItemData(itemDataCopy);
    };

    const getField = (path, data) => {
        const isMediaTypeField = path.length >= 2 && path[path.length - 2] === 'media' && path[path.length - 1] === 'type';

        if (Array.isArray(data)) {
            return (
                <div key={path.join('-')}>
                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '1em'}}>
                        <h3 style={{margin: 0}}>{path.slice(-1)}</h3>
                        <IconButton style={{marginLeft: '1em'}} onClick={() => addNewField(path)}>
                            <AddIcon/>
                        </IconButton>
                    </div>
                    {data.map((item, index) => {
                        if (typeof item === 'object') {
                            return (
                                <Grid container spacing={1} style={{marginLeft: '2em'}}>
                                    <Grid item xs={10}>
                                        {Object.keys(item).map((field) => getField([...path, index, field], item[field]))}
                                    </Grid>
                                    <Grid container xs={2} alignItems="center">
                                        <IconButton onClick={() => removeField(path, index)}>
                                            <DeleteIcon/>
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            );
                        } else {
                            return (
                                <Grid container alignItems="flex-start" key={index} style={{marginBottom: '1em'}}>
                                    <Grid item xs={10}>
                                        <TextField
                                            style={{width: '90%'}}
                                            variant="outlined"
                                            placeholder={path.slice(-1).toString().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                            value={item}
                                            onChange={(e) => handleItemDataChange([...path, index], e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={2} style={{display: 'flex', justifyContent: 'center'}}>
                                        <IconButton onClick={() => removeField(path, index)}>
                                            <DeleteIcon/>
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            );
                        }
                    })}
                </div>
            );
        } else if (typeof data === 'object') {
            return Object.keys(data).map((field) => getField([...path, field], data[field]));
        } else if (isMediaTypeField) {
            return (
                <Box m={1} key={path.join('-')} style={{marginBottom: '1em'}}>
                    <Grid container alignItems="center">
                        <Grid item xs={10}>
                            <Select
                                style={{width: '100%'}}
                                variant="outlined"
                                value={data}
                                onChange={(e) => handleItemDataChange(path, e.target.value)}
                            >
                                {mediaTypes.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                    </Grid>
                </Box>
            )
        } else {
            return (
                <Box m={1} key={path.join('-')} style={{ marginBottom: '1em' }}>
                    <Grid container alignItems="center">
                        <Grid item xs={10}>
                            <TextField
                                style={{ width: '90%' }}
                                variant="outlined"
                                placeholder={path.slice(-1).toString().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                value={data}
                                onChange={(e) => handleItemDataChange(path, e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </Box>
            );
        }
    };

    const addNewField = (path) => {
        let itemDataCopy = JSON.parse(JSON.stringify(itemData)); // Using a deep copy to prevent any reference issues
        let pointer = itemDataCopy;
        for (let i = 0; i < path.length; i++) {
            pointer = pointer[path[i]];
        }
        if (typeof pointer[0] === 'object'){
            pointer.push({ ...pointer[0] }); // Copy the first object structure
        } else {
            pointer.push(''); // Default to empty string for primitive array types
        }
        setItemData(itemDataCopy);
    };

    const removeField = (path, index) => {
        let itemDataCopy = {...itemData};
        let pointer = itemDataCopy;
        for (let i = 0; i < path.length - 1; i++) {
            pointer = pointer[path[i]];
        }
        pointer[path[path.length - 1]].splice(index, 1);
        setItemData(itemDataCopy);
    };

    const generateJson = () => {
        setJsonOutput(JSON.stringify(itemData, null, 2));
        setJsonOutputVisible(true);
    };

    return (
        <List component='nav' className={listClass} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flexGrow: 1 }}>
                <AuthorSection uniqueAuthors={uniqueAuthors} open={open} handleClick={toggleCollapse} items={items} getItemUrl={getItemUrl} />
                <TagSection uniqueTags={uniqueTags} open={open} handleClick={toggleCollapse} getTagUrl={getTagUrl} />
                <GroupSection uniqueGroups={uniqueGroups} open={open} handleClick={toggleCollapse} getGroupUrl={getGroupUrl} />
            </div>
            <Button color="primary" variant="contained" onClick={handleOpen} style={{ marginBottom: '10px' }}>
                Open Tracker List
            </Button>
            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="lg">
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

            <Button color="primary" variant="contained" onClick={() => setOpenJsonModal(true)} style={{ marginTop: 'auto' }}>
                Generate New Project JSON
            </Button>
            <StyledDialog open={openJsonModal} onClose={() => setOpenJsonModal(false)} maxWidth="lg" style={{minWidth: "1000px"}}>
                <DialogTitle>Generate New Project JSON</DialogTitle>
                <DialogContent>
                    {getField([], itemData)}
                    <Button variant="contained" color="primary" onClick={generateJson}>Generate JSON</Button>
                    {jsonOutputVisible &&
                        <TextareaAutosize
                            style={{ width: '100%', marginTop: '10px' }}
                            rowsMin={15}
                            value={jsonOutput}
                            readOnly
                        />
                    }
                </DialogContent>
            </StyledDialog>
            </List>
    );
};

export default Sidebar;