import { Component } from 'react';
import { Typography, Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';

export default class FilesUpload extends Component {
    constructor(props) {
        super(props);

        this.onChangeFilename = this.onChangeFilename.bind(this);
        this.onChangeDescription = this.onChangeDescription.bind(this);
        this.onChangeTags = this.onChangeTags.bind(this);
        this.onChangeFiletype = this.onChangeFiletype.bind(this);
        this.onChangeDownloadURLs = this.onChangeDownloadURLs.bind(this);

        this.state = {
            filename: '',
            description: '',
            tags: [],
            filetype: 'others',
            downloadURLs: ['','',''],
            uploaderID: ''
        }
    }

    onChangeFilename(event) {
        this.setState({
            filename: event.target.value
        });
    }

    onChangeDescription(event) {
        this.setState({
            description: event.target.value
        });
    }

    onChangeTags(event) {
        this.setState({
            tags: event.target.value
        });
    }

    onChangeFiletype(event) {
        console.log(event.target.value);
        this.setState({
            filetype: event.target.value
        });
    }

    onChangeDownloadURLs(event) {
        let downloadURLs = [...this.state.downloadURLs];
        downloadURLs[parseInt(event.target.id.replace('downloadURL-', ''))] = event.target.value
        this.setState({ downloadURLs });
    }

    onSubmit(event) {
        event.preventDefault();
        const file = {
            filename: this.state.filename,
            description: this.state.description,
            tags: this.state.tags.split(',').map(values => values.replace(/\s/g, '')),
            filetype: this.state.filetype,
            downloadURLs: this.state.downloadURLs,
            uploaderID: '0000000'
        }
    }

    componentDidMount() {
        /*this.setState({
           
        });*/
    }

    render() {
        return(
            <div>
                <Typography variant="h5">
                    Become a Contributor
                </Typography>
                <br/>
                <form autoComplete="off">
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <TextField required variant="outlined" fullWidth onChange={this.onChangeFilename} label="Filename" placeholder="e.g. Grade 7 General-Science Quarter 1" InputLabelProps={{shrink:true}} inputProps={{maxLength: 100}}></TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField multiline variant="outlined" fullWidth onChange={this.onChangeDescription} label="Description" placeholder="Type in a general overview of the contents..." InputLabelProps={{shrink:true}} inputProps={{maxLength: 280}}></TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField multiline variant="outlined" fullWidth onChange={this.onChangeTags} label="Tags" placeholder="Comma-separated tags e.g. science, heat, energy" InputLabelProps={{shrink:true}} inputProps={{maxLength: 200}}></TextField>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <FormControl variant="outlined" required fullWidth>
                                <InputLabel id="select-filetype-label">Filetype</InputLabel>
                                <Select onChange={this.onChangeFiletype} labelId="select-filetype-label" label="Filetype" value=''>
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
                        <Grid item xs={12} sm={12}>
                            <Typography variant="h6">
                                Add File URLs
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={10}>
                            <TextField variant="outlined" required fullWidth onChange={this.onChangeDownloadURLs} value={this.state.downloadURLs[0]} label="Main URL" placeholder="https://example.com" InputLabelProps={{shrink:true}} inputProps={{maxLength: 1000, id: 'downloadURL-0'}}></TextField>
                        </Grid>
                        <Grid item xs={12} sm={10}>
                            <TextField variant="outlined" fullWidth onChange={this.onChangeDownloadURLs} value={this.state.downloadURLs[1]} label="Backup URL 1" placeholder="https://backup.com/first" InputLabelProps={{shrink:true}} inputProps={{maxLength: 1000, id: 'downloadURL-1'}}></TextField>
                        </Grid>
                        <Grid item xs={12} sm={10}>
                            <TextField variant="outlined" fullWidth onChange={this.onChangeDownloadURLs} value={this.state.downloadURLs[2]} label="Backup URL 2" placeholder="https://backup.com/second" InputLabelProps={{shrink:true}} inputProps={{maxLength: 1000, id: 'downloadURL-2'}}></TextField>
                        </Grid>
                    </Grid>
                </form>
            </div>
        )
    }
}
