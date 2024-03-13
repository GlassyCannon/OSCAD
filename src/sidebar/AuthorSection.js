import React from 'react';
import { ListItem, ListItemText, Collapse, Typography, List } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { Link as RouterLink } from 'react-router-dom';

const AuthorSection = ({ uniqueAuthors, open, handleClick, items, getItemUrl }) => (
    <div>
        <ListItem button onClick={() => handleClick('Authors')}>
            <ListItemText primary={
                <Typography variant='h6' style={{ fontWeight: 'bold' }}>
                    Authors
                </Typography>
            } />
            {open['Authors'] ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={open['Authors']} timeout='auto' unmountOnExit>
            <List component='div' disablePadding>
                {uniqueAuthors.map((author, index) => (
                    <div key={index}>
                        <ListItem button onClick={() => handleClick(author)}>
                            <ListItemText primary={
                                <Typography variant='body2' style={{ textAlign: 'left' }}>
                                    {author}
                                </Typography>
                            } />
                            {open[author] ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={open[author]} timeout='auto' unmountOnExit>
                            <List component='div' disablePadding>
                                {items.filter(item => item.author === author).map((item, index) => (
                                    <ListItem button component={RouterLink} to={getItemUrl(item)} key={index}>
                                        <ListItemText primary={
                                            <Typography variant='body2' style={{ fontSize: '0.8rem' }}>
                                                {item.title}
                                            </Typography>
                                        } />
                                    </ListItem>
                                ))}
                            </List>
                        </Collapse>
                    </div>
                ))}
            </List>
        </Collapse>
    </div>
);

export default AuthorSection;