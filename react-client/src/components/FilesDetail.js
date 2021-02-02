import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { withStyles, Grid, Box, Chip, Accordion, AccordionSummary, AccordionDetails, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button} from '@material-ui/core';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import InfoIcon from '@material-ui/icons/Info';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';

const styles = theme => ({
    accordion: {
        width: '100%'
    },
    accordionHeading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0
    },
    accordionSubheading: {
        fontSize: theme.typography.pxToRem(15),
        color: '#696969'
    },
    chips: {
        '& > *': {
            margin: theme.spacing(0.5)
        }
    }
});

class FilesDetail extends Component {
    constructor(properties) {
        super(properties);

        this.onClickDownload = this.onClickDownload.bind(this);

        this.state = {
            filename: '',
            description: '',
            tags: [''],
            filetype: '',
            downloadURLs: [''],
            fixedDownloadURLs: [''],
            verified: false,

            dialogOpen: false,
            currentLink: ''
        }
    }

    onClickDownload(index) {
        if (this.state.verified) {
            const newWindow = window.open(this.state.fixedDownloadURLs[index], '_blank', 'noopener,noreferrer')
            if (newWindow) newWindow.opener = null
        } else {
            this.setState({ currentLink: this.state.fixedDownloadURLs[index], dialogOpen: true });
        }
    }

    componentDidMount() {
        axios.get(process.env.REACT_APP_API_URL + '/files/details/' + this.props.match.params.id)
            .then(response => {
                let { filename, description, tags, filetype, downloadURLs, verified } = response.data; 
                let fixedDownloadURLs = downloadURLs.map((url,index) => { 
                    return `${process.env.REACT_APP_API_URL}/files/download/${this.props.match.params.id}/${index}`;
                });
//                console.log(fixedURLs);
                this.setState({ 
                    filename, 
                    filetype,
                    downloadURLs,
                    fixedDownloadURLs,
                    verified,
                    description: description ? description : '',
                    tags: tags ? tags : ['']
                });
            })
            .catch(error => {
                // show file does not exist
            });
    }

    render() {
        const { classes } = this.props;
        return (
            <Grid container justify="center" spacing={2}>
                <Grid item xs={12} sm={9}>
                    <Typography variant="h5" noWrap>
                        {this.state.filename}
                    </Typography>
                </Grid>
                <Grid container direction="row" alignItems="center" item xs={12} sm={9}>
                    <Box mr={1}><InfoIcon fontSize="small"/></Box><Box fontSize="h6.fontSize">File Details</Box>
                </Grid>
                <Grid item xs={12} sm={9}>
                    <Box className={classes.accordion}>
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                    <Typography className={classes.accordionHeading}>Title</Typography>
                                    <Typography className={classes.accordionSubheading}>Not necessarily name when downloaded.</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                        { this.state.filename } 
                                </AccordionDetails>
                            </Accordion>
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                    <Typography className={classes.accordionHeading}>Verification</Typography>
                                    <Typography className={classes.accordionSubheading}>{this.state.verified ? 'The file is verified.' : 'The file is not verified.'}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box>
                                        { this.state.verified ? 'This file is safe to download.' : 'This file may not be safe to download.' } 
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
 
                            <Accordion expanded={true}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                    <Typography className={classes.accordionHeading}>Description</Typography>
                                    <Typography className={classes.accordionSubheading}>A quick overview of the contents of the file.</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box>
                                        { this.state.description }
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                            <Accordion expanded={true}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                    <Typography className={classes.accordionHeading}>Tags</Typography>
                                    <Typography className={classes.accordionSubheading}>
                                        This file belongs to these categories.
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box className={classes.chips}>
                                        {this.state.tags.filter(tag => tag.length > 0).map((tag, index) => {
                                            return (
                                                <Chip
                                                    key={index}
                                                    color="primary"
                                                    variant="outlined"
                                                    label={tag}
                                                    clickable
                                                    component={Link}
                                                    to={"/list?search=" + tag}
                                                />
                                            )
                                        })}
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={9}>
                    <Box mt={5}>
                        <Grid container direction="row" alignItems="center">
                            <Box mr={1}><InfoIcon fontSize="small"/></Box>
                            <Box fontSize="h6.fontSize">Download Links</Box>
                        </Grid>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={9}>
                    <List>
                        {this.state.downloadURLs.map((url, index) => {
                            return(
                                <ListItem key={index} divider button onClick={() => this.onClickDownload(index)}>
                                    <ListItemText>
                                        <Typography noWrap>{url}</Typography>
                                    </ListItemText>
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" aria-label="download" onClick={() => this.onClickDownload(index)}>
                                            <CloudDownloadIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            )
                        })}
                    </List>

                    <Dialog open={this.state.dialogOpen} onClose={() => this.setState({ dialogOpen: false })}>
                        <DialogTitle>Be careful!</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                You are opening a link to an unverified file. The file may contain
                                sensitive or improper content. Please proceed with caution.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => { this.setState({ dialogOpen: false }) }} color="primary">
                                Cancel
                            </Button>
                            <Button component="a" href={this.state.currentLink} target={'_blank'} color="primary">
                                Proceed
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Grid>
            </Grid>
        )
    }
}

export default withStyles(styles)(FilesDetail);
