const express = require('express');

const config = require('./config');
const database = require('./services/database.service');
const authRouter = require('./auth/auth.api.router');

const requestLogger = require('./middlewares/request-logger');
const errrorHandler = require('./api-utils/error-handler');
const notFoundHandler = require('./api-utils/not-found-handler');

async function start() {
  console.log('[Init]: Connecting to database');
  await database.initialize();

  console.log('[Init]: starting server');

  const server = new express();
  server.use(express.json());

  server.use(requestLogger);

  server.use('/api/auth', authRouter);
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
