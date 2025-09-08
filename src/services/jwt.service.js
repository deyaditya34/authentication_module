const jwt = require("jsonwebtoken");
const config = require("../config")

function createToken(payload, expireTimeMin) {
    const token = jwt.sign(
        payload,
        config.JWT_SECRET,
        { expiresIn: expireTimeMin * 60 }

    );

    return token;
}

function verifyToken(token) {
    try {
        return jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
        return null;
    }
}

function decodeToken(token) {
    return jwt.decode(token, config.JWT_SECRET);
}

module.exports = {
    createToken,
    decodeToken,
    verifyToken,
}
