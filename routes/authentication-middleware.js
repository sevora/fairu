/*
 * This is the authentication middleware
 * it automatically parses the JSON web token and
 * puts it on userData object of request
 */
const jwt = require('jsonwebtoken');

module.exports = ((request, response, next) => {
    request.userData = {};
    let token;

    // this parses the headers first
    try {
        token = request.headers.authorization.split(' ')[1];
    } catch (error) {
        request.userData.error = new Error('Invalid headers.')
        return next();
    }

    // this verifies whether the token given is valid
    jwt.verify(token, process.env.JWT_SECRET, function(error, decoded) {

        if (error) {
            request.userData.error = error;

            // you can now check if token has expired with userData.expired
            if (error.name == 'TokenExpiredError') { 
                request.userData.expired = true;
            }
            return next();
        }

        // if nothing wrong happens, interpreter will reach this
        // and put all the decoded data in userData
        request.userData = decoded;
        next();
    });

});

