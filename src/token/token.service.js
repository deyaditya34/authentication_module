const config = require("../config");
const database = require("../services/database.service");
const jwtService = require("../services/jwt.service");

async function updateRefreshToken(username, refreshToken, provider) {
    return database
        .getCollection(config.COLLECTION_NAMES_REFRESH_TOKEN)
        .updateOne(
            { username },
            {
                $set: {
                    refreshToken,
                    provider,
                }
            }, {
            upsert: true
        })
}

async function findRefreshToken(username, provider) {
    const result = await database
        .getCollection(config.COLLECTION_NAMES_REFRESH_TOKEN)
        .findOne({ username, provider })

    if (!result) {
        return null
    }

    return result;
}

async function deleteRefreshToken(username, provider) {
    const result = await database
        .getCollection(config.COLLECTION_NAMES_REFRESH_TOKEN)
        .deleteOne({ username, provider });

    return result;
}

module.exports = {
    updateRefreshToken,
    findRefreshToken,
    deleteRefreshToken
}
