function generateExpiryTime(validityInMinutes) {
    const currentTime = new Date();

    const currentMinute = currentTime.getMinutes();
    const updatedTime = currentTime.setMinutes(currentMinute + validityInMinutes);

    return updatedTime;
}

module.exports = {generateExpiryTime}
