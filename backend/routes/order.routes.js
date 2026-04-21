const express = require("express");
const router = express.Router();
const adminRouter = express.Router();
const userRouter = express.Router();
const controller = require("../controllers/order.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.use(authMiddleware);

// Admin order management routes
adminRouter.use(role("admin"));
adminRouter.get("/", controller.getOrders);
adminRouter.get("/:id", controller.getOrder);
adminRouter.put("/:id/status", controller.updateOrderStatus);
adminRouter.put("/:id", controller.updateOrder);
adminRouter.put("/:id/cancel", controller.cancelOrder);
adminRouter.get("/history/:id", controller.getOrderHistory);

// User order routes
userRouter.use(role("user"));
userRouter.get("/", controller.getOrders);
userRouter.get("/:id", controller.getOrder);
userRouter.post("/", controller.createOrder);
userRouter.put("/:id", controller.updateOrder);
userRouter.put("/:id/cancel", controller.cancelOrder);
userRouter.get("/history/:id", controller.getOrderHistory);

router.use("/admin", adminRouter);
router.use("/user", userRouter);

module.exports = router;