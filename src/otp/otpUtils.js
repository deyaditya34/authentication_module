function generateOtp(length = 4) {
    const chars = "ACDEFGHJKLMNPQRSTUVWXYZ123456789abcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
}



module.exports = { generateOtp }
