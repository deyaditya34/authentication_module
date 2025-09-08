const config = require("../config");
const buildApiHandler = require("../api-utils/build-api-handler");
const userResolver = require("../middlewares/user-resolver");
const jwtService = require("../services/jwt.service");
const tokenService = require("../token/token.service");

async function controller(req, res) {
    const accessToken = req.cookies[config.ACCESS_TOKEN_HEADER_FIELD];

    const decodeToken = jwtService.decodeToken(accessToken);

    const userRefreshToken = await tokenService.
        findRefreshToken(
            decodeToken.username,
            decodeToken.provider
        );

    res.clearCookie(config.ACCESS_TOKEN_HEADER_FIELD, {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    });

    await tokenService.deleteRefreshToken(
        decodeToken.username,
        decodeToken.provider
    )  

    res.status(200).json({
        success: true,
        data: "logged out successfully",
    });
}

module.exports = buildApiHandler([userResolver, controller])
