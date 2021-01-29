const jwt = require('jsonwebtoken');

module.exports = ((request, response, next) => {
    request.userData = {}
    let token;

    try {
        token = request.headers.authorization.split(' ')[1];
    } catch (error) {
        request.userData.error = new Error('Invalid headers.')
        return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, function(error, decoded) {
        if (error) {
            request.userData.error = error;
            if (error.name == 'TokenExpiredError') { 
                request.userData.expired = true;
            }
            return next();
        }
         request.userData = decoded;
         next();
    });

});

