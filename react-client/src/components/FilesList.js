/*
 * This is what most of the users will
 * be interested on using. Files List 
 * renders all the files and allows for navigation
 * in order to download the files they want.
 */
import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import queryString from 'query-string';
import axios from 'axios';

import { Helmet, HelmetProvider } from 'react-helmet-async';

// material-ui components
import { withStyles } from '@material-ui/core';
import { Box, Grid, Typography, Paper, InputBase, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Fade, Switch } from '@material-ui/core';
import { Pagination } from '@material-ui/lab';

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
        this.searchFiles = this.searchFiles.bind(this);
        this.onChangeSearchBar = this.onChangeSearchBar.bind(this);
        this.onSubmit = this.onSubmit.bind(this)
        this.onChangePage = this.onChangePage.bind(this);
        this.onToggleSearchOptions = this.onToggleSearchOptions.bind(this);
        this.onToggleShowUnverified = this.onToggleShowUnverified.bind(this);

        // files is an array containing all the results
        // query is the query on the search bar and url
        this.state = {
            files: [],
            query: '',
            pageIndex: 0,
            pageCount: 1,
            showSearchOptions: false,
            showUnverified: false
        }
    }

    searchFiles() {
        if (this.state.query && this.state.query.length > 0) { 
            // GET request using a query string
            // query strings are ?name=Foo&age=16 in https://backend.com/?name=Foo&age=16
            // to be exact, we are making a request to the backend as follows:
            // GET https://backend.com/files/search?query=findme
            // where findme is the word being searched
            axios.get(process.env.REACT_APP_API_URL + '/files/search', { params: { query: this.state.query, page: this.state.pageIndex, unverified: this.state.showUnverified } })
                .then(response => {
                    let files = response.data;

                    // this changes URL without rerendering
                    // this.props.history.replace({ pathname: `/list/search/${this.state.query.trim()}`})
                    // but in frontend, 
                    // we set our URL as https://frontend.com/list?search=findme
                    axios.get(process.env.REACT_APP_API_URL + '/files/search/pagecount',  { params: { query: this.state.query, unverified: this.state.showUnverified } })
                        .then(response => {
                            let pageCount = response.data;

                            this.setState({ files,  pageCount }, ()=> {
                                this.props.history.replace({ 
                                    pathname: '/list', 
                                    search: `?search=${this.state.query.trim()}&page=${this.state.pageIndex + 1}`
                                });
                            });

                        });

                });
        } else {
         
            // GET request to the '/files' route of the API
            // this route is set to load the default files, and
            // number of pages and at what page we are
            axios.get(process.env.REACT_APP_API_URL + '/files', { params: { page: this.state.pageIndex, unverified: this.state.showUnverified } })
                .then(response => {
                    let files = response.data;
                    axios.get(process.env.REACT_APP_API_URL + '/files/pagecount/', { params: { unverified: this.state.showUnverified } })
                        .then(response => {

                            let pageCount = response.data;
                            this.setState({ files, pageCount  })
                            this.props.history.replace({ pathname: `/list`, search: `?page=${this.state.pageIndex + 1}` })
                        });
                });
        }
    }

    // triggers when search bar input value is changed
    onChangeSearchBar(event) { this.setState({ query: event.target.value }); }

    onChangePage(event, value) {
        if (value - 1 !== this.state.pageIndex) {
            this.setState({ pageIndex: value - 1 }, () => {
                this.searchFiles();
            });
        }
    }

    // triggers when search bar submit is triggered
    onSubmit(event) {
        // prevent traditional form handling
        event.preventDefault();
        let query = this.state.query.trim();

        if (query.length > 0) {
            this.setState({ pageIndex: 0, query }, () => {
                this.searchFiles();
            })
        } else {
            this.setState({ pageIndex: 0 }, () => {
                this.searchFiles();
            })
        }
        // GET request using a query string
        // query strings are ?name=Foo&age=16 in https://bar.com/?name=Foo&age=16
        // ternary operation: if the query has more than one character, search files with
        // that query, else just search with no query (returns default files)
        // query.length > 0 ? this.searchFiles(query) : this.searchFiles()
    }

    onToggleSearchOptions() {
        this.setState({ showSearchOptions: !this.state.showSearchOptions });
    }

    onToggleShowUnverified() {
        this.setState({ showUnverified: !this.state.showUnverified, pageIndex: 0 }, () => {
            this.searchFiles();
        });
    }

    // this triggers when this component loads or mounts is what they call it
    componentDidMount() {
        // this is to support URL sharing with querystrings
        // this.state.query should contain the current query
        const parameters = queryString.parse(this.props.location.search);
        
        let pageIndex = 0;
        if (parameters.page) {
            if (!isNaN(parseInt(parameters.page))) pageIndex = parseInt(parameters.page) - 1;
        }

        // this is parameters.search not parameters.query as the query string set uses
        // this format https://frontend.com/list?search=value
        if (parameters.search) {
            // setState does not trigger synchronously, thus a callback is essential
            
            this.setState({ query: parameters.search, pageIndex }, () => {
                this.searchFiles();
            });
        } else {
            // if the URL is only at /list
            // essentially get a list of the files 
            // then update the files in the state
            this.setState({ pageIndex }, () => {
                this.searchFiles();
            })
        }
    }

    // the daunting function, mixed with JSX and logic
    render() {
        // this is possible due to withStyles
        const { classes } = this.props;

        // massive
        return (
            <HelmetProvider>
                <Helmet>
                    <title>Fairu: Search and Download Academic Resources Hassle-Free</title>
                    <meta name="description" content="Find the academic resource you need, ranging from all grade levels and subjects, free of charge and no registration required."/>
                    <meta name="keywords" content="fairu,search,find,list,subjects,verified,unverified,school,resources,download,free,no,registration,math,english,science" />
                    <meta name="og:description" content="Find the academic resource you need, ranging from all grade levels and subjects, free of charge and no registration required."/>
                    <meta name="twitter:description" content="Find the academic resource you need, ranging from all grade levels and subjects, free of charge and no registration required." />
                </Helmet>

                <Grid container spacing={3} justify="center">
                    <Grid item xs={12} sm={9}>
                        <Typography variant="h4">Browse Files</Typography>
                    </Grid>
                    <Grid item xs={12} sm={9}>
                        <Paper component="form" className={classes.root} onSubmit={this.onSubmit}>
                            <IconButton className={classes.iconButton} aria-label="menu" onClick={this.onToggleSearchOptions}>
                                <MenuIcon />
                            </IconButton>
                            <InputBase placeholder="Search files" fullWidth={true} onChange={this.onChangeSearchBar} value={this.state.query} />
                            <IconButton type="submit" className={classes.iconButton} aria-label="search">
                                <SearchIcon />
                            </IconButton>
                        </Paper>
                    </Grid>
                    <Fade in={this.state.showSearchOptions} style={{display: this.state.showSearchOptions ? 'block' : 'none'}}>
                        <Grid item xs={12} sm={9}>
                            <Paper className={classes.root}>
                                <Box p={1}>
                                    <Switch color="primary" checked={this.state.showUnverified} onChange={this.onToggleShowUnverified} name="Show Unverified"/> Show Unverified Files
                                </Box>
                            </Paper>
                        </Grid>
                    </Fade>
                    <Fade in={this.state.files.length === 0} style={{display: this.state.files.length === 0 ? 'block' : 'none'}}>
                        <Grid item xs={12} sm={9}>
                            <Typography align="center" color="primary" noWrap>No Results Found!</Typography>
                        </Grid>
                    </Fade>
                    <Grid item xs={12} sm={9}>
                        <List> {/* this is the code that renders all the items in the page */}
                            {this.state.files.map(function(file,index) {
                                return (
                                <ListItem button divider key={index} component={Link} to={'/list/details/' + file._id}>
                                    <ListItemText style={{whiteSpace: "nowrap", overflow: 'hidden', textOverflow: 'ellipsis'}} primary={file.filename} secondary={file.downloadURLs[0]}></ListItemText>
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" aria-label="download">
                                            <CloudDownloadIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                )
                            })}
                        </List>
                    </Grid>
                    <Grid container justify="center" item xs={12} sm={9}>
                        <Pagination count={this.state.pageCount} page={this.state.pageIndex + 1} onChange={this.onChangePage} variant="outlined" shape="rounded" color="primary"/>
                    </Grid>
                </Grid>
            </HelmetProvider>
        )
    }
}

// export this module wrapped in withStyles 
// to apply styles
export default withStyles(styles)(withRouter(FilesList));
