/*  
 * Navigation Bar
 * This component shows only on tablet
 * and desktop devices but not on mobile
 * phones.
 */
import React from 'react';
import { Link } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, Button } from '@material-ui/core';

//
const useStyles = makeStyles(function(theme) {
    return {
        root: {
            flexGrow: 1,
        },
        menuButton: {
            marginRight: theme.spacing(2),
        },
        title: {
            flexGrow: 1,
        }
    }
});

//
export default function NavigationBar() {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            {/* Style here is a hack to force black text and white background */}
            <AppBar position="static" style={{ color: '#000', background: '#fff' }}>
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>Fairu</Typography>

                    {/* These are used to navigate the website */}
                    <Button color="inherit" component={Link} to={'/'}>Home</Button>
                    <Button color="inherit" component={Link} to={'/upload'}>Contribute</Button>
                    <Button color="inherit" component={Link} to={'/list'}>Search</Button>
                </Toolbar>
            </AppBar>
        </div>
    );
}
