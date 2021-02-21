/*
 * Navigation for Mobile Devices
 * This will only show for mobile and
 * will not appear on desktop, this was designed
 * with a Floating Action Button for a non-clogging
 * look with the navigation
 */
import React from 'react';
import { Link } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import { BottomNavigation, BottomNavigationAction, Fab } from '@material-ui/core';

import EjectIcon from '@material-ui/icons/Eject';
import HomeIcon from '@material-ui/icons/Home';
import ListIcon from '@material-ui/icons/List';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

const useStyles = makeStyles({ 
    fabNavigation: {
        position: 'fixed',
        right: 20,
        transitionDuration: '0.5s'
    },
    mobileNavigation: { 
        width: '100%',
        position: 'fixed', 
        transitionDuration: '0.5s',
    }
});

// functional style of a component
// uses react's hook to keep its state
export default function MobileNavigationBar() {
    const classes = useStyles();
    const [activeLink, setActiveLink] = React.useState('/' + window.location.pathname.split('/')[1]); // This highlights 'home' right away
    const [isNavigationShowing, setNavigationShowing] = React.useState(false);

    // event handler for the current value of 
    // the highlighted part in mobile navigation
    const handleChangeLink = (event, newLink) => {
        setActiveLink(newLink);
    };

    // event handler for whether the navigation bar is shown or not
    const handleFabToggle = (event) => {
        setNavigationShowing(!isNavigationShowing);
    }

    return (
        <div>
            <Fab 
                color="primary"
                aria-label="toggle-navigation"
                className={classes.fabNavigation}
                onClick={handleFabToggle}
                style={
                    isNavigationShowing ?
                        { transform: 'rotate(-180deg)', bottom: 76 } : { transform: 'rotate(0deg)', bottom: 20 }
                }
            >
                <EjectIcon />
            </Fab>
            <BottomNavigation 
                    value={activeLink} 
                    onChange={handleChangeLink} 
                    showLabels 
                    className={classes.mobileNavigation}
                    style={
                        isNavigationShowing ? { bottom: 0 } : { bottom: -56 }
                    }
            >
                <BottomNavigationAction label="Home" value="/" component={Link} to={'/'} icon={<HomeIcon />}/>
                <BottomNavigationAction label="Find" value="/list" component={Link} to={'/list'} icon={<ListIcon />}/>
                <BottomNavigationAction label="Upload" value="/upload" component={Link} to={'/upload'} icon={<CloudUploadIcon />}/> 
            </BottomNavigation>
        </div>
    );
}
