const express = require("express");
const router = express.Router();
const adminRouter = express.Router();
const userRouter = express.Router();
const controller = require("../controllers/address.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.use(authMiddleware);

adminRouter.use(role("admin"));
adminRouter.get("/", controller.getAddresses);
adminRouter.get("/:id", controller.getAddress);
adminRouter.post("/", controller.createAddress);
adminRouter.put("/:id", controller.updateAddress);
adminRouter.delete("/:id", controller.deleteAddress);

userRouter.use(role("user", "admin"));
userRouter.get("/", controller.getAddresses);
userRouter.get("/:id", controller.getAddress);
userRouter.post("/", controller.createAddress);
userRouter.put("/:id", controller.updateAddress);
userRouter.delete("/:id", controller.deleteAddress);

router.use("/admin", adminRouter);
router.use("/user", userRouter);

module.exports = router;