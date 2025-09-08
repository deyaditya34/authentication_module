const database = require("../services/database.service");
const config = require("../config");

async function updateOtp(username, otp, method, expirationTime) {
    const result = await database
        .getCollection(config.COLLECTION_NAMES_OTP)
        .updateOne(
            { username },
            {
                $set: {
                    otp,
                    method,
                    expirationTime

                }

            }, {
            upsert: true
        });

    return result;
}

async function findOtp(username) {
    const result = await database
        .getCollection(config.COLLECTION_NAMES_OTP)
        .findOne({ username })

    if (!result) {
        return null
    }

    return result;
}

module.exports = { updateOtp, findOtp };
