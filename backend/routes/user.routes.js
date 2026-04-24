const express = require("express");
const router = express.Router();
const adminRouter = express.Router();
const userRouter = express.Router();
const controller = require("../controllers/user.controller");
const role = require("../middleware/role.middleware");
const { authMiddleware } = require("../middleware/auth.middleware");

router.use(authMiddleware);

adminRouter.use(role("admin"));
adminRouter.get("/", controller.getUsers);
adminRouter.get("/:id", controller.getUser);
adminRouter.post("/", controller.createUser);
adminRouter.put("/:id", controller.updateUser);
adminRouter.delete("/:id", controller.deleteUser);

userRouter.use(role("user", "admin"));
userRouter.get("/:id", controller.getUser);
userRouter.post("/", controller.createUser);
userRouter.put("/:id", controller.updateUser);
userRouter.delete("/:id", controller.deleteUser);

router.use("/admin", adminRouter);
router.use("/user", userRouter);

module.exports = router;