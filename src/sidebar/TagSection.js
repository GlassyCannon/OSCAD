import React from 'react';
import { ListItem, ListItemText, Collapse, Typography, List } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { Link as RouterLink } from 'react-router-dom';

const TagSection = ({ uniqueTags, open, handleClick, getTagUrl }) => (
    <div>
        <ListItem button onClick={() => handleClick('Tags')}>
            <ListItemText primary={
                <Typography variant='h6' style={{ fontWeight: 'bold' }}>
                    Tags
                </Typography>
            } />
            {open['Tags'] ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={open['Tags']} timeout='auto' unmountOnExit>
            <List component='div' disablePadding>
                {uniqueTags.map((tag, index) => (
                    <ListItem button component={RouterLink} to={getTagUrl(tag)} key={index}>
                        <ListItemText primary={
                            <Typography variant='body2'>
                                {tag}
                            </Typography>
                        } />
                    </ListItem>
                ))}
            </List>
        </Collapse>
    </div>
);

export default TagSection;