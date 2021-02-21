/*
 * Everything under /auth is implemented here
 */

const router = require('express').Router();
const Contributor = require('../models/contributor.js');
const { OAuth2Client } = require('google-auth-library');

const jwt = require('jsonwebtoken');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST '/google'
// mandatory tokenId in the body
router.post('/google', function(request, response) {
    if (!request.body || !request.body.tokenId) return response.status(400).json('No user specified.')

    const { tokenId } = request.body;

    // this verifies the client
    googleClient.verifyIdToken({ idToken: tokenId, audience: process.env.GOOGLE_CLIENT_ID })
        .then(googleResponse => {
            // only verified emails are allowed
            const { email_verified, name, email } = googleResponse.payload;
            if (!email_verified) return response.status(400).json('Please use a verified Google account.')
            
            // also find the user,
            Contributor.findOne({ email }).exec((error, existingContributor) => {
                if (error) response.status(400).json(error);

                // if this user exists then simply sign their authentication and
                // send it back
                if (existingContributor) {
                    const token = jwt.sign({ id: existingContributor._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
                    const data = {
                        username: existingContributor.username,
                        email: existingContributor.email
                    }
                    response.status(200).json({ data, token });
                } else {
                    // otherwise make a new user, save that to the database
                    new Contributor({ email, username: name })
                        .save((error, contributor) => {
                            if (error) return response.status(400).json(error);

                            // and finally sign their authentication and send it back to them
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
