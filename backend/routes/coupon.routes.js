const router = require("express").Router();
const controller = require("../controllers/coupon.controller");

router.get("/", controller.getCoupons);
router.get("/:id", controller.getCoupon);
router.post("/", controller.createCoupon);
router.put("/:id", controller.updateCoupon);
router.delete("/:id", controller.deleteCoupon);
router.post("/:id/apply", controller.applyCoupon);

module.exports = router;    