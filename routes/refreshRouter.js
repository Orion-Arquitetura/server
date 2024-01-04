const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT.js");
const refreshController = require("../controllers/refreshController.js");

const refreshRouter = express.Router();

refreshRouter.get("/", (req, res) => refreshController.refresh(req, res));

module.exports = refreshRouter;
