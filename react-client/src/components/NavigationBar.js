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

// Styling made manually
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

// functional style of component
export default function NavigationBar() {
    const classes = useStyles();

    // always returns JSX
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
