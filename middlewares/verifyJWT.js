const jwt = require('jsonwebtoken');

function verifyJWT(req, res, next) {
    const authHeader = req.headers['authorization'];
    console.log("Verifying JWT");

    if (!authHeader) {
        return res.sendStatus(401);
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(
        token,
        process.env.AT_SECRET,
        (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                return res.sendStatus(403);
            }
            req.user = decodedToken;
            next();
        }
    );
}

module.exports = verifyJWT;
