const router = require("express").Router();
const controller = require("../../controllers/admin/order.controller");
const role = require("../../middleware/role.middleware");
const { authMiddleware } = require("../../middleware/auth.middleware");

router.use(authMiddleware, role("admin"));
router.get("/", controller.getOrders);
router.get("/:id", controller.getOrder);
router.put("/:id/status", controller.updateOrderStatus);
router.put("/:id", controller.updateOrder);
router.put("/:id/cancel", controller.cancelOrder);
router.get("/history/:id", controller.getOrderHistory);

module.exports = router;
