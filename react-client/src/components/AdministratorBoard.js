import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import axios from 'axios';

import { Grid, Typography, Snackbar, Box, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import MuiDataGrid from './GridWrapper.js';

import DeleteIcon from '@material-ui/icons/Delete';

class AdministratorBoard extends Component {

    constructor(properties) {
        super(properties);

        this.getContributors = this.getContributors.bind(this);
        this.onContributorsPageChange = this.onContributorsPageChange.bind(this);
        this.getFiles = this.getFiles.bind(this);
        this.onFilesPageChange = this.onFilesPageChange.bind(this);
        this.onFilesSelection = this.onFilesSelection.bind(this);
        this.onDeleteSelectedFiles = this.onDeleteSelectedFiles.bind(this);

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
                },
                { field: 'downloads', headerName: 'Downloads', flex: 1 }
            ],
            filesRows: [],
            filesRowsCount: 0,
            filesPageIndex: 0,
            filesSelectedIndices: [],
            filesDeleteDialogOpen: false,

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
        axios.get(process.env.REACT_APP_API_URL + '/files/count', { params: { unverified: true } })
            .then(response => {
                let rowsCount = response.data;
                axios.get(process.env.REACT_APP_API_URL + '/files', { params: { unverified: true, page: this.state.filesPageIndex } })
                    .then(response => {
                        let rows = response.data.map((data, index) => {
                            data.id = index;
                            data.filetype = '.' + data.filetype;
                            data.verified = data.verified ? 'Verified' : 'Not Verified';
                            data.edit = 'Edit file';
                            data.downloads = data.downloads ? data.downloads : 0;
                            return data;
                        });
                        this.setState({ filesRows: rows, filesRowsCount: rowsCount });
                    });

            });
    }

    onFilesPageChange(params) {
        this.setState({ filesPageIndex: params.page - 1}, () => {
            this.getFiles();
        })
    }

    onFilesSelection(selection) {
        console.log(selection.rowIds)
        this.setState({ filesSelectedIndices: selection.rowIds });
    }

    onDeleteSelectedFiles() {
        let headers = this.state.token.length > 1 ? { Authorization: 'Bearer ' + this.state.token } : {};
        let ids = this.state.filesSelectedIndices.map((index) => {
            return this.state.filesRows[index]._id;
        });
        
        axios.delete(process.env.REACT_APP_API_URL + '/files/delete/', { headers, data: { ids } })
            .then(response => {
                console.log(response);
                this.setState({ filesDeleteDialogOpen: false, isSuccess: true, successMessage: 'Successfully deleted files.', filesSelectedIndices: [], filesRows: [], filesRowsCount: 0 }, () => {
                    this.getFiles();
                });
            })
            .catch(error => {
                let message = error.response ? error.response.data : error.toString();
                this.setState({ isError: true, errorMessage: message });
            });

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
                        <Box mb={2}>
                            <Typography variant="h5">
                                Logged in as {this.state.username} 
                            </Typography>
                            <Typography variant="h6" color="primary">
                                {this.state.email}
                            </Typography>
                        </Box>
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
                            rowsPerPageOptions={[20]}
                            pageSize={20} /* set this to the same amount as perPageCount server-side */
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
                            rowsPerPageOptions={[20]}
                            checkboxSelection={true}
                            onSelectionChange={this.onFilesSelection}
                            pageSize={20} /* set this to the same amount as perPageCount server-side */
                        />
                    </Grid>
                    <Grid item xs={12} sm={9}>
                        <Button 
                            fullWidth
                            type="submit" 
                            variant="contained" 
                            color="secondary"
                            size="medium"
                            onClick={() => { this.setState({ filesDeleteDialogOpen: true }) }}
                            disabled={this.state.filesSelectedIndices.length===0}
                            startIcon={<DeleteIcon />}
                        >Delete Selected</Button>
                    </Grid>
                </Grid>
                <Dialog open={this.state.filesDeleteDialogOpen} onClose={() => this.setState({ filesDeleteDialogOpen: false })}>
                    <DialogTitle>Warning!</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Attempting to delete {this.state.filesSelectedIndices.length} file{this.state.filesSelectedIndices.length > 1 ? 's' : ''}. This
                            action is irreversible and only special administrators are authorized to do so.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { this.setState({ filesDeleteDialogOpen: false }) }} color="default">
                            Cancel
                        </Button>
                        <Button onClick={this.onDeleteSelectedFiles} color="secondary">
                            Permanently Delete
                        </Button>
                    </DialogActions>
                </Dialog>

            </div>
        )
    }
}

export default withRouter(AdministratorBoard);
