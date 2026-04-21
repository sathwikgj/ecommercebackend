const router = require("express").Router();
const controller = require("../controllers/review.controller");

router.get("/", controller.getReviews);
router.get("/:id", controller.getReview);
router.post("/", controller.createReview);
router.put("/:id/status", controller.updateReviewStatus);
router.delete("/:id", controller.deleteReview);

module.exports = router;