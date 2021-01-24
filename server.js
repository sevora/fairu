const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
const connection = mongoose.connection;

connection.once('open', function() {
    console.log('MongoDB connection established successfully');
});

const contributorsRouter = require('./routes/contributors.js');
const filesRouter = require('./routes/files.js');

app.use('/contributors', contributorsRouter);
app.use('/files', filesRouter);

app.listen(port, function() {
    console.log(`Server is running on port: ${port}`);
});
