/*
 * Home Page
 * Nothing much but this is the homepage
 */
import { Grid, Typography, Box, Button } from '@material-ui/core';
import Image from 'material-ui-image';

export default function Home() {
    return (
        <Grid 
            container 
            justify="center"
            alignItems="center"
            spacing={3}
        >
            <Grid item xs={12} sm={9}> 
                <Box mx="auto" style={{ 'width': '320px' }}>
                    <Image src="/fairu-logo/Logo_name.png" style={{ width: '100%', height: 'auto', backgroundColor: 'transparent' }}/>
                </Box> 
            </Grid>
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
