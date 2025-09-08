const httpError = require("http-errors");

const buildApiHandler = require("../api-utils/build-api-handler");
const paramsValidator = require("../middlewares/params-validator");
const authService = require("./auth.service");
const mailService = require("../middlewares/mail-service");
const otpService = require("../otp/otp.service");
const apiUtils = require("../api-utils/api.utils");
const otpUtils = require("../otp/otpUtils");
const templates = require("../api-utils/templates");
const config = require("../config");

async function controller(req, res) {
    const { username, method } = req.body;

    const user = await authService.findUser(username, "local");

    if (!user) {
        return res.json({
            success: false,
            error: "user not registered"
        })
    }

    const otp = otpUtils.generateOtp();
    try {
        if (method === "mail") {
            const mailTemplateBody = templates.mailTemplateForgotPasswordBody.replace("${otp}", otp);
            const otpExpiryTime = apiUtils.generateExpiryTime(15);

            const updateOtpInDB = await otpService.updateOtp(username, otp, method, otpExpiryTime);

            const transporter = mailService.generateTransporter(
                config.MAIL_SENDING_SERVICE,
                config.MAIL_SENDING_USER,
                config.MAIL_SENDING_USER_PASSWORD,
                false,
                config.MAIL_SENDING_PORT
            )

            const mailOptions = mailService.mailOptions(
                config.MAIL_SENDING_USER,
                user.email,
                templates.mailTemplateForgotPasswordSubject,
                mailTemplateBody
            );

            const mailSend = await mailService.sendMail(transporter, mailOptions);

            res.json({
                success: true,
                data: "otp sent successfully"  
            })

        }
    } catch (err) {
        throw new httpError.InternalServerError(err);
    }
}

const missingParamsValidator = paramsValidator.createParamValidator(
    ["username", "method"],
    paramsValidator.PARAM_KEY.BODY
)

module.exports = buildApiHandler([missingParamsValidator, controller]);
