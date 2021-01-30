/*
 * Navigation for Mobile Devices
 * This will only show for mobile and
 * will not appear on desktop
 */
import React from 'react';
import { Link } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';

import HomeIcon from '@material-ui/icons/Home';
import ListIcon from '@material-ui/icons/List';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

const useStyles = makeStyles({ root: { width: 500 } });

// functional style of a component
// uses react's hook to keep its state
export default function MobileNavigationBar() {
    const classes = useStyles();
    const [value, setValue] = React.useState('/' + window.location.pathname.split('/')[0]); // This highlights 'home' right away

    // event handler for the current value of 
    // the highlighted part in mobile navigation
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    // always returns JSX
    return (
        // Styling here is used to position this on the bottom part always 
        // value attribute dictates the highlighted element among the action children, with a children having the same value
        <BottomNavigation value={value} onChange={handleChange} showLabels className={classes.root} style={{ width: '100%', position: 'fixed', bottom: 0 }}>>
            <BottomNavigationAction label="Home" value="/" component={Link} to={'/'} icon={<HomeIcon />}/>
            <BottomNavigationAction label="Find" value="/list" component={Link} to={'/list'} icon={<ListIcon />}/>
            <BottomNavigationAction label="Upload" value="/upload" component={Link} to={'/upload'} icon={<CloudUploadIcon />}/> 
        </BottomNavigation>
    );
}
