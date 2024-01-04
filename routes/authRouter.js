const express = require("express");
const authController = require("../controllers/authController.js");

const authRouter = express.Router();

authRouter.post("/login", (req, res) => authController.login(req, res));
authRouter.post("/loginClient", (req, res) => authController.loginClient(req, res));

module.exports = authRouter;
