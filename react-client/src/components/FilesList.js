/*
 * This is what most of the users will
 * be interested on using. Files List 
 * renders all the files and allows for navigation
 * in order to download the files they want.
 */
import React, { Component } from 'react';
import axios from 'axios';

// material-ui components
import { withStyles } from '@material-ui/core';
import { Grid, Typography, Paper, InputBase, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@material-ui/core';

// Icons are individually imported as there is no other way
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';

// this styling is applied on object components using withStyles
// essentially CSS but as a JSON
const styles = theme => ({
    root: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
    },
    input: {
        marginLeft: theme.spacing(1),
        flex: 1,
    },
    iconButton: {
        padding: 10,
    },
    divider: {
        height: 28,
        margin: 4,
    },
});

/*
 * Object component as this takes in a lot 
 * of values
 */
class FilesList extends Component {
    constructor(properties) {
        super(properties);

        // binding is essential for context in 'this'
        this.onChangeSearchBar = this.onChangeSearchBar.bind(this);
        this.onSubmit = this.onSubmit.bind(this)

        // files is an array containing all the results
        // query is the query on the search bar and url
        this.state = {
            files: [],
            query: ''
        }
    }

    // triggers when search bar input value is changed
    onChangeSearchBar(event) { this.setState({ query: event.target.value }); }

    // triggers when search bar submit is triggered
    onSubmit(event) {
        // prevent traditional form handling
        event.preventDefault();

        // GET request using a query string
        // query strings are ?name=Foo&age=16 in https://bar.com/?name=Foo&age=16
        axios.get('http://localhost:8000/files/search', { params: { query: this.state.query } })
            .then(response => {
                this.setState({ files: response.data })
                // this changes URL without rerendering
                this.props.history.replace({ pathname: `/list/search/${this.state.query}`})
            });
    }

    // this triggers when this component loads or mounts is what they call it
    componentDidMount() {
        // this is to support URL sharing with search queries
        // triggers when the url is /list/search/:query
        if (this.props.match.params.query) {
            // setState does not trigger synchronously, thus a callback is essential
            this.setState({ query: this.props.match.params.query }, () => {
                // this gets and sets the proper file results
                axios.get('http://localhost:8000/files/search', { params: { query: this.state.query } })
                    .then(response => { this.setState({ files: response.data })
                });
            });
        } else {
            // if the URL is only at /list
            // essentially get a list of the files 
            // then update the files in the state
            axios.get('http://localhost:8000/files')
                .then(response => {
                    if (response.data.length > 0) {
                        this.setState({ files: response.data })
                    }
                });
        }
    }

    // the daunting function, mixed with JSX and logic
    render() {
        // this is possible due to withStyles
        const { classes } = this.props;

        // massive
        return (
            <Grid container spacing={3} justify="center">
                <Grid item xs={12} sm={9}>
                    <Typography variant="h4">Browse Files</Typography>
                </Grid>
                <Grid item xs={12} sm={9}>
                    <Paper component="form" className={classes.root} onSubmit={this.onSubmit}>
                        <IconButton className={classes.iconButton} aria-label="menu">
                            <MenuIcon />
                        </IconButton>
                        <InputBase placeholder="Search files" fullWidth={true} onChange={this.onChangeSearchBar} value={this.state.query} />
                        <IconButton type="submit" className={classes.iconButton} aria-label="search">
                            <SearchIcon />
                        </IconButton>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={9}>
                    <List> {/* this is the code that renders all the items in the page */}
                        {this.state.files.map(function(file,index) {
                            return <ListItem button divider key={index}>
                                        <ListItemText primary={file.filename} secondary={file.downloadURLs[0]}></ListItemText>
                                        <ListItemSecondaryAction>
                                            <IconButton edge="end" aria-label="download">
                                                <CloudDownloadIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                        })}
                    </List>
                </Grid>
            </Grid>
        )
    }
}

// export this module wrapped in withStyles 
// to apply styles
export default withStyles(styles)(FilesList);
