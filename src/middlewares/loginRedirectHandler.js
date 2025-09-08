const config = require('../config');
const buildApiHandler = require('../api-utils/build-api-handler');
const authService = require('../auth/auth.service');
const jwtService = require('../services/jwt.service');
const tokenService = require('../token/token.service');

async function controller(req, res, next) {
  const accessToken = req.cookies[config.ACCESS_TOKEN_HEADER_FIELD];

  const reqUrl = req.originalUrl;

  if (!accessToken) {
    if (reqUrl === '/') {
      return next();
    }
    return res.redirect('/');
  }

  let [err, user] = await authService.getUserFromToken(accessToken);

  if (!user) {
    if (err.name !== 'TokenExpiredError') {
      if (reqUrl === '/') {
        return next();
      }
      return res.redirect('/');
    }

    const decodeToken = jwtService.decodeToken(accessToken);

    const userRefreshToken = await tokenService.findRefreshToken(
      decodeToken.username,
      decodeToken.provider
    );

    [err, user] = await authService.getUserFromToken(userRefreshToken);

    if (err) {
      if (reqUrl === '/') {
        return next();
      }
      return res.redirect('/');
    }

    const { accessToken, refreshToken } = authService.createTokens(
      decodeToken.username,
      decodeToken.provider
    );

    res.cookie(config.ACCESS_TOKEN_HEADER_FIELD, accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });

    await tokenService.updateRefreshToken(
      decodeToken.username,
      refreshToken,
      decodeToken.provider
    );
  }

  if (reqUrl === '/') {
    return res.redirect('/protected/page1.html');
  }
  return res.redirect('/');
}

module.exports = buildApiHandler([controller]);
