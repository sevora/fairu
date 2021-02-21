/*
 * everything under /files API is 
 * implemented here
 */
const router = require('express').Router();
const ObjectId = require('mongoose').Types.ObjectId
const striptags = require('striptags');
const axios = require('axios');

const File = require('../models/file.js');
const Contributor = require('../models/contributor.js');
const authenticationMiddleware = require('./authentication-middleware.js');

const perPageCount = 20; // objects per page

// GET '/' 
// returns array of files sorted by their date of creation, newest to oldest
// Optional parameters:
// ?page=0 refers to what page should be given
// ?unverified=false refers if unverified files will be given too
router.get('/', function(request, response) {
    let page = 0;

    // if page is specified, make sure the page is valid
    // otherwise give an error
    if (request.query.page) {
        if (isNaN(parseInt(request.query.page))) return response.status(400).json('Page is invalid.')
        page = parseInt(request.query.page);
    }

    // by default unverified files will not be given
    let unverified = false;

    if (request.query.unverified) {
        unverified = request.query.unverified.toLowerCase() === 'true';
    }

    // this query
    // sorts them based on their creation date, newest to oldest
    // removes the fields: uploaderID and downloadURLs
    // limits and skips to simulate pagination
    // and executes
    File.find(unverified ? {} : { verified: true })
        .sort('-createdAt')
        .select(['-uploaderID', '-downloadURLs'])
        .limit(perPageCount)
        .skip(perPageCount * page)
        .exec((error, files) => {
            if (error) return response.status(400).json(error);
            if (!files) response.json([]);
            // gives back all the files within the range
            response.json(files);
        });
});

// GET '/count'
// returns an integer which represents the number of documents in the files collection
// essentially returning how many files there are in the database.
// Optional parameters:
// ?unverified = false refers whether to count unverified files as well
router.get('/count', function(request, response) {
    // whether to count unverified documents
    let unverified = false;

    // sets the unverified query string
    if (request.query.unverified) {
        unverified = request.query.unverified.toLowerCase() === 'true';
    }

    // this query counts the number of documents
    File.countDocuments(unverified ? {} : { verified: true })
        .exec((error, count) => {
            if (error) return response.status(400).json(error);
            response.json(count);
        });
});

// GET '/pagecount' 
// returns integer referring to how many pages there are based on perPageCount
// and total number of documents
// Optional parameters:
// ?unverified=false refers to whether count unverified files as well
router.get('/pagecount', function(request, response) {
    // whether to count unverified documents
    let unverified = false;

    // sets the unverified query string
    if (request.query.unverified) {
        unverified = request.query.unverified.toLowerCase() === 'true';
    }

    File.countDocuments(unverified ? {} : { verified: true })
        .exec((error, count) => {
            if (error) return response.status(400).json(error);
            response.json(Math.ceil(count / perPageCount));
        });

});

// GET '/search'
// mandatory query string aka https://domain.com/search?query=keywords
// returns array of files that match the criteria of query string based on filename, tags, and description
// Optional parameters:
// ?page=0 refers to what page
// ?verified=false refers whether to include verified files
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

    // this removes the query for verified files meaning all files will be included
    // even unverified ones
    if (request.query.unverified && request.query.unverified.toLowerCase() === 'true') {
        delete databaseQuery.verified;
    }

    // similar query to '/'
    File.find(databaseQuery)
        .sort('-createdAt')
        .select(['-uploaderID', '-downloadURLs'])
        .limit(perPageCount)
        .skip(perPageCount * page)
        .exec((error, files) => {
            // JSON file is served back if successful
            if (error || !files) return response.status(400).json(error);
            response.json(files);
        });

});

// GET '/search/pagecount'
// returns how many pages there are in this particular search query
// Optional parameters:
// ?unverified=false query string specifying whether to include unverified files
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

    // this makes it so that unverified files are included if the unverified query string is true
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

