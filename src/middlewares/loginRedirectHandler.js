const config = require("../config");
const buildApiHandler = require("../api-utils/build-api-handler");
const authService = require("../auth/auth.service");
const { createToken } = require("../services/jwt.service");

async function controller(req, res, next) {
    const accessToken = req.cookies[config.ACCESS_TOKEN_HEADER_FIELD];
    const refreshToken = req.cookies[config.REFRESH_TOKEN_HEADER_FIELD];

    const reqUrl = req.originalUrl;

    if (reqUrl === "/" || !accessToken) {
        return next()
    }

    let [err, user] = await authService.getUserFromToken(accessToken);

    if (!user) {
        if (err.message !== "jwt expired") {
            return res.redirect("/");
        }

        [err, user] = await authService.getUserFromToken(refreshToken);

        if (err) {
            return res.redirect("/")
        }


        const newAccessToken = createToken(
            { username: user.username },
            config.ACCESS_TOKEN_VALIDITY

        );
        const newRefreshToken = createToken(
            { username: user.username },
            config.REFRESH_TOKEN_VALIDITY

        );

        res.cookie(config.ACCESS_TOKEN_HEADER_FIELD, newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        })
        res.cookie(config.REFRESH_TOKEN_HEADER_FIELD, newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        })
    }

    return res.redirect("/protected/page1.html")
}

module.exports = buildApiHandler([controller]);
