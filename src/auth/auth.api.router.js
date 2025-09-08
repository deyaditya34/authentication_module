const express = require("express");

const loginUser = require("./auth.login.api");
const registerUser = require("./auth.register.api");
const queryUsers = require("./query-users.api");
const changePassword = require("./password.change.api")
const logoutUser = require("./auth.logout.api");
const checkAuth = require("./auth.checkAuth.api");
const loginGoogleUser = require("./auth.login.google.api");
const sendOtp = require("./auth.sendOtp.api");
const verifyOtp = require("./auth.verifyOtp.api");

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/google/callback", loginGoogleUser);
router.get("/", queryUsers);
router.post("/change-password", changePassword);
router.post("/logout", logoutUser);
router.get("/check-token", checkAuth);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

module.exports = router;
