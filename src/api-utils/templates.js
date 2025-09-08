const mailTemplateForgotPasswordBody = "The otp for resetting your login password is ${otp}. It is valid for 15 minutes.";
const mailTemplateForgotPasswordSubject = "Otp for Resetting Password";
const phoneTemplateForgotPassword = "The otp for resetting your login password is ${otp}. It is valid for 15 minutes.";

module.exports = {
    mailTemplateForgotPasswordBody,
    mailTemplateForgotPasswordSubject,
    phoneTemplateForgotPassword
};
