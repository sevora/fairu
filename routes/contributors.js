/*
 * Everything under /contributors API is handled here
 */
const router = require('express').Router();
const Contributor = require('../models/contributor.js');
const authenticationMiddleware = require('./authentication-middleware.js');

const perPageCount = 20;

// GET '/'
// requires authentication, only admins or superuser
// returns array of contributors
// Optional parameters:
// ?page=0 query string of what page to give
router.get('/', authenticationMiddleware, function(request, response) {
    if (request.userData.error) return response.status(400).json('Unauthorized API call.');

    // default page is 0
    let page = 0;

    // however when specifying a page, make sure the page is a valid integer
    if (request.query.page) {
        if (isNaN(parseInt(request.query.page))) return response.status(400).json('Page is invalid.')
        page = parseInt(request.query.page);
    }

    // this finds the client's information first
    Contributor.findById(request.userData.id)
        .exec((error, contributor) => {
            if (error || !contributor) return response.status(400).json('Unauthorized API call.');
            if (!(contributor.isAdmin || contributor.isSuperUser)) return response.status(400).json('Unauthorized API call.');

            // if this line is reached, this means that the client is an admin or a superuser
            // the query finds the contributors
            // sorts them alphabetically by username
            // and limits the result with pagination
            Contributor
                .find()
                .sort('username')
                .limit(perPageCount)
                .skip(perPageCount * page)
                .exec((error, contributors) => {
                    if (error) return response.status(400).json(error);
                    return response.json(contributors);
                });
           
            
        });
});

// GET '/count'
// returns integer referring to how many 
// contributors there are, this route is restricted to admins or superusers
router.get('/count', authenticationMiddleware, function(request, response) {
    if (request.userData.error) return response.status(400).json('Unauthorized API call.');

    Contributor
        .findById(request.userData.id)
        .exec((error, contributor) => {
            if (error || !contributor) return response.status(400).json('Unauthorized API call.');
            if (!(contributor.isAdmin || contributor.isSuperUser)) return response.status(400).json('Unauthorized API call.');
            // if the interpreter reaches this line then client is admin or superuser
            // counts all the documents and returns that number
            Contributor
                .countDocuments()
                .exec((error, count) => {
                    if (error) return response.status(400).json(error);
                    response.json(count);
                });
        });
})

// GET '/role'
// returns a JSON Object with isAdmin of Boolean type
// this route is open to all, and seems useless
router.get('/role', authenticationMiddleware, function(request, response) {
    if (request.userData.error) return response.json({ isAdmin: false });

    Contributor.findById(request.userData.id)
        .exec((error, contributor) => {
            if (error || !contributor) return response.json({ isAdmin: false });
            response.json({ isAdmin: contributor.isAdmin || contributor.isSuperUser });
        })
});

// POST 'ban/:id'
// mandatory :id of a contributor and restricted to superuser or admins
// Superusers can ban both admins and contributors
// Admins can ban contributors only
// By banning a user, they cannot anymore send files
router.post('/ban/:id', authenticationMiddleware, function(request, response) {
    if (request.userData.expired) return response.status(400).json('The Authorization has expired.');
    if (request.userData.error) return response.status(400).json('Unauthorized API call.');
    if (!request.params || !request.params.id) return response.status(400).json('Please provide an ID.');

    Contributor.findById(request.userData.id)
        .exec((error, contributor) => {
            if (error || !contributor) return response.status(400).json('Unauthorized API call.');
            if (!(contributor.isAdmin || contributor.isSuperUser)) return response.status(400).json('Authority does not permit the call.');

            // if this line is reached by the interpreter, the client is either an admin or a superuser
            Contributor.findById(request.params.id)
                .exec((error, toBeBannedContributor) => {
                    if (error || !toBeBannedContributor) return response.status(400).json('Request ID is Invalid.');
                    // this conditional states that
                    // if you are a superuser you can ban 
                    // if you are banning a superuser or an admin you cannot ban (this wont be evaluated if first condition is true)
                    if (contributor.isSuperUser || !(toBeBannedContributor.isAdmin || toBeBannedContributor.isSuperUser) ) {
                        // this prevents banning oneself
                        if (request.userData.id === request.params.id) return response.status(400).json('You cannot ban yourself.');

                        // ban state is simply flipped, if true then it is now false, and vice versa
                        let banState = !toBeBannedContributor.isBanned;
                        toBeBannedContributor.isBanned = banState;

                        toBeBannedContributor.save()
                            .then(() => { response.json(banState) })
                            .catch(() => { response.json('Error occured while banning.') });

                    } else {
                        return response.status(400).json('Administrators cannot ban other administrators.');
                    }
                });
        });
});

module.exports = router;
