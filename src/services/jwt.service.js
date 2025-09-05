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

function decodeToken(token) {
    try {
        return jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
        return null;
    }
}

module.exports = {
    createToken,
    decodeToken
}
