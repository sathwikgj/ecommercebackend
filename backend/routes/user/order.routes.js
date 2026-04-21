const router = require("express").Router();
const controller = require("../../controllers/user/order.controller");
const role = require("../../middleware/role.middleware");
const { authMiddleware } = require("../../middleware/auth.middleware");

router.use(authMiddleware, role("user"));
router.get("/", controller.getOrders);
router.get("/:id", controller.getOrder);
router.post("/", controller.createOrder);
router.put("/:id", controller.updateOrder);
router.put("/:id/cancel", controller.cancelOrder);
router.get("/history/:id", controller.getOrderHistory);

module.exports = router;
