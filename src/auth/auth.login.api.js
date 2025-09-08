const config = require("../config");
const authService = require("./auth.service");
const tokenService = require("../token/token.service");
const buildApiHandler = require("../api-utils/build-api-handler");
const paramsValidator = require("../middlewares/params-validator");

async function controller(req, res) {
    const { username, password } = req.body;

    const { accessToken, refreshToken } = await authService.
        login(
            username,
            password,
            config.MANUAL_AUTH_SERVICE_PROVIDER_USER 
        );

    res.cookie(config.ACCESS_TOKEN_HEADER_FIELD, accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    });

    const insertRefreshTokenInDB = await tokenService.updateRefreshToken(
        username,
        refreshToken,
        config.MANUAL_AUTH_SERVICE_PROVIDER_USER
    )

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
