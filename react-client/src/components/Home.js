import { Grid, Typography, Box, Button } from '@material-ui/core';

export default function Home() {
    return (
        <Grid 
            container 
            justify="center"
            alignItems="center"
            spacing={3}
        >
            <Grid item xs={12} sm={9}>
                <Box mx="auto" textAlign="center">
                     <Typography variant="h4">The Open and Collaborative Academic Repository</Typography>
                </Box>
            </Grid>
            <Grid item xs={12} sm={9}>
                <Box mx="auto" textAlign="center">
                    <Button color="primary" variant="outlined" component="a" href={'/list'}>Search Around</Button>
                </Box>
            </Grid>
        </Grid>
    )
}
