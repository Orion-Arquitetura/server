const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT.js");
const logoutController = require("../controllers/logoutController.js");

const logoutRouter = express.Router();

logoutRouter.get("/", (req, res) => logoutController.logout(req, res));

module.exports = logoutRouter;
