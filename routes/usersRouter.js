const express = require("express");
const usersController = require("../controllers/usersController.js");
const verifyJWT = require("../middlewares/verifyJWT.js");
const isUserAdmin = require("../middlewares/isUserAdmin.js");

const usersRouter = express.Router();

usersRouter.get("/getFuncionarios", (req, res) => usersController.getFuncionarios(req, res));
usersRouter.get("/", verifyJWT, (req, res) => usersController.getAllUsers(req, res));
usersRouter.get("/:userID", verifyJWT, (req, res) => usersController.getOneUser(req, res));
usersRouter.post("/", verifyJWT, isUserAdmin, (req, res) => usersController.createUser(req, res));
usersRouter.delete("/:userID", verifyJWT, isUserAdmin, (req, res) => usersController.deleteUser(req, res));
usersRouter.put("/changeName", verifyJWT, (req, res) => usersController.changeUserName(req, res));
usersRouter.put("/changeEmail", verifyJWT, (req, res) => usersController.changeUserEmail(req, res));
usersRouter.put("/changePassword", verifyJWT, (req, res) => usersController.changeUserPassword(req, res));
usersRouter.put("/changeAniversario", verifyJWT, (req, res) => usersController.changeUserAniversario(req, res));

module.exports = usersRouter;