// GET '/details/:id'
// mandatory :id to specify file 
// returns the information of that file 
// with the information being restricted based on the client's authority
router.get('/details/:id', authenticationMiddleware, function(request, response) {
    if (!request.params || !request.params.id) return response.status(400).json('Please provide an ID.')

    File.findById(request.params.id)
        // .select('-uploaderID -verifiedBy') this line is not required as uploaderID and verifiedBy are based on conditionals
        .exec((error, file) => {
            if (error || !file) return response.status(400).json('No such file.');

            // this is for easy access on the uploaderID and verifiedBy
            let uploaderID = file.uploaderID;
            let verifiedBy = file.verifiedBy;

            // this object is what will be returned based on authority
            // by default it has filename, description, tags, filetype, verified,
            // and downloadURLsLength.
            // 
            // downloadURLs have been removed for security reasons and anti-scraping or anti-bot 
            // and instead returns an empty array
            let fileDetails = {
                filename: file.filename,
                description: file.description ? file.description : '',
                tags: file.tags ? file.tags : [''],
                filetype: file.filetype,
                verified: file.verified,
                downloadURLs: [''],
                downloadURLsLength: file.downloadURLs.length
            }

            // if the user has no authorization return this object right away
            if (request.userData.error) return response.json(fileDetails);

            // if the user has authorization, validate it
            Contributor.findById(request.userData.id)
                .exec((error, contributor) => {
                    if (error) return response.json(fileDetails);
                    if (!contributor.isAdmin || !contributor.isSuperUser) return response.json(fileDetails);

                    // if the user is an admin or superuser
                    // then the downloadURLs are now accessible by them
                    fileDetails.downloadURLs = file.downloadURLs;

                    // this query finds the uploader's information
                    Contributor.findById(uploaderID)
                        .exec((error, uploader) => {
                            if (error) return response.json(fileDetails);

                            fileDetails.uploaderEmail = uploader.email;  

                            // this query finds the information of who verified the file
                            Contributor.findById(verifiedBy)
                                .exec((error, verifier) => { 
                                    if (error) return response.json(fileDetails);
                                    fileDetails.verifierEmail = verifier ?  verifier.email : '';

                                    // if the code reaches this part, this means a complete information will be sent to the
                                    // client and the client is an admin or a superuser
                                    return response.json(fileDetails);
                                });
                        });
                });
        });

});

// POST '/download/:id/:index'
// This is a POST request for security reasons though normally it should be a GET request
// both id and index are mandatory, also a captchaID is required to be sent with the request body
router.post('/download/:id/:index', function(request, response) {
    if (!request.body) return response.status(400).json('Invalid API call.');
    if (!request.body.captchaID) return response.status(400).json('ReCAPTCHA authorization required.');
    if (!request.params || !request.params.id || !request.params.index) return response.status(400).json('Invalid API Call.')

    // this url is for checking whether this reCAPTCHA from the client is valid
    let captcha = request.body.captchaID;
    const verifyURL = `https://google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captcha}&remoteip=${request.connection.remoteAddress}`;

    // axios does a GET request to Google reCAPTCHA
    axios.get(verifyURL)
        .then((googleRequest) => {
            // if the reCAPTCHA fails this should terminate the request
            if (!googleRequest.data || !googleRequest.data.success) return response.status(400).json('ReCAPTCHA authorization required.');

            // if it succeeds, this block updates the download count of the file
            // and exposes its downloadURL at the specified index
            File.findById(request.params.id)
                .exec((error, file) => {
                    // error if String cannot be casted to ObjectId
                    // file === null if it is an ObjectId but it does not exist
                    if (error || !file) return response.status(400).json();

                    let { index } = request.params;

                    // this is for managing the download count
                    if (index >= 0 && index < file.downloadURLs.length) {
                        if (file.downloads) {
                            file.downloads += 1;
                        } else {
                            file.downloads = 1;
                        }

                        // the download count is updated and
                        // then the downloadURL is finally exposed
                        file.save()
                            .then(function() { 
                                // response.redirect(302, file.downloadURLs[index]); this is not going to be used 
                                // as handling redirects with axios client side is a hassle
                                response.json({ downloadURL: file.downloadURLs[index] });
                            })
                            .catch(function(error) {
                                response.status(400).json('Error resource call.');
                            });
                    } else {
                        response.status(400).json('Invalid API Call.');
                    }
                });
        })
        .catch((error) => {
            response.status(400).json('Google authorization failed.');
        });

});

