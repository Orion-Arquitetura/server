const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT.js");
const filesController = require("../controllers/filesController.js");

const filesRouter = express.Router();

filesRouter.get("/getBinaries/:gridID", (req, res) => filesController.getFileBinaries(req, res));
filesRouter.get("/", verifyJWT, (req, res) => filesController.getFilesByDiscipline(req, res));
filesRouter.post("/createOneFile", verifyJWT, (req, res) => filesController.createOneFile(req, res))
filesRouter.post("/", verifyJWT, (req, res) => filesController.createFile(req, res));
filesRouter.get("/downloadMultipleFiles", verifyJWT, (req, res) => filesController.downloadMultipleFiles(req, res))
filesRouter.patch("/changeFileVisibility", verifyJWT, (req, res) => filesController.changeFileVisibility(req, res))
filesRouter.patch("/updateFile", verifyJWT, (req, res) => filesController.updateFile(req, res))
filesRouter.delete("/:fileID", verifyJWT, (req, res) => filesController.deleteFile(req, res));
filesRouter.get("/:fileID", verifyJWT, (req, res) => filesController.getOneFileMetadata(req, res));

module.exports = filesRouter;
