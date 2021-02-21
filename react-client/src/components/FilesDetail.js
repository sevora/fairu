/*
 * FilesDetail Component
 * meant to present the information of a file.
 */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ReCAPTCHA from "react-google-recaptcha";

import { Alert } from '@material-ui/lab';
import { withStyles, Grid, Box, Chip, Snackbar, Accordion, AccordionSummary, AccordionDetails, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button} from '@material-ui/core';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import InfoIcon from '@material-ui/icons/Info';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';

// Custom styling/theming with Material-UI
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

/*
 * FilesDetail should:
 * - Show the file details
 * - Allow downloading of files with anti-bot security (reCAPTCHA)
 */
class FilesDetail extends Component {
    constructor(properties) {
        super(properties);

        // important to provide context
        this.onClickDownload = this.onClickDownload.bind(this);
        this.onChangeReCAPTCHA = this.onChangeReCAPTCHA.bind(this);
        this.grecaptcha = null;

        this.state = {
            // all file details start empty
            filename: '',
            description: '',
            tags: [''],
            filetype: '',
            downloadURLs: [''],
            verified: false,

            // for the downloading
            captchaID: '',
            dialogOpen: false,
            currentLink: '',

            // this is for user-friendly messages
            isError: false,
            isSuccess: false,
            errorMessage: '',
            successMessage: ''
        }
    }

    /*
     * This is called whenever a link is clicked among the download URLs section.
     * reCAPTCHA verification is required for this to proceed properly.
     */
    onClickDownload(index) {
        // if there is no reCAPTCHA, show an error message
        if (this.state.captchaID.length === 0) {
            return this.setState({ isError: true, errorMessage: 'ReCAPTCHA authorization required.' })
        }

        // if the interpreter reaches this line, this means reCAPTCHA token is present
        axios.post(this.state.downloadURLs[index], { captchaID: this.state.captchaID })
            .then(response => {
                // reset the recaptcha right away
                if (this.grecaptcha) this.grecaptcha.reset();

                // if the file is verified, open a blank window to the given real URL of the file,
                // otherwise open a pop-up to warn the user that the file is not verified.
                if (this.state.verified) {
                    const newWindow = window.open(response.data.downloadURL, '_blank', 'noopener,noreferrer')
                    if (newWindow) newWindow.opener = null;
                    this.setState({ isSuccess: true, successMessage: 'Redirecting to download file.' });
                } else {
                    this.setState({ currentLink: response.data.downloadURL, dialogOpen: true, captchaID: '' });
                }
            })
            .catch(error => {
                // Make the error message look good.
                let capitalized;
                try {
                    let message = error.response.data.toString();
                    capitalized = message.charAt(0).toUpperCase() + message.slice(1);
                } catch(e) {
                    capitalized = 'Failed to send.'
                }
                // resets recaptcha right away
                if (this.grecaptcha) this.grecaptcha.reset();

                this.setState({ isError: true, errorMessage: capitalized, captchaID: '' });
            })
    }

    /*
     * This is called whenever the reCAPTCHA v2 checkbox is clicked or expires,
     * id is null if it expires.
     */
    onChangeReCAPTCHA(id) {
        if (id === null) {
            this.setState({ isError: true, errorMessage: 'ReCAPTCHA verification expired.' })
        } else {
            this.setState({ captchaID: id });
        }
    }

    /*
     * This is called whenever this component loads on the page,
     * this is meant to get all the file information required.
     */
    componentDidMount() {
        axios.get(process.env.REACT_APP_API_URL + '/files/details/' + this.props.match.params.id)
            .then(response => {
                let { filename, description, tags, filetype, downloadURLsLength, verified } = response.data; 

                // the downloadURLs are not exposed for security reasons and can be accessed 
                // using an API endpoint that requires reCAPTCHA v2 verification.
                let downloadURLs = [] 

                // all the downloadURLs follow a pattern
                for (let index = 0; index < downloadURLsLength; ++index) {
                    downloadURLs.push(`${process.env.REACT_APP_API_URL}/files/download/${this.props.match.params.id}/${index}`);
                }

                this.setState({ 
                    filename, 
                    filetype,
                    downloadURLs,
                    verified,
                    description: description ? description : '',
                    tags: tags ? tags : ['']
                });
            })
            .catch(error => {
                // show file does not exist
                this.setState({ isError: true, errorMessage: 'File does not exist.' });
            });
    }

    /*
     * Render JSX method of this component
     */
    render() {
        const { classes } = this.props;
        return (
            <Grid container justify="center" spacing={2}>
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
 
                            <Accordion>
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

                            <Accordion>
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
                            <Box fontSize="h6.fontSize">{ `Download Links (.${this.state.filetype})` }</Box>
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
                <Grid item xs={12} sm={9} container justify="flex-end">
                     <ReCAPTCHA
                         sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                         onChange={this.onChangeReCAPTCHA}
                         ref={element => { this.grecaptcha = element; }}
                    />,
                </Grid>
            </Grid>
        )
    }
}

export default withStyles(styles)(FilesDetail);
