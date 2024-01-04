const entregasRouter = require("express").Router()
const entregasController = require("../controllers/entregasController")
const verifyJWT = require("../middlewares/verifyJWT")

entregasRouter.post("/", verifyJWT, (req, res) => entregasController.createEntrega(req, res))
entregasRouter.put("/", verifyJWT, (req, res) => entregasController.addFileToEntrega(req, res))
entregasRouter.put("/removeFile", verifyJWT, (req, res) => entregasController.removeFileFromEntrega(req, res))
entregasRouter.put("/setText", verifyJWT, (req, res) => entregasController.setText(req, res))
entregasRouter.delete("/:entregaID", verifyJWT, (req, res) => entregasController.deleteEntrega(req, res))
entregasRouter.get("/:entregaID", verifyJWT, (req, res) => entregasController.getEntrega(req, res))
entregasRouter.put("/changeEntregaName", verifyJWT, (req, res) => entregasController.changeEntregaName(req, res))

module.exports = entregasRouter