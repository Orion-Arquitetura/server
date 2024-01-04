const express = require("express")
const verifyJWT = require("../middlewares/verifyJWT")
const notificationsController = require("../controllers/notificationsController")

const notificationsRouter = express.Router()

notificationsRouter.put("/", verifyJWT, (req, res) => notificationsController.updateReadState(req, res))
notificationsRouter.get("/:userID", verifyJWT, (req, res) => notificationsController.getUserNotifications(req, res))

module.exports = notificationsRouter