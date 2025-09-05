const httpError = require("http-errors");

const config = require("../config");
const buildApiHandler = require("../api-utils/build-api-handler");
const authService = require("../auth/auth.service");

async function controller(req, res, next) {
    const accessToken = req.cookies[config.ACCESS_TOKEN_HEADER_FIELD];
    const refreshToken = req.cookies[config.REFRESH_TOKEN_HEADER_FIELD];

    if (!accessToken) {
        throw new httpError.Forbidden("Access Denied");
    }
    
    return res.json({
        success: true,
        message: "user has a access token"
    })
}

module.exports = buildApiHandler([controller]);