// POST '/add'
// mandatory filename, filetype, downloadURLs (array), and uploaderID
// optional description, tags (array)
// all the parameters to be given are String
// this adds that file to the database
router.post('/add', authenticationMiddleware, function(request, response) {
    if (request.userData.expired) return response.status(400).json('Google authentication has expired. Please log-in again.');
    if (request.userData.error) return response.status(400).json('Google authentication is required.')

    Contributor.findById(request.userData.id)
        .exec((error, contributor) => {
            if (!contributor) return response.status(400).json('Contributor does not exist.');
            if (contributor.isBanned) return response.status(400).json('This account has been banned.')

            // File object is a Schema object from models directory
            const file = new File({
                filename: request.body.filename ? striptags(request.body.filename) : '',
                filetype: request.body.filetype ? request.body.filetype : '',
                downloadURLs: request.body.downloadURLs ? request.body.downloadURLs : [''],
                uploaderID: request.userData.id ? request.userData.id : ''
            });

            // optional body values
            if (request.body.description) file.description = striptags(request.body.description);
            if (request.body.tags) file.tags = striptags(request.body.tags); 

            // this should properly send back a response
            // depending on what happened
            file.save()
            .then(function() {
                response.json('Your file has been successfully sent to the admins for verification!');
            })
            .catch(function(error) {
                // the error message is written like this to prevent
                // errors server side
                let errorMessage = '';
                try {
                    // this allows us to take advantage of the error messages we wrote on the 
                    // mongoose schema
                    errorMessage = error.toString().replace('ValidationError: ', '').split(',').map(message => message.split(': ')[1])[0]; 
                } catch {
                    errorMessage = error.toString();
                }
                response.status(400).json(errorMessage);
            });

        });
});

// POST '/update/:id'
// mandatory :id parameter
// optional filename, description, tags, filetype, downloadURLs
router.post('/update/:id', authenticationMiddleware, function(request, response) {
    // this API has authentication
    if (request.userData.expired) return response.status(400).json('Google authentication has expired. Please log-in again.');
    if (request.userData.error) return response.status(400).json('Google authentication is required.')
    if (!request.params || !request.params.id) return response.status(400).json('Please provide an ID.')

    Contributor
        .findById(request.userData.id)
        .exec((error, contributor) => {
            if (error || !contributor) return response.status(400).json('User ID is invalid.');
            if (!(contributor.isAdmin || contributor.isSuperUser)) return response.status(400).json('Authority does not permit the call.');
            if (contributor.isBanned) return response.status(400).json('You have been banned.');
            
            // if the interpreter reaches this line, this means the client
            // is either an administrator or a superuser
            File
                .findById(request.params.id)
                .exec((error, file) => {
                    if (error || !file) return response.status(400).json('File does not exist.');

                    // these are the fields of the file
                    let { filename, description, tags, filetype, downloadURLs, verified } = request.body;
                    if (filename) file.filename = striptags(request.body.filename);
                    if (description) file.description = striptags(request.body.description);
                    if (tags) file.tags = tags;
                    if (filetype) file.filetype = filetype;
                    if (downloadURLs) file.downloadURLs = downloadURLs;

                    // this properly sets the verification
                    if (verified === true || verified === false) {
                        file.verified = verified;
                        if (verified) {
                            file.verifiedBy = contributor._id;
                        }
                    }

                    // query to save the changes made on the file 
                    file.save()
                        .then(function() { response.json('File successfully updated.') })
                        .catch(function() {
                            // the error message is written like this to prevent
                            // errors server side
                            let errorMessage = '';
                            try {
                                // this allows us to take advantage of the error messages we wrote on the 
                                // mongoose schema
                                errorMessage = error.toString().replace('ValidationError: ', '').split(',').map(message => message.split(': ')[1])[0]; 
                            } catch {
                                errorMessage = error.toString();
                            }
                            response.status(400).json(errorMessage);
                        });
                });
        });
});

// POST '/delete'
// requires authentication and mandatory ids array inside the body
// deletes files specified from the database
router.delete('/delete', authenticationMiddleware, function(request, response) {
    if (request.userData.error) return response.status(400).json('Unauthorized API call.');

    // this queries for the client information
    Contributor.findById(request.userData.id)
        .exec((error, contributor) => {
            if (error || !contributor) return response.status(400).json('Unauthorized API call.');
            if (!contributor.isSuperUser) return response.status(400).json('Unauthorized API call.')
            if (!request.body || request.body.ids.length == 0) return response.status(400).json('Please provide proper body.');

            // if the client is not a superUser then this line will never be reached
            let ids;
            try {
                // this is required, typecasting to mongoose ObjectID
                ids = request.body.ids.map(id => ObjectId(id));
            } catch(error) {
                return response.status(400).json(error);
            }

            // this deletes all the files at the specified ids
            if (ids.length > 0) File.deleteMany({ _id: { $in: ids }}, (error, result) => {
                if (error) return response.status(400).json(error);
                response.json(result);
            });
        })
});

module.exports = router;
