/*
 * everything under /files API is 
 * implemented here
 */
const router = require('express').Router();
const File = require('../models/file.js');
const Contributor = require('../models/contributor.js');
const authenticationMiddleware = require('./authentication-middleware.js');

const perPageCount = 5; // objects per page

// GET '/' gives JSON object which returns 
// an array files sorted by their date of creation, newest to oldest,
// an integer page referring to what page the query is
// another integer which is the maximum number of pages there are
router.get('/', function(request, response) {
    let page = 0;

    if (request.query.page) {
        if (isNaN(parseInt(request.query.page))) return response.status(400).json('Page is invalid.')
        page = parseInt(request.query.page);
    }

    let unverified = false;

    if (request.query.unverified) {
        unverified = request.query.unverified.toLowerCase() === 'true';
    }

    File.find(unverified ? {} : { verified: true })
        .sort('-createdAt')
        .select('-uploaderID')
        .limit(perPageCount)
        .skip(perPageCount * page)
        .exec((error, files) => {
            if (error) return response.status(400).json(error);
            response.json(files);
        });
});

// GET '/pagecount' returns integer 
// that counts how many pages there are
router.get('/pagecount', function(request, response) {
    // whether to count unverified documents
    let unverified = false;

    if (request.query.unverified) {
        unverified = request.query.unverified.toLowerCase() === 'true';
    }

    File.countDocuments(unverified ? {} : { verified: true })
        .exec((error, count) => {
            if (error) return response.status(400).json(error);
            // page - starts from 0 therefore 0 is the 1st page
            // pages - is the length or how many pages there are.
            response.json(Math.ceil(count / perPageCount));
        });

});

// GET '/search' and takes on a query string aka https://domain.com/search?query=keywords
// response should be files that match the criteria of query string
// based on filename, tags, and description
router.get('/search', function(request, response) {
    // Mongoose  handles searching through everything,
    // results are sorted newest to oldest
    if (!request.query || !request.query.query) return response.status(400).json('Please provide a query string under the key query.');
    let page = 0;

    if (request.query.page) {
        if (isNaN(parseInt(request.query.page))) return response.status(400).json('Page is invalid.')
        page = parseInt(request.query.page);
    }

    let databaseQuery = { 
            $or: [
                { filename : { $regex: request.query.query, $options: 'i' } },
                { tags: { $regex: request.query.query, $options: 'i' } },
                { description: { $regex: request.query.query, $options: 'i' } }
            ],
            verified: true
        }

    if (request.query.unverified && request.query.unverified.toLowerCase() === 'true') {
        delete databaseQuery.verified;
    }

    File.find(databaseQuery)
        .sort('-createdAt')
        .select('-uploaderID')
        .limit(perPageCount)
        .skip(perPageCount * page)
        .exec((error, files) => {
            // JSON file is served back if successful
            if (error) return response.status(400).json(error);        
            response.json(files);
        });

});

router.get('/search/pagecount', function(request, response) {
    if (!request.query || !request.query.query) return response.status(400).json('Please provide a query string under the key query.');

    let databaseQuery = { 
        $or: [
            { filename : { $regex: request.query.query, $options: 'i' } },
            { tags: { $regex: request.query.query, $options: 'i' } },
            { description: { $regex: request.query.query, $options: 'i' } }
        ],
        verified: true
    }

    if (request.query.unverified && request.query.unverified.toLowerCase() === 'true') {
        delete databaseQuery.verified;
    }

    File.countDocuments({ 
        $or: [
            { filename : { $regex: request.query.query, $options: 'i' } },
            { tags: { $regex: request.query.query, $options: 'i' } },
            { description: { $regex: request.query.query, $options: 'i' } }
        ]
    }).exec((error, count) => {
        if (error) return response.status(400).json(error);
        response.json(Math.ceil(count / perPageCount));
    });

});

// GET '/:id' should be defined last for it to be applied last.
// If that is not done will prevent the other routes from working
// as they will be considered this route.
router.get('/details/:id', function(request, response) {
    if (!request.params || !request.params.id) return response.status(400).json('Please provide an ID.')

    File.findById(request.params.id)
        .select('-uploaderID')
        .exec((error, file) => {
            if (error) return response.status(400).json('Please provide a valid ID.');
            response.json(file);
        });
        
})

// POST '/add' with the body of headers having
// filename: String,
// filetype: String
// downloadURLs: (Array) String,
//
// [optional values]
// description: String,
// tags: (Array) String
router.post('/add', authenticationMiddleware, function(request, response) {
    if (request.userData.expired) return response.status(400).json('Google authentication has expired. Please log-in again.');
    if (request.userData.error) return response.status(400).json('Google authentication is required.')

    Contributor.findById(request.userData.id)
        .exec((error, contributor) => {

            if (contributor.isBanned) return response.status(400).json('This account has been banned.')
            // File object is a Schema object from models directory
            const file = new File({
                filename: request.body.filename,
                filetype: request.body.filetype,
                downloadURLs: request.body.downloadURLs,
                uploaderID: request.userData.id
                // not yet properly implemented
            });

            // optional body values
            if (request.body.description) file.description = request.body.description;
            if (request.body.tags) file.tags = request.body.tags; 

            // this should properly send back a response
            // depending on what happened
            file.save()
            .then(function() {
                response.json('Your file has been successfully sent to the admins for verification!');
            })
            .catch(function(error) {
                response.status(400).json(error.toString().replace('ValidationError: ', '').split(',').map(message => message.split(': ')[1])[0]);
            });

        });
});

// POST '/update/:id' where id is a URL parameter of ObjectId
// from MongoDB itself
router.post('/update/:id', function(request, response) {
    File.findById(request.params.id)
        .exec((error, file) => {
            if (error) return response.status(400).json(error.response);

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
            .catch(function(error) { response.status(400).json(error) });
        });
});

module.exports = router;
