const router = require('express').Router();
let File = require('../models/file.js');

router.route('/').get(function(request, response) {
    File.find()
    .then(function(files) {
        response.json(files);
    })
    .catch(function(error) {
        response.status(400).json('Error: ' + error);
    });
});

router.route('/add').post(function(request, response) {
    const file = new File({
        filename: request.body.filename,
        description: request.body.description,
        tags: request.body.tags,
        filetype: request.body.filetype,
        downloadURLs: request.body.downloadURLs,
        uploaderID: request.body.uploaderID
    });

    file.save()
    .then(function() {
        response.json('New file added!');
    })
    .catch(function(error) {
        response.status(400).json('Error: ' + error);
    });
});

router.route('/update/:id').post(function(request, response) {
    File.findById(request.params.id)
    .then(function(file) {
        file.filename = request.body.filename;
        file.description = request.body.description;
        file.tags = request.body.tags;
        file.filetype = request.body.filetype;
        file.downloadURLs = request.body.downloadURLs;

        file.save()
        .then(function() { response.json('file updated!') })
        .catch(function(error) { response.status(400).json('Error: ' + error) });

    })
    .catch(function(error) {
        response.status(400).json('Error: ' + error);
    });
});

module.exports = router;
