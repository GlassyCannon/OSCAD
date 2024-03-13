import React from 'react';
import { ListItem, ListItemText, Collapse, Typography, List } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { Link as RouterLink } from 'react-router-dom';

const GroupSection = ({ uniqueGroups, open, handleClick, getGroupUrl }) => (
    <div>
        <ListItem button onClick={() => handleClick('Groups')}>
            <ListItemText primary={
                <Typography variant='h6' style={{ fontWeight: 'bold' }}>
                    Groups
                </Typography>
            } />
            {open['Groups'] ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={open['Groups']} timeout='auto' unmountOnExit>
            <List component='div' disablePadding>
                {uniqueGroups.map((group, index) => (
                    <ListItem button component={RouterLink} to={getGroupUrl(group)} key={index}>
                        <ListItemText primary={
                            <Typography variant='body2'>
                                {group}
                            </Typography>
                        } />
                    </ListItem>
                ))}
            </List>
        </Collapse>
    </div>
);

export default GroupSection;