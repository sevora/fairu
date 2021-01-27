/*
 * Everything under /contributors API is handled here
 * not yet complete or fully implemented.
 */
const router = require('express').Router();
let Contributor = require('../models/contributor.js');

router.route('/').get(function(request, response) {
    Contributor.find()
    .then(function(contributors) {
        response.json(contributors);
    })
    .catch(function(error) {
        response.status(400).json('Error: ' + error);
    });
});

router.route('/add').post(function(request, response) {
    const username = request.body.username;
    const contributor = new Contributor({ username });

    contributor.save()
    .then(function() {
        response.json('New contributor added!');
    })
    .catch(function(error) {
        response.status(400).json('Error: ' + error);
    });
});

router.route('/update/:id').post(function(request, response) {
    Contributor.findById(request.params.id)
    .then(function(contributor) {
        contributor.username = request.body.username;

        contributor.save()
        .then(function() { response.json('Contributor updated!') })
        .catch(function(error) { response.status(400).json('Error: ' + error) });

    })
    .catch(function(error) {
        response.status(400).json('Error: ' + error);
    });
});

module.exports = router;
