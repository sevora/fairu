/*
 * Main Server File
 * This is where everything is
 * gathered up
 */
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const helmet = require('helmet');

// dotenv to allow local .env files
require('dotenv').config();

// server backend is on specified port 
// but default is set at 80
const app = express();
const port = process.env.PORT || 80;

// These are the middlewares from other libraries
// cors allows Cross-Origin Requests
// express-json allows json bodies
// helmet provides security against malicious clients
app.use(cors());
app.use(express.json());
app.use(helmet());
/*
 * Mongoose makes using MongoDB easier
 * adding schemas and other things
 * that makes it easy
 */
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', function() {
    console.log('MongoDB connection established successfully');
});

// require all the routes here as router
const authenticationRouter = require('./routes/authentication.js');
const filesRouter = require('./routes/files.js');
const contributorsRouter = require('./routes/contributors.js');

// these are the server endpoints
app.use('/auth', authenticationRouter);
app.use('/files', filesRouter);
app.use('/contributors', contributorsRouter);

// server runs at specified or default port
app.listen(port, function() {
    console.log(`Server is running on port: ${port}`);
});
