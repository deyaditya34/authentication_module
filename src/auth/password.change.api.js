const authService = require("./auth.service");
const buildApiHandler = require("../api-utils/build-api-handler");
const paramsValidator = require("../middlewares/params-validator");
const { validateUsername } = require("./auth.utils");
const userResolver = require("../middlewares/user-resolver");

async function controller(req, res) {
    const { username, password } = req.body;

    const userPasswordUpdate = await authService.changePassword(username, password);

    if (userPasswordUpdate.modifiedCount) {
        return res.json({
            success: true,
            data: "password changed successfully"
        })
    }

    if (!userPasswordUpdate.matchedCount) {
        return res.json({
            success: false,
            error: "user not found"
        })
    }

    if (userPasswordUpdate.matchedCount && !userPasswordUpdate.modifiedCount) {
        return res.json({
            success: true,
            error: "new password cannot be same as old password"
        })
    }
}

const usernameValidator = validateUsername;

const missingParamsValidator = paramsValidator.createParamValidator(
    ["username", "password"],
    paramsValidator.PARAM_KEY.BODY
);

module.exports = buildApiHandler([
    missingParamsValidator,
    usernameValidator,
    controller,
]);
