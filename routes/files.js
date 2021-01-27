/*
 * everything under /files API is 
 * implemented here
 */
const router = require('express').Router();
let File = require('../models/file.js');

// GET '/' gives JSON object which returns 
// all files sorted by their date of creation, newest to oldest.
router.route('/').get(function(request, response) {
    File.find().sort('-createdAt')
    .then(function(files) {
        response.json(files);
    })
    .catch(function(error) {
        response.status(400).json('Error: ' + error);
    });
});

// POST '/add' with the body of headers having
// filename: String,
// filetype: String
// downloadURLs: (Array) String,
//
// [optional values]
// description: String,
// tags: (Array) String
router.route('/add').post(function(request, response) {
    // File object is a Schema object from models directory
    const file = new File({
        filename: request.body.filename,
        filetype: request.body.filetype,
        downloadURLs: request.body.downloadURLs,

        // not yet properly implemented
        uploaderID: '00000'
    });

    // optional body values
    if (request.body.description) file.description = request.body.description;
    if (request.body.tags) file.tags = request.body.tags; 

    // this should properly send back a response
    // depending on what happened
    file.save()
    .then(function() {
        response.json('New file added!');
    })
    .catch(function(error) {
        response.status(400).json('Error: ' + error);
    });
});

// POST '/update/:id' where id is a URL parameter of ObjectId
// from MongoDB itself
router.route('/update/:id').post(function(request, response) {
    File.findById(request.params.id)
    .then(function(file) {
        // all the changing is optional
        if (request.body.filename) file.filename = request.body.filename;
        if (request.body.description) file.description = request.body.description;
        if (request.body.tags) file.tags = request.body.tags;
        if (request.body.filetype)file.filetype = request.body.filetype;
        if (request.body.downloadURLs) file.downloadURLs = request.body.downloadURLs;

        // there should be no API for changing
        // uploaderIDs
        // file.uploaderID = '00000000';
        
        // should properly send
        // a response back depending
        // on how successful the operation was
        file.save()
        .then(function() { response.json('File updated!') })
        .catch(function(error) { response.status(400).json('Error: ' + error) });
    })
    .catch(function(error) {
        response.status(400).json('Error: ' + error);
    });
});

// GET '/search' and takes on a query string aka https://foo.com/?query=
// response should be files that match the criteria of query string
// based on filename, tags, and description
router.route('/search').get(function(request, response) {
    // Mongoose  handles searching through everything,
    // results are sorted newest to oldest
    File.find().or([
        { "filename" : { "$regex": request.query.query, "$options": "i" } },
        { "tags": { "$regex": request.query.query, "$options": "i" } },
        { "description": { "$regex": request.query.query, "$options": "i" } }
    ]).sort('-createdAt').then(function(files) {
        // JSON file is served back if successful
        response.json(files);
    }).catch(function(error) { response.status(400).json('Error: ' + error); console.log(error)});
});

module.exports = router;
