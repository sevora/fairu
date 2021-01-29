const router = require('express').Router();
const Contributor = require('../models/contributor.js');
const { OAuth2Client } = require('google-auth-library');

var jwt = require('jsonwebtoken');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', function(request, response) {
    const { tokenId } = request.body;
    googleClient.verifyIdToken({ idToken: tokenId, audience: process.env.GOOGLE_CLIENT_ID })
        .then(googleResponse => {
            const { email_verified, name, email } = googleResponse.payload;
            if (!email_verified) return response.status(400).json('Please use a verified account.')
            
            Contributor.findOne({ email }).exec((error, existingContributor) => {
                if (error) response.status(400).json(error);
                if (existingContributor) {
                    const token = jwt.sign({ id: existingContributor._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
                    const data = {
                        username: existingContributor.username,
                        email: existingContributor.email
                    }
                    response.status(200).json({ data, token });
                } else {
                    new Contributor({ email, username: name })
                        .save((error, contributor) => {
                            if (error) return response.status(400).json(error);
                            const token = jwt.sign({ id: contributor._id}, process.env.JWT_SECRET, { expiresIn: '24h' });
                            const data = {
                                username: contributor.username,
                                email: contributor.email
                            }
                            response.status(200).json({ data, token });
                        });
                }
            });
        });
});

module.exports = router;
