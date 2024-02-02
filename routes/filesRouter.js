const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT.js");
const filesController = require("../controllers/filesController.js");

const filesRouter = express.Router();

filesRouter.patch("/addComment", verifyJWT, (req, res) => filesController.addComment(req, res))
filesRouter.patch("/editComment", verifyJWT, (req, res) => filesController.editComment(req, res))
filesRouter.delete("/deleteComment/:commentID", verifyJWT, (req, res) => filesController.deleteComment(req, res))

filesRouter.get("/getBinaries/:gridID", (req, res) => filesController.getFileBinaries(req, res));
filesRouter.get("/downloadMultipleFiles/:gridID", (req, res) => filesController.downloadMultipleFiles(req, res));
// filesRouter.post("/createOneFile", verifyJWT, (req, res) => filesController.createOneFile(req, res))
filesRouter.post("/", verifyJWT, (req, res) => filesController.createFile(req, res));
filesRouter.get("/downloadMultipleFiles", verifyJWT, (req, res) => filesController.downloadMultipleFiles(req, res))
filesRouter.patch("/changeFileVisibility", verifyJWT, (req, res) => filesController.changeFileVisibility(req, res))
filesRouter.patch("/updateFile", verifyJWT, (req, res) => filesController.updateFile(req, res))
filesRouter.delete("/:fileID", verifyJWT, (req, res) => filesController.deleteFile(req, res));
filesRouter.get("/getOneFile/:fileID", verifyJWT, (req, res) => filesController.getOneFile(req, res));
filesRouter.get("/", verifyJWT, (req, res) => filesController.getFilesByDiscipline(req, res));



module.exports = filesRouter;
