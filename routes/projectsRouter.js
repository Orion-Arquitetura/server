const express = require("express");
const projectsController = require("../controllers/projectsController.js");
const verifyJWT = require("../middlewares/verifyJWT.js");

const projectsRouter = express.Router();

// projectsRouter.put("/addLiderToProject", verifyJWT, (req, res) => projectsController.addLiderToProject(req, res));
// projectsRouter.put("/removeLiderFromProject", verifyJWT, (req, res) => projectsController.removeLiderFromProject(req, res));
projectsRouter.get("/", verifyJWT, (req, res) => projectsController.getAllProjects(req, res));
projectsRouter.get("/:projectID", verifyJWT, (req, res) => projectsController.getOneProject(req, res));
projectsRouter.post("/", verifyJWT, (req, res) => projectsController.createProject(req, res));
projectsRouter.delete("/:projectID", verifyJWT, (req, res) => projectsController.deleteProject(req, res));
projectsRouter.put("/changeProjectEtapa", verifyJWT, (req, res) => projectsController.changeProjectEtapa(req, res))

projectsRouter.patch("/addUserToProject", verifyJWT, (req, res) => projectsController.addUserToProject(req, res))
projectsRouter.patch("/removeUserFromProject", verifyJWT, (req, res) => projectsController.removeUserFromProject(req, res))

projectsRouter.patch("/addComment", verifyJWT, (req, res) => projectsController.addComment(req, res))
projectsRouter.patch("/editComment", verifyJWT, (req, res) => projectsController.editComment(req, res))
projectsRouter.delete("/deleteComment/:commentID", verifyJWT, (req, res) => projectsController.deleteComment(req, res))


projectsRouter.post("/addAtualizacao", verifyJWT, (req, res) => projectsController.addAtualizacao(req, res))
projectsRouter.patch("/editAtualizacao", verifyJWT, (req, res) => projectsController.editAtualizacao(req, res))
projectsRouter.delete("/deleteAtualizacao/:atualizacaoID", verifyJWT, (req, res) => projectsController.deleteAtualizacao(req, res))

module.exports = projectsRouter;
