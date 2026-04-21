const express = require("express");
const router = express.Router();
const adminRouter = express.Router();
const userRouter = express.Router();
const controller = require("../controllers/user.controller");
const role = require("../middleware/role.middleware");
const { authMiddleware } = require("../middleware/auth.middleware");

router.use(authMiddleware);

// Admin-only user management routes
adminRouter.use(role("admin"));
adminRouter.get("/", controller.getUsers);
adminRouter.get("/:id", controller.getUser);
adminRouter.post("/", controller.createUser);
adminRouter.put("/:id", controller.updateUser);
adminRouter.delete("/:id", controller.deleteUser);

// User self-service routes
userRouter.use(role("user", "admin"));
userRouter.put("/:id", controller.updateUser);

router.use("/admin", adminRouter);
router.use("/user", userRouter);

module.exports = router;