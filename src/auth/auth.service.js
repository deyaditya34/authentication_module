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

async function login(username, password) {
    const user = await database.getCollection(config.COLLECTION_NAMES_USERS).findOne({
        username,
        password: password ? encryptPassword(password) : null,

    });

    if (!user) {
        throw new httpError.Unauthorized("Username/Password combo incorrect");

    }

    const accessToken = jwtService.createToken(
        { username },
        config.ACCESS_TOKEN_VALIDITY

    );
    const refreshToken = jwtService.createToken(
        { username },
        config.REFRESH_TOKEN_VALIDITY

    );

    return { accessToken, refreshToken };
}

async function getUserFromToken(token) {
    try {
        const payload = jwtService.decodeToken(token);

        if (!payload) {
            return [{ error: true, message: "invalid token" }, null];
        }

        const username = payload.username;
        const user = await database
            .getCollection(config.COLLECTION_NAMES_USERS)
            .findOne({ username }, {
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

async function changePassword(username, password, newPassword) {
    const user = await database.getCollection(config.COLLECTION_NAMES_USERS).findOne({
        username,
        password: encryptPassword(password),
    });

    if (!user) {
        throw new httpError.Unauthorized("Username/Password combo incorrect");
    }

    let newPasswordEncrypted = encryptPassword(username, newPassword);

    await database
        .getCollection(config.COLLECTION_NAMES_USERS)
        .updateOne({ username }, { $set: { password: newPasswordEncrypted } });

    const token = jwtService.createToken({ username });

    return token;
}

async function retrieveUserDetails(username) {
    return database
        .getCollection(config.COLLECTION_NAMES_USERS)
        .findOne({ username: username });
}

async function updatePassword(userDetails, username, password, newPassword) {
    if (userDetails.username !== username) {
        throw new httpError.Unauthorized(
            "Username provided does not match with the username stored in the database."
        );
    }

    if (userDetails.password !== encryptPassword(password)) {
        throw new httpError.Unauthorized(
            "Password doesnot match with the user Password saved in the database."
        );
    }

    await database
        .getCollection(config.COLLECTION_NAMES_USERS)
        .updateOne(
            { username: userDetails.username },
            { $set: { password: encryptPassword(newPassword) } }
        );
}

module.exports = {
    register,
    login,
    getUserFromToken,
    findUsers,
    changePassword,
    retrieveUserDetails,
    updatePassword,
    checkUserRegistered
};
