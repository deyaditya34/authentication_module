const config = require("../config");
const authService = require("./auth.service");
const buildApiHandler = require("../api-utils/build-api-handler");
const paramsValidator = require("../middlewares/params-validator");

async function controller(req, res) {
    const { username, password } = req.body;

    const {accessToken, refreshToken} = await authService.login(username, password);

    res.cookie(config.ACCESS_TOKEN_HEADER_FIELD, accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    });

    res.cookie(config.REFRESH_TOKEN_HEADER_FIELD, refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    })

    res.json({
        success: true,
        data: "login successful",
    });
}

const missingParamsValidator = paramsValidator.createParamValidator(
    ["username", "password"],
    paramsValidator.PARAM_KEY.BODY
);

module.exports = buildApiHandler([missingParamsValidator, controller]);
