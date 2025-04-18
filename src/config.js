require('dotenv').config();

module.exports = {
  MONGODBURI: process.env.MONGODBURI,
  DB_NAME: process.env.DB_NAME,
  APP_PORT: process.env.APP_PORT,
  COLLECTION_NAMES_USERS: process.env.COLLECTION_NAMES_USERS,
  JWT_SECRET: process.env.JWT_SECRET,
  AUTH_TOKEN_HEADER_FIELD: process.env.AUTH_TOKEN_HEADER_FIELD,
  PASSWORD_SALT: process.env.PASSWORD_SALT,
};
