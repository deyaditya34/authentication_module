const httpError = require("http-errors");

const config = require("../config")
const database = require("../services/database.service");
const jwtService = require("../services/jwt.service");
const { buildUser, encryptPassword } = require("./auth.utils");

async function register(username, password, provider, email, picture, firstName, lastName, middleName) {
    const existingUser = await database
        .getCollection(config.COLLECTION_NAMES_USERS)
        .findOne({
            username,
            provider
        });

    if (existingUser) {
        throw new httpError.UnprocessableEntity(
            `Username '${username}' is already taken`
        );
    }

    const userDetails = buildUser(username, password, provider,
        email, picture, firstName, lastName, middleName);
    await database.getCollection(config.COLLECTION_NAMES_USERS).insertOne(userDetails);
}

async function checkUserRegistered(username, provider) {
    const existingUser = await database
        .getCollection(config.COLLECTION_NAMES_USERS)
        .findOne({
            username,
            provider
        })

    if (existingUser) {
        return true
    }

    return false;
}

async function login(username, password, provider) {
    console.log(password, typeof password);
    const user = await database.getCollection(config.COLLECTION_NAMES_USERS).findOne({
        username,
        password: password ? encryptPassword(password) : null,
        provider
    });

    if (!user) {
        throw new httpError.Unauthorized("Username/Password combo incorrect");

    }

    const { accessToken, refreshToken } = createTokens(username, provider);

    return { accessToken, refreshToken };
}

async function getUserFromToken(token) {
    try {
        const payload = jwtService.verifyToken(token);

        if (!payload) {
            return [{ error: true, message: "invalid token" }, null];
        }

        const username = payload.username;
        const provider = payload.provider;

        const query = {}
        query.username = username;
        if (provider) {
            query.provider = provider
        }

        const user = await database
            .getCollection(config.COLLECTION_NAMES_USERS)
            .findOne(query, {
                projection: {
                    _id: false, password: false, provider: false,
                    email: false, picture: false, firstName: false, middleName: false, lastName: false
                }
            });

        if (!user) {
            return [{ error: true, message: "no user found for the username" }, null]
        }

        return [null, user]

    } catch (err) {
        return [err, null];
    }
}

async function findUsers(criteria) {
    return database
        .getCollection(config.COLLECTION_NAMES_USERS)
        .find(criteria)
        .toArray();
}

async function findUser(username, provider) {
    return database
        .getCollection(config.COLLECTION_NAMES_USERS)
        .findOne({ username, provider })
}

async function retrieveUserDetails(username) {
    return database
        .getCollection(config.COLLECTION_NAMES_USERS)
        .findOne({ username: username });
}

async function changePassword(username, password) {
    return database
        .getCollection(config.COLLECTION_NAMES_USERS)
        .updateOne({ username }, { $set: { password: encryptPassword(password) } })
}

function createTokens(username, provider) {
    const accessToken = jwtService.createToken(
        { username, provider },
        config.ACCESS_TOKEN_VALIDITY
    )
    const refreshToken = jwtService.createToken(
        { username },
        config.REFRESH_TOKEN_VALIDITY
    )

    return { accessToken, refreshToken }
}

module.exports = {
    register,
    login,
    getUserFromToken,
    findUser,
    findUsers,
    changePassword,
    retrieveUserDetails,
    checkUserRegistered,
    createTokens
};
