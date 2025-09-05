const express = require('express');
const cors = require("cors");
const cookieParser = require("cookie-parser");

const config = require('./config');
const database = require('./services/database.service');
const authRouter = require('./auth/auth.api.router');

const loginRedirectHandler = require("./middlewares/loginRedirectHandler");
const protectedStaticHandler = require("./middlewares/protectedStaticHandler");
const requestLogger = require('./middlewares/request-logger');
const errrorHandler = require('./api-utils/error-handler');
const notFoundHandler = require('./api-utils/not-found-handler');

async function start() {
    console.log('[Init]: Connecting to database');
    await database.initialize();

    console.log('[Init]: starting server');

    const server = new express();

    server.use(
        cors({
            credentials: true,
            origin: "http://127.0.0.1:3090"
        })
    )

    server.use(cookieParser());
    server.use(express.json());
    server.use(requestLogger);

    server.use("/protected", protectedStaticHandler, express.static('frontend/private'))
    server.use('/api/auth', authRouter);
    server.use("/", loginRedirectHandler, express.static('frontend/public'));
    server.use(notFoundHandler);
    server.use(errrorHandler);

    server.listen(config.APP_PORT, () => {
        console.log(
            '[init]: authentication server application running on',
            config.APP_PORT
        );
    });
}

start().catch((err) => {
    console.log('[fatal]: could not start authentication server application');
    console.log(err);
});
