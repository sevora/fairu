/*
 * Files Upload is the page where a file is uploaded
 * authentication with Twitter, Facebook, Google, and CAPTCHA
 * must be implemented. The file result is sent as an unverified data 
 * source and is put in the priority list of the administrator boards.
 */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin, GoogleLogout } from 'react-google-login';

import { Alert } from '@material-ui/lab'
import { Snackbar, Checkbox, Typography, Grid, TextField, FormControl, FormControlLabel, InputLabel, Select, MenuItem, Button, Hidden } from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

/*
const authorizationHeaders = () => {
    const userData = JSON.parse(localStorage.getItem('userData'))

    if (userData && userData.token) {
        return { Authorization: 'Bearer ' + userData.token };
    } 
    return {};
}*/

/* 
 * Class Component 
 * because there are several things
 * to keep track of here.
 */
 class FilesUpload extends Component {
    constructor(props) {
        super(props);

        // Binding is essential for this to be defined on the right context
        this.onChangeFilename = this.onChangeFilename.bind(this);
        this.onChangeDescription = this.onChangeDescription.bind(this);
        this.onChangeTags = this.onChangeTags.bind(this);
        this.onChangeFiletype = this.onChangeFiletype.bind(this);
        this.onChangeDownloadURLs = this.onChangeDownloadURLs.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onSuccessGoogle = this.onSuccessGoogle.bind(this);
        this.onFailureGoogle = this.onFailureGoogle.bind(this);
        this.onLogoutGoogle = this.onLogoutGoogle.bind(this);

        // Most of these properties are 
        // the form values.
        this.state = {
            filename: '',
            description: '',
            tags: '',
            filetype: '',
            downloadURLs: [''],

            email: '',
            username: '',
            token: '',

            currentID: '',
            uploadedBy: '',
            verifiedBy: '',
            isVerified: false,

            isSuccess: false,
            isError: false,

            successMessage: '',
            errorMessage: '',

            formDisabled: false,

            // Regular Expression for URL validation
            URLAddressRegEx: /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)?/gi
        }
    }

    // Triggers when filename field is changed. Nothing special.
    onChangeFilename(event) { this.setState({ filename: event.target.value });  }

    // Triggers when description field is changed.
    onChangeDescription(event) { this.setState({ description: event.target.value }); }

    // Triggers when tags field is changed.
    onChangeTags(event) { this.setState({ tags: event.target.value }); }

    // Triggers when filetype field is changed.
    onChangeFiletype(event) { this.setState({ filetype: event.target.value }); }

    // Triggers when download urls are changed.
    // This renders several textfields dynamically 
    // to support multiple URLs (for backups)
    onChangeDownloadURLs(event) {
        let downloadURLs = this.state.downloadURLs.slice(0);
        let index = parseInt(event.target.id.replace('downloadURL-', ''));
        
        downloadURLs[index] = event.target.value;
        // This block properly adds empty strings as needed. Conditions are as follows:
        // 1st: Current URL must not be empty
        // 2nd: The URL string next to the current must not be defined yet
        // 3rd: The URLs total count does not exceed 10
        if (downloadURLs[index].length > 0 && typeof downloadURLs[index + 1] == 'undefined' && downloadURLs.length <= 10) {
            downloadURLs.push('');
        } else if (downloadURLs[index].length === 0 && index > 0) {
            // This part auto removes empty fields except for the first url field
            downloadURLs.splice(index, 1);
        } 

        this.setState({ downloadURLs });
    }

    // triggers when submitting form
    onSubmit(event) {

        // prevents traditional form handling
        event.preventDefault();

        // url validation as this is not handled normally by 
        // required, maxlength, and other attributes
        let allURLsValid = this.state.downloadURLs.slice(0).filter(url => url.length > 0).every(url => {
            return RegExp(this.state.URLAddressRegEx.source, this.state.URLAddressRegEx.flags).test(url) 
        });

        if (!allURLsValid) {
            this.setState({ isError: true, errorMessage: 'File URLs do not look like valid URLs!' })
            return;
        } 

        // These are all required fields, and are enforced automatically
        // by using the required attribute. 
        const file = {
            filename: this.state.filename.trim(),
            filetype: this.state.filetype,
            downloadURLs: this.state.downloadURLs.filter(url => url.length > 0),
            verified: this.state.isVerified
        }

        // These fields are optional
        if (this.state.description) file.description = this.state.description;
        if (this.state.tags.length > 0) {
            // Long story short, tags field is just plain text
            // so this turns the tags into an array and removes empty
            // values as well as whitespaces.
            file.tags = this.state.tags
                .slice(0)
                .split(',')
                .map(values => values.replace(/\s/g, ''))
                .filter(tags => tags.length > 0);
        }
        
        // this is the part where the file is uploaded
        let headers = this.state.token.length > 1 ? { Authorization: 'Bearer ' + this.state.token } : {};
        if (this.state.currentID.length === 0) {
            axios.post(process.env.REACT_APP_API_URL + '/files/add', file, { headers })
                .then(response => {
                    // a dialog must be implemented for either successful or unsuccessful
                    // form submission
                    this.setState({ 
                        isSuccess: true, 
                        successMessage: 'Your file has been successfully sent to the admins for verification! Wait for a few seconds before submitting again.', 
                        formDisabled: true,
                        filename: '', 
                        description: '', 
                        tags: '', 
                        filetype: '', 
                        downloadURLs:[''] 
                    }, () => {
                        setTimeout(() => {
                            this.setState({ formDisabled: false });
                        }, 6000);
                    });

                })
                .catch(error =>{
                    let message = error.response.data.toString();
                    let capitalized = message.charAt(0).toUpperCase() + message.slice(1)
                    this.setState({ isError: true, errorMessage: capitalized, formDisabled: true }, () => {
                        setTimeout(() => {
                            this.setState({ formDisabled: false });
                        }, 1000);
                    });
                });
        } else {
            axios.post(process.env.REACT_APP_API_URL + '/files/update/' + this.state.currentID, file, { headers })
                .then(response => {
                    this.setState({ 
                        isSuccess: true, 
                        successMessage: 'Changes to the file have been saved.' 
                    }, () => {
                        setTimeout(() => {
                            this.props.history.go(0)
                        }, 2000);
                    });

                })
                .catch(error => {
                    const message = error.response.data ? error.response.data : error;
                    this.setState({ isError: true, errorMessage: message });
                });
        }
    }

    onSuccessGoogle(response) { 
        axios.post(process.env.REACT_APP_API_URL + '/auth/google', { tokenId: response.tokenId })
            .then(response => {
                let { username, email } = response.data.data;
                let { token } = response.data;
                localStorage.setItem('userData', JSON.stringify({ username, email, token }));
                this.setState({ username, email, token });
            });
    }

    onFailureGoogle() {
        this.setState({ isError: true, errorMessage: 'Google authorization attempt failed.'});
    }

    onLogoutGoogle() {
        this.setState({ 
            username: '',
            email: '',
            token: '',
            isSuccess: true, 
            successMessage: `Logged out of ${this.state.email}`
        }, () => {
            localStorage.clear();
        });
    }

    componentDidMount() {
        if (localStorage.getItem('userData') !== null) {
            let userData = JSON.parse(localStorage.getItem('userData'));
            this.setState({ username: userData.username, email: userData.email, token: userData.token }, () => {
                if (this.props.match.params.id) {
                    let id = this.props.match.params.id;
                    let headers = this.state.token.length > 1 ? { Authorization: 'Bearer ' + this.state.token } : {}; 
                    axios.get(process.env.REACT_APP_API_URL + '/contributors/role', { headers })
                        .then(response => {
                            if (response.data.isAdmin) {
                                this.setState({ currentID: id }, () => {
                                    axios.get(process.env.REACT_APP_API_URL + '/files/details/' + this.state.currentID, { headers})
                                        .then(response => {
                                            const { filename, description, filetype, tags, downloadURLs, verified, uploaderEmail, verifierEmail } = response.data;
                                            this.setState({ 
                                                filename, 
                                                description,
                                                tags: tags.join(', '),
                                                filetype, 
                                                downloadURLs, 
                                                isVerified: verified,
                                                uploadedBy: uploaderEmail,
                                                verifiedBy: verifierEmail ? verifierEmail : ''
                                            });
                                        })
                                        .catch(error => {
                                            this.setState({ isError: true, errorMessage: 'Could not load file for editing.' });
                                        });
                                });
                            } else {
                                this.props.history.push({ pathname: '/list/details/' + id })
                            }
                        })
                        .catch(error => {
                                this.props.history.push({ pathname: '/list/details/' + id })
                        });
                }

            });
        } else if (this.props.match.params.id) {
            this.props.history.push({ pathname: '/list/details/' + this.props.match.params.id })
        }

    }

    // The messy looking render function mixed with HTML-like
    // syntax called JSX. This just looks scary.
    render() {
        return(
            <form autoComplete="off" onSubmit={this.onSubmit}>
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
                <Grid container spacing={3} justify="center">
                    <Grid item xs={12} sm={9}>
                        <Typography variant="h5">
                            { this.state.currentID.length > 0 ? 'Uploaded by ' + this.state.uploadedBy : 'Become a Contributor' }
                        </Typography>
                        <Typography variant="h6" color="primary">
                            {(function(){
                                if (this.state.currentID.length > 0) {
                                    if (this.state.verifiedBy.length > 0) {
                                        return 'Last verified by ' + this.state.verifiedBy
                                    }
                                    return 'No verification'
                                }
                                return ''
                            }.bind(this))()}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={9}>
                        <TextField 
                            disabled={this.state.formDisabled}
                            value={this.state.filename}
                            required 
                            variant="outlined" 
                            fullWidth 
                            onChange={this.onChangeFilename} 
                            label="Filename" 
                            placeholder="e.g. Grade 7 General-Science Quarter 1" 
                            InputLabelProps={{shrink:true}} 
                            inputProps={{maxLength: 256}}
                        >
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={9}>
                        <TextField 
                            value={this.state.description}
                            disabled={this.state.formDisabled}
                            multiline 
                            variant="outlined" 
                            fullWidth 
                            onChange={this.onChangeDescription} 
                            label="Description" 
                            placeholder="Type in a general overview of the contents..." 
                            InputLabelProps={{shrink:true}} 
                            inputProps={{maxLength: 400}}
                        >
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            value={this.state.tags}
                            disabled={this.state.formDisabled}
                            multiline 
                            variant="outlined" 
                            fullWidth 
                            onChange={this.onChangeTags} 
                            label="Tags" 
                            placeholder="Comma-separated tags e.g. science, heat, energy" 
                            InputLabelProps={{shrink:true}} 
                            inputProps={{maxLength: 256}}
                        >
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl variant="outlined" required fullWidth disabled={this.state.formDisabled}>
                            <InputLabel id="select-filetype-label">Filetype</InputLabel>
                            <Select
                                onChange={this.onChangeFiletype} 
                                labelId="select-filetype-label" 
                                label="Filetype" 
                                value={this.state.filetype}
                            >
                                <MenuItem value="doc">.doc</MenuItem>
                                <MenuItem value="pdf">.pdf</MenuItem>
                                <MenuItem value="pptx">.pptx</MenuItem>
                                <MenuItem value="xlsx">.xlsx</MenuItem>
                                <MenuItem value="odf">.odf</MenuItem>
                                <MenuItem value="epub">.epub</MenuItem>
                                <MenuItem value="zip">.zip</MenuItem>
                                <MenuItem value="others">Others</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={9}>
                        <Typography variant="h6">
                            Add File URLs
                        </Typography>
                    </Grid>
                    {this.state.downloadURLs.map((value, index) => {
                        return <Grid item xs={12} sm={9} key={index}>
                                    <TextField 
                                        variant="outlined"
                                        disabled={this.state.formDisabled}
                                        required={index === 0}
                                        fullWidth 
                                        error={ !RegExp(this.state.URLAddressRegEx.source, this.state.URLAddressRegEx.flags).test(this.state.downloadURLs[index]) && this.state.downloadURLs[index].length > 0} 
                                        helperText={ (!RegExp(this.state.URLAddressRegEx.source, this.state.URLAddressRegEx.flags).test(this.state.downloadURLs[index]) && this.state.downloadURLs[index].length > 0) ? 'Invalid URL!' : ' '}
                                        onChange={this.onChangeDownloadURLs} 
                                        value={this.state.downloadURLs[index]} 
                                        label={index > 0 ? "Backup URL " + index : "Main URL"}  
                                        placeholder={"https://example.com/backup/" + index} 
                                        InputLabelProps={{shrink:true}} 
                                        inputProps={{maxLength: 1000, id: 'downloadURL-'+index, spellCheck: false }}>
                                    </TextField>
                               </Grid>
                    })}
                    <Hidden xsUp={this.state.currentID.length === 0}>
                        <Grid item xs={12} sm={9}>
                            <Typography variant="h6">Is the file verified?</Typography>
                            <FormControlLabel
                                style={{marginLeft: '0px'}}
                                labelPlacement="start"
                                label="The file is safe and reliable for academic purposes."
                                control={<Checkbox 
                                    color="primary" 
                                    checked={this.state.isVerified} 
                                    name="Verified" onChange={() => { this.setState({isVerified: !this.state.isVerified})}} 
                                />}
                            />
                        </Grid>
                    </Hidden>
                    <Grid container justify="flex-end" item xs={12} sm={9}>
                        <Hidden xsUp={this.state.username.length > 0}>
                            <GoogleLogin
                                clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                                buttonText={ this.state.username.length > 0 ? `LOGGED IN AS ${this.state.username.toUpperCase()}` : "LOGIN WITH GOOGLE" }
                                onSuccess={this.onSuccessGoogle}
                                onFailure={this.onFailureGoogle}
                                cookiePolicy={'single_host_origin'}
                                style={{width: '100%'}}
                            />
                        </Hidden>
                        <Hidden xsUp={this.state.username.length <= 0}>
                            <GoogleLogout
                                clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                                buttonText={`LOGOUT OF ${this.state.email.toUpperCase()}`}
                                onLogoutSuccess={this.onLogoutGoogle}
                            />
                        </Hidden>
                    </Grid>
                        <Grid container justify="flex-end" item xs={12} sm={9}>
                        <Button 
                            disabled={this.state.formDisabled}
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            size="medium"
                            fullWidth
                            startIcon={<CloudUploadIcon />}
                        >
                            { this.state.currentID.length > 0 ? 'Save Changes' : 'Upload to Fairu' }
                        </Button>
                    </Grid>
                </Grid> 
            </form>
        )
    }
}

export default withRouter(FilesUpload);
