const Session = require("../database/models/session.js");
const User = require("../database/models/user.js");
const jwt = require("jsonwebtoken");

const logoutController = {
    logout: async (req, res) => {
        res.clearCookie("refreshToken");
        res.status(200).end();
    }
};

module.exports = logoutController;
