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

//
export default function MobileNavigationBar() {
    const classes = useStyles();
    const [value, setValue] = React.useState('home'); // This highlights 'home' right away

    //
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    //
    return (
        // Styling here is used to position this on the bottom part always 
        <BottomNavigation value={value} onChange={handleChange} showLabels className={classes.root} style={{ width: '100%', position: 'fixed', bottom: 0 }}>>
            <BottomNavigationAction label="Home" value="home" component={Link} to={'/'} icon={<HomeIcon />}/>
            <BottomNavigationAction label="Find" value="list" component={Link} to={'/list'} icon={<ListIcon />}/>
            <BottomNavigationAction label="Upload" value="upload" component={Link} to={'/upload'} icon={<CloudUploadIcon />}/> 
        </BottomNavigation>
    );
}
