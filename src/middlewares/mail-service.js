const nodemailer = require("nodemailer");

function generateTransporter(service, user, pass, secure, port) {
    let transporter = nodemailer.createTransport({
        service,
        auth: {
            user,
            pass,
        },
        secure,
        port
    })

    return transporter;
}

function mailOptions(from, to, subject, text) {
    return {
        from,
        to,
        subject,
        text
    }
}

async function sendMail(transporter, mailOptions) {
    let mailSentInfo = await transporter.sendMail(mailOptions);

    return mailSentInfo;
}

module.exports = {generateTransporter, mailOptions, sendMail}
