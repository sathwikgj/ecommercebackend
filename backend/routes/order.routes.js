const router = require("express").Router();
const controller = require("../controllers/order.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.use(authMiddleware);

router.get("/",role("admin","user"), controller.getOrders);
router.get("/:id", role("admin","user"), controller.getOrder);
router.post("/",role("user"), controller.createOrder);
router.put("/:id/status",role("admin"), controller.updateOrderStatus);
router.put("/:id", role("admin","user"), controller.updateOrder);
router.put("/:id", role("admin","user"), controller.cancelOrder);
router.get("/history/:id", role("admin","user"), controller.getOrderHistory);

module.exports = router;