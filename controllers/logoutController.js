const Session = require("../database/models/session.js");
const User = require("../database/models/user.js");
const jwt = require("jsonwebtoken");

const logoutController = {
    logout: async (req, res) => {
        const cookieSettings = process.env.NODE_ENV === "production" ? { httpOnly: true, secure: true, sameSite: "None" } : { httpOnly: true }

        res.clearCookie("refreshToken", cookieSettings);
        res.status(200).end();
    }
};

module.exports = logoutController;
