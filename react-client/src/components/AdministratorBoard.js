import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import axios from 'axios';

import { Grid, Typography, Snackbar, Box } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import MuiDataGrid from './GridWrapper.js';

class AdministratorBoard extends Component {

    constructor(properties) {
        super(properties);

        this.getContributors = this.getContributors.bind(this);
        this.onContributorsPageChange = this.onContributorsPageChange.bind(this);

        this.state = {
            username: '',
            email: '',
            token: '',
            contributorsColumns: [
                { field: 'id', headerName: 'Index', flex: 1, hide: true },
                { field: 'username', headerName: 'Username', flex: 1 },
                { field: 'email', headerName: 'Email', flex: 1 },
                { field: 'role', headerName: 'Role', flex: 1 },
                { 
                    field: 'isBanned', 
                    headerName: 'Upload Permission', 
                    flex: 1,
                    renderCell: (params) => {
                        return (<a href="/#" className={'nochangelink'} onClick={(event) => {
                            event.preventDefault();
                            let rows = [...this.state.contributorsRows];
                            let row = {...this.state.contributorsRows[params.getValue('id')]}
                            // row.isBanned = !row.isBanned;
                            let headers = this.state.token.length > 1 ? { Authorization: 'Bearer ' + this.state.token } : {};
                            axios.post(process.env.REACT_APP_API_URL + '/contributors/ban/' + row._id, {}, { headers })
                                .then(response => {
                                    row.isBanned = response.data;
                                    rows[params.getValue('id')] = row;
                                    this.setState({ 
                                        contributorsRows: rows, 
                                        isSuccess: true, 
                                        successMessage: 'Successful ' + (row.isBanned ? 'ban' : 'unban') + '.' 
                                    });
                                    // should show pop up thing
                                })
                                .catch(error => {
                                    // should show popup thing
                                    this.setState({ isError: true, errorMessage: error.response.data });
                                  
                                });
                        }}>{params.value ? 'Banned' : 'Active'}</a>)
                    }
                }
            ],
            contributorsRows: [],
            contributorsRowsCount: 0,
            contributorsPageIndex: 0,

            filesColumns: [
                { field: '_id', headerName: '_id', hide: true },
                { field: 'id', headerName: 'Index', hide: true },
                { field: 'filename', headerName: 'Filename', flex: 1},
                { field: 'filetype', headerName: 'File Extension', flex: 1},
                { field: 'verified', headerName: 'Verification', flex: 1},
                { 
                    field: 'edit', 
                    headerName: 'Edit Link', 
                    flex: 1, 
                    renderCell: (params) => {
                        return(<Link className={'nochangelink'} to={'/list/edit/' + params.getValue('_id')}>Edit File</Link>)
                    }
                }
            ],
            filesRows: [],
            filesRowsCount: 0,
            filesPageIndex: 0,

            isError: false,
            isSuccess: false,

            errorMessage: '',
            successMessage: ''
        }
    }

    getContributors() {
        let headers = this.state.token.length > 1 ? { Authorization: 'Bearer ' + this.state.token } : {};
        axios.get(process.env.REACT_APP_API_URL + '/contributors/count', { headers })
            .then(response => {
                let rowsCount = response.data;
                axios.get(process.env.REACT_APP_API_URL + '/contributors/', { headers, params: { page: this.state.contributorsPageIndex } })
                    .then(response => {
                        let rows = response.data.map((data, index) => {
                            data.id = index;
                            data.role = 'Contributor';
                            if (data.isAdmin) data.role = 'Administrator';
                            if (data.isSuperUser) data.role = 'Super User';
                            return data;
                        });
                        this.setState({ contributorsRows: rows, contributorsRowsCount: rowsCount });
                    })
                    .catch(error => {
                        this.props.history.push({ pathname: '/' });
                    });
            })
    }

    onContributorsPageChange(params) {
        this.setState({ contributorsPageIndex: params.page - 1 }, () => {
            this.getContributors();
        });
    }

    getFiles() {
        axios.get(process.env.REACT_APP_API_URL + '/files', { params: { unverified: true } })
            .then(response => {
                let rows = response.data.map((data, index) => {
                    data.id = index;
                    data.filetype = '.' + data.filetype;
                    data.verified = data.verified ? 'Verified' : 'Not Verified';
                    data.edit = 'Edit file';
                    return data;
                });
                this.setState({ filesRows: rows });
            })
    }

    componentDidMount() {
        if (localStorage.getItem('userData') !== null) {
            let userData = JSON.parse(localStorage.getItem('userData'));

            this.setState({ username: userData.username, email: userData.email, token: userData.token }, () => {    
                this.getContributors();
                this.getFiles();
            });
        } else {
            this.props.history.push({ pathname: '/' });
        }
    }

    render() {
        return (
            <div>
                <Snackbar open={this.state.isError} onClose={() => this.setState({isError: false})} autoHideDuration={6000}>
                       <Alert severity="error">
                           { this.state.errorMessage }
                       </Alert>
                </Snackbar>
                <Snackbar open={this.state.isSuccess} onClose={() => this.setState({isSuccess: false})} autoHideDuration={12000}>
                       <Alert severity="success">
                           { this.state.successMessage }
                       </Alert>
                </Snackbar>
                <Grid container justify="center">
                    <Grid item xs={12} sm={9}>
                        <Typography>
                            Logged in as {this.state.username} ({this.state.email})
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={9}>
                        <Typography variant="h5">
                            Contributors' Board
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={9}>
                        {/*
                        <DataGrid 
                            rows={this.state.contributorsRows} 
                            columns={this.state.contributorsColumns}
                            rowCount={this.state.contributorsRowsCount}
                            autoHeight={true} 
                            pagination 
                            paginationMode="server"
                            onPageChange={this.onContributorsPageChange}
                            rowsPerPageOptions={[100]}
                            pageSize={100} /* set this to the same amount as perPageCount server-side /> */}
                        <MuiDataGrid 
                            rows={this.state.contributorsRows} 
                            columns={this.state.contributorsColumns}
                            rowCount={this.state.contributorsRowsCount}
                            onPageChange={this.onContributorsPageChange}
                            rowsPerPageOptions={[50]}
                            pageSize={50} /* set this to the same amount as perPageCount server-side */
                        />
                    </Grid>
                    <Grid item xs={12} sm={9}>
                        <Box mt={2}>
                            <Typography variant="h5">Files' Board</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={9}>
                        <MuiDataGrid 
                            rows={this.state.filesRows} 
                            columns={this.state.filesColumns}
                            rowCount={this.state.filesRowsCount}
                            onPageChange={this.onFilesPageChange}
                            rowsPerPageOptions={[50]}
                            pageSize={50} /* set this to the same amount as perPageCount server-side */
                        />
                    </Grid>
                </Grid>
            </div>
        )
    }
}

export default withRouter(AdministratorBoard);
