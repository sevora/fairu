/*
 * Everything under /contributors API is handled here
 * not yet complete or fully implemented.
 */
const router = require('express').Router();
const Contributor = require('../models/contributor.js');
const authenticationMiddleware = require('./authentication-middleware.js');

const perPageCount = 20;

router.get('/', authenticationMiddleware, function(request, response) {
    if (request.userData.error) return response.status(400).json('Unauthorized API call.');

    let page = 0;

    if (request.query.page) {
        if (isNaN(parseInt(request.query.page))) return response.status(400).json('Page is invalid.')
        page = parseInt(request.query.page);
    }

    Contributor.findById(request.userData.id)
        .exec((error, contributor) => {
            if (error) return response.status(400).json(error);
            if (!(contributor.isAdmin || contributor.isSuperUser)) return response.status(400).json('Unauthorized API call.');

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

router.get('/count', authenticationMiddleware, function(request, response) {
    if (request.userData.error) return response.status(400).json('Unauthorized API call.');

    Contributor
        .findById(request.userData.id)
        .exec((error, contributor) => {
            if (error) return response.status(400).json(error);
            if (!(contributor.isAdmin || contributor.isSuperUser)) return response.status(400).json('Unauthorized API call.');

            Contributor
                .countDocuments()
                .exec((error, count) => {
                    if (error) return response.status(400).json(error);
                    response.json(count);
                });
        });
})

router.get('/role', authenticationMiddleware, function(request, response) {
    if (request.userData.error) return response.json({ isAdmin: false });

    Contributor.findById(request.userData.id)
        .exec((error, contributor) => {
            if (error) return response.json({ isAdmin: false });
            response.json({ isAdmin: contributor.isAdmin || contributor.isSuperUser });
        })
});

router.post('/ban/:id', authenticationMiddleware, function(request, response) {
    if (request.userData.expired) return response.status(400).json('The Authorization has expired.');
    if (request.userData.error) return response.status(400).json('Unauthorized API call.');
    if (!request.params || !request.params.id) return response.status(400).json('Please provide an ID.');

    Contributor.findById(request.userData.id)
        .exec((error, contributor) => {
            if (error) return response.status(400).json(error);
            if (!(contributor.isAdmin || contributor.isSuperUser)) return response.status(400).json('Authority does not permit the call.');

            Contributor.findById(request.params.id)
                .exec((error, toBeBannedContributor) => {
                    if (contributor.isSuperUser || !(toBeBannedContributor.isAdmin || toBeBannedContributor.isSuperUser) ) {
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
/*router.post('/update/:id', function(request, response) {
    Contributor.findById(request.params.id)
        .exec((error, contributor) => {
            if (error) return response.status(400).json('Error: ' + error);

            if (request.body.username) contributor.username = request.body.username;

            contributor.save()
            .then(function() { response.json('Contributor updated!') })
            .catch(function(error) { response.status(400).json('Error: ' + error) });

    });
});*/

module.exports = router;
