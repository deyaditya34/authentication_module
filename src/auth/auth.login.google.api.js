const axios = require("axios");
const httpError = require("http-errors");

const buildApiHandler = require("../api-utils/build-api-handler");
const authService = require("./auth.service");
const config = require("../config");
const tokenService = require("../token/token.service");
const { decodeToken } = require("../services/jwt.service");

async function controller(req, res) {
    const code = req.query.code;
    const scope = req.query.scope;
    const state = req.query.state;
    const client_secret = config.GOOGLE_CLIENT_SECRET;
    const redirect_uri = config.GOOGLE_REDIRECT_URI;
    const client_id = config.GOOGLE_CLIENT_ID;

    const token_endpoint = "https://oauth2.googleapis.com/token";

    // Exchanging the authorization code for receiving id token, refresh token
    // and access token
    try {
        const token_response = await axios({
            method: "POST",
            url: token_endpoint,
            headers: { "Content-type": "application/x-www-form-urlencoded" },
            data: new URLSearchParams({
                code,
                client_id,
                client_secret,
                redirect_uri,
                grant_type: "authorization_code"
            })
        })

        const token_data = token_response.data;

        const google_id_token = token_data.id_token;
        const google_access_token = token_data.access_token;
        const google_refresh_token = token_data.refresh_token;

        // Verifying the token response by validating the id_token
        // with the google token info endpoint
        const token_validation_endpoint = "https://oauth2.googleapis.com/tokeninfo";

        const token_validation_response = await axios({
            method: "GET",
            url: token_validation_endpoint,
            params: {
                id_token: google_id_token
            }
        })

        // Fetching the user data after the id_token is verified
        const user_data_endpoint = "https://openidconnect.googleapis.com/v1/userinfo";

        const user_data_response = await axios({
            method: "GET",
            url: user_data_endpoint,
            headers: {
                Authorization: `Bearer ${google_access_token}`
            }
        })

        const user_data_response_data = user_data_response.data;
        const username = user_data_response_data.sub;
        const first_name = user_data_response_data.given_name;
        const middle_name = user_data_response_data.middle_name || null;
        const last_name = user_data_response_data.last_name;
        const email = user_data_response_data.email;
        const picture = user_data_response_data.picture;

        const is_user_registerd = authService
            .checkUserRegistered(
                username,
                config.GOOGLE_AUTH_SERVICE_PROVIDER_USER
            );

        if (!is_user_registerd) {
            await authService.register(
                username,
                null,
                config.GOOGLE_AUTH_SERVICE_PROVIDER_USER,
                email,
                picture,
                first_name,
                last_name,
                middle_name
            )
        }

        const { accessToken, refreshToken } = await authService
            .login(username,
                null,
                config.GOOGLE_AUTH_SERVICE_PROVIDER_USER
            );

        res.cookie(config.ACCESS_TOKEN_HEADER_FIELD, accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        })

        await tokenService.updateRefreshToken(
            decodeToken.username,
            refreshToken,
            config.GOOGLE_AUTH_SERVICE_PROVIDER_USER
        )

        res.redirect("/page1.html")
    } catch (err) {
        throw new httpError.BadRequest(err);
    }

    return res.end()

}

module.exports = buildApiHandler([controller])
