const express = require("express");
const reviewsController = require("../controllers/reviewsController.js");
const verifyJWT = require("../middlewares/verifyJWT.js");

const reviewsRouter = express.Router();

reviewsRouter.get("/:reviewID", verifyJWT, (req, res) => reviewsController.getReviewData(req, res))
reviewsRouter.post("/", verifyJWT, (req, res) => reviewsController.createReviewRequest(req, res));
reviewsRouter.delete("/:reviewID", verifyJWT, (req, res) => reviewsController.cancelReviewRequest(req, res));
reviewsRouter.put("/", verifyJWT, (req, res) => reviewsController.setReviewedFile(req, res));

module.exports = reviewsRouter;
