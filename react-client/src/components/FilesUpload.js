/*
 * Files Upload is the page where a file is uploaded
 * authentication with Twitter, Facebook, Google, and CAPTCHA
 * must be implemented. The file result is sent as an unverified data 
 * source and is put in the priority list of the administrator boards.
 */
import React, { Component } from 'react';
import axios from 'axios';

import { Typography, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Button } from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

/* 
 * Class Component 
 * because there are several things
 * to keep track of here.
 */
export default class FilesUpload extends Component {
    constructor(props) {
        super(props);

        // Binding is essential for this to be defined on the right context
        this.onChangeFilename = this.onChangeFilename.bind(this);
        this.onChangeDescription = this.onChangeDescription.bind(this);
        this.onChangeTags = this.onChangeTags.bind(this);
        this.onChangeFiletype = this.onChangeFiletype.bind(this);
        this.onChangeDownloadURLs = this.onChangeDownloadURLs.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        // Most of these properties are 
        // the form values.
        this.state = {
            filename: '',
            description: '',
            tags: '',
            filetype: '',
            downloadURLs: [''],

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

        // These are all required fields, and are enforced automatically
        // by using the required attribute. 
        const file = {
            filename: this.state.filename,
            filetype: this.state.filetype,
            downloadURLs: this.state.downloadURLs.filter(url => url.length > 0)
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
        axios.post('http://localhost:8000/files/add', file)
            .then(function(response) {
                // a dialog must be implemented for either successful or unsuccessful
                // form submission
                console.log(response.data);
            })
            .catch(function(error){
                console.log(error)
            });
    }

    // The messy looking render function mixed with HTML-like
    // syntax called JSX. This just looks scary.
    render() {
        return(
            <form autoComplete="off" onSubmit={this.onSubmit}>
                <Grid container spacing={3} justify="center">
                    <Grid item xs={12} sm={9}>
                        <Typography variant="h5">
                            Become a Contributor
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={9}>
                        <TextField 
                            required 
                            variant="outlined" 
                            fullWidth 
                            onChange={this.onChangeFilename} 
                            label="Filename" 
                            placeholder="e.g. Grade 7 General-Science Quarter 1" 
                            InputLabelProps={{shrink:true}} 
                            inputProps={{maxLength: 100}}
                        >
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={9}>
                        <TextField 
                            multiline 
                            variant="outlined" 
                            fullWidth 
                            onChange={this.onChangeDescription} 
                            label="Description" 
                            placeholder="Type in a general overview of the contents..." 
                            InputLabelProps={{shrink:true}} 
                            inputProps={{maxLength: 280}}
                        >
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            multiline 
                            variant="outlined" 
                            fullWidth 
                            onChange={this.onChangeTags} 
                            label="Tags" 
                            placeholder="Comma-separated tags e.g. science, heat, energy" 
                            InputLabelProps={{shrink:true}} 
                            inputProps={{maxLength: 200}}
                        >
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl variant="outlined" required fullWidth>
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
                                <MenuItem value="epub">.zip</MenuItem>
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
                                        required={index == 0}
                                        fullWidth 
                                        error={ !RegExp(this.state.URLAddressRegEx.source, this.state.URLAddressRegEx.flags).test(this.state.downloadURLs[index]) && this.state.downloadURLs[index].length > 0} 
                                        onChange={this.onChangeDownloadURLs} 
                                        value={this.state.downloadURLs[index]} 
                                        label={index > 0 ? "Backup URL " + index : "Main URL"}  
                                        placeholder={"https://example.com/backup/" + index} 
                                        InputLabelProps={{shrink:true}} 
                                        inputProps={{maxLength: 1000, id: 'downloadURL-'+index, spellCheck: false }}>
                                    </TextField>
                               </Grid>
                    })}
                    <Grid container justify="flex-end" item xs={12} sm={9}>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            startIcon={<CloudUploadIcon />}
                        >
                            Upload
                        </Button>
                    </Grid>
                </Grid> 
            </form>
        )
    }
}
