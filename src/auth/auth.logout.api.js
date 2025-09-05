const config = require("../config");
const buildApiHandler = require("../api-utils/build-api-handler");
const userResolver = require("../middlewares/user-resolver");

async function controller(req, res) {
    res.clearCookie(config.ACCESS_TOKEN_HEADER_FIELD, {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    });

    res.clearCookie(config.REFRESH_TOKEN_HEADER_FIELD, {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    })

    res.status(200).json({
        success: true,
        data: "logged out successfully",
    });
}

module.exports = buildApiHandler([userResolver, controller])
