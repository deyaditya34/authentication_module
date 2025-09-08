const httpError = require("http-errors");

const config = require("../config");
const authService = require("../auth/auth.service");
const jwtService = require("../services/jwt.service")
const tokenService = require("../token/token.service");

async function userResolver(req, res, next) {
    const accessToken = req.cookies[config.ACCESS_TOKEN_HEADER_FIELD];

    if (!accessToken) {
        throw new httpError.Forbidden("Access Denied");
    }

    let [err, user] = await authService.getUserFromToken(accessToken);

    if (!user) {
        if (err.name !== "TokenExpiredError") {
            throw new httpError.Forbidden("Invalid Token");
        }

        const decodeToken = jwtService.decodeToken(accessToken);

        const userRefreshToken = await tokenService
            .findRefreshToken(
                decodeToken.username,
                decodeToken.provider
            );

        [err, user] = await authService.getUserFromToken(userRefreshToken);

        if (err) {
            throw new httpError.Forbidden("Invalid Token")
        }

        const { accessToken, refreshToken } = authService.
            createTokens(decodeToken.username, decodeToken.provider);

        res.cookie(config.ACCESS_TOKEN_HEADER_FIELD, newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        })

        await tokenService.updateRefreshToken(
            decodeToken.username,
            refreshToken,
            decodeToken.provider
        );
    }

    Reflect.set(req.body, "user", user);

    next();
}

module.exports = userResolver;
