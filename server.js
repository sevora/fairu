/*
 * Main Server File
 * This is where everything is
 * gathered up
 */
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// dotenv to allow local .env files
require('dotenv').config();

// server backend is on specified port 
// but default is set at 8000
const app = express();
const port = process.env.PORT || 8000;

//
app.use(cors());
app.use(express.json());
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
//const contributorsRouter = require('./routes/contributors.js');
const filesRouter = require('./routes/files.js');
const authenticationRouter = require('./routes/authentication.js');

//app.use('/contributors', contributorsRouter);
app.use('/files', filesRouter);
app.use('/auth', authenticationRouter);

app.listen(port, function() {
    console.log(`Server is running on port: ${port}`);
});
