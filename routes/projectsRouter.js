const express = require("express");
const projectsController = require("../controllers/projectsController.js");
const verifyJWT = require("../middlewares/verifyJWT.js");

const projectsRouter = express.Router();

projectsRouter.put("/removeLiderFromProject", verifyJWT, (req, res) => projectsController.removeLiderFromProject(req, res));
projectsRouter.put("/removeProjetistaFromProject", verifyJWT, (req, res) => projectsController.removeProjetistaFromProject(req, res));
projectsRouter.put("/removeClienteFromProject", verifyJWT, (req, res) => projectsController.removeClienteFromProject(req, res));
projectsRouter.put("/addLiderToProject", verifyJWT, (req, res) => projectsController.addLiderToProject(req, res));
projectsRouter.put("/addProjetistaToProject", verifyJWT, (req, res) => projectsController.addProjetistaToProject(req, res));
projectsRouter.put("/addClienteToProject", verifyJWT, (req, res) => projectsController.addClienteToProject(req, res));
projectsRouter.get("/", verifyJWT, (req, res) => projectsController.getAllProjects(req, res));
projectsRouter.get("/:projectID", verifyJWT, (req, res) => projectsController.getOneProject(req, res));
projectsRouter.post("/", verifyJWT, (req, res) => projectsController.createProject(req, res));
projectsRouter.delete("/:projectID", verifyJWT, (req, res) => projectsController.deleteProject(req, res));
projectsRouter.put("/changeProjectEtapa", verifyJWT, (req, res) => projectsController.changeProjectEtapa(req, res))

module.exports = projectsRouter;
