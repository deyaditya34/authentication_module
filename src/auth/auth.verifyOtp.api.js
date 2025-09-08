const httpError = require("http-errors");

const buildApiHandler = require("../api-utils/build-api-handler");
const paramsValidator = require("../middlewares/params-validator");
const config = require("../config");
const authService = require("./auth.service");
const otpService = require("../otp/otp.service");

async function controller(req, res) {
    const { username, method, otp } = req.body;
    
    const user = await authService.findUser(username, "local");

    if (!user) {
        return res.json({
            success: false,
            error: "user not registerd"
        })
    }

    if (method === "mail") {
        const storedOtpInDB = await otpService.findOtp(username, method);

        if (!storedOtpInDB) {
            throw new httpError.BadRequest("invalid request")
        }

        const otpExpiryTime = storedOtpInDB.expirationTime;
        const currentTime = new Date();

        if (currentTime > otpExpiryTime) {
            return res.json({
                success: false,
                error: "otp expired"
            })
        }

         if (storedOtpInDB.otp !== otp) {
            return res.json({
                success: false,
                error: "invalid otp"
            })
        }

        return res.json({
            success: true,
            data: "otp verification successful"
        })
        
    }

}

const missingParamsValidator = paramsValidator.createParamValidator(
    ["username", "method", "otp"], paramsValidator.PARAM_KEY.BODY
)

module.exports = buildApiHandler([missingParamsValidator, controller])
