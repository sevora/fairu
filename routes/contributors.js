/*
 * Everything under /contributors API is handled here
 * not yet complete or fully implemented.
 */
const router = require('express').Router();
const Contributor = require('../models/contributor.js');

router.get('/', function(request, response) {
    Contributor.find()
    .then(function(contributors) {
        response.json(contributors);
    })
    .catch(function(error) {
        response.status(400).json('Error: ' + error);
    });
});

router.post('/update/:id', function(request, response) {
    Contributor.findById(request.params.id)
        .exec(contributor => {
            if (error) return response.status(400).json('Error: ' + error);

            if (request.body.username) contributor.username = request.body.username;

            contributor.save()
            .then(function() { response.json('Contributor updated!') })
            .catch(function(error) { response.status(400).json('Error: ' + error) });

    });
});

module.exports = router;
