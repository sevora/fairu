// import logo from './logo.svg';
import './App.css';
import '@fontsource/roboto';

//
import { BrowserRouter as Router, Route } from 'react-router-dom';

//
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { Container, Hidden } from '@material-ui/core';

// All components written for this project
import Home from './components/Home.js'
import NavigationBar from './components/NavigationBar.js';
import MobileNavigationBar from './components/MobileNavigationBar.js'
import FilesUpload from './components/FilesUpload.js';
import FilesList from './components/FilesList.js';

// This theme is to enforce black icons on mobile navigation
const theme = createMuiTheme({ palette: { primary: { main: '#000' } } });

export default function App() {
  return (
    <Router> 
        <ThemeProvider theme={theme}>
            {/* This is used to hide the navigation bar on mobile devices */}
            <Hidden xsDown={true}>
                <NavigationBar />
            </Hidden>

            {/* This is where all the pages will be rendered via react-router-dom */}
            <Container style={{ marginTop: '20px' }}>
                <Route exact path="/" component={Home} />
                <Route exact path="/upload" component={FilesUpload} />
                <Route exact path="/list" component={FilesList} />
            </Container>

            {/* This is used to hide mobile navigation on large devices*/}
            <Hidden smUp={true}>
                <MobileNavigationBar />
            </Hidden>
        </ThemeProvider>
    </Router>
  );
}
