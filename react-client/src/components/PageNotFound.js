/*
 * Page not Found
 * Shows up whenever a page is not found.
 */
import { Grid, Typography, Box } from '@material-ui/core';

export default function PageNotFound() {
    return (
        <Grid 
            container 
            justify="center"
            alignItems="center"
            spacing={3}
        >
            <Grid item xs={12} sm={9}>
                <Box mt={12} mx="auto" textAlign="center">
                    <Typography variant="h4">404 Page not Found.</Typography>
                </Box>
            </Grid>
        </Grid>
    )
}
