const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT.js");
const disciplinasController = require("../controllers/disciplinasController.js");
const etapasController = require("../controllers/etapasController.js");
const conteudosController = require("../controllers/conteudosController.js");

const filesPropsRouter = express.Router();

filesPropsRouter.get("/disciplinas", verifyJWT, (req, res) => disciplinasController.getDisciplinas(req, res));
filesPropsRouter.get("/conteudos", verifyJWT, (req, res) => conteudosController.getConteudos(req, res));
filesPropsRouter.get("/etapas", verifyJWT, (req, res) => etapasController.getEtapas(req, res));

filesPropsRouter.delete("/deleteDisciplina/:id", verifyJWT, (req, res) => disciplinasController.deleteDisciplina(req, res))
filesPropsRouter.delete("/deleteEtapa/:id", verifyJWT, (req, res) => etapasController.deleteEtapa(req, res))
filesPropsRouter.delete("/deleteConteudo/:id", verifyJWT, (req, res) => conteudosController.deleteConteudo(req, res))

filesPropsRouter.post("/createDisciplina", verifyJWT, (req, res) => disciplinasController.createDisciplina(req, res))
filesPropsRouter.post("/createEtapa", verifyJWT, (req, res) => etapasController.createEtapa(req, res));
filesPropsRouter.post("/createConteudo", verifyJWT, (req, res) => conteudosController.createConteudo(req, res));

filesPropsRouter.put("/updateDisciplina", verifyJWT, (req, res) => disciplinasController.updateDisciplina(req, res));
filesPropsRouter.put("/updateEtapa", verifyJWT, (req, res) => etapasController.updateEtapa(req, res));
filesPropsRouter.put("/updateConteudo", verifyJWT, (req, res) => conteudosController.updateConteudo(req, res));

module.exports = filesPropsRouter;
