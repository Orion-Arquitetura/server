const relatoriosRouter = require("express").Router()
const relatoriosController = require("../controllers/relatoriosController.js")
const verifyJWT = require("../middlewares/verifyJWT.js");

relatoriosRouter.post("/", verifyJWT, (req, res) => relatoriosController.createRelatorio(req, res))
relatoriosRouter.delete("/:relatorioID", verifyJWT, (req, res) => relatoriosController.deleteRelatorio(req, res))

module.exports = relatoriosRouter