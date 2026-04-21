const express = require("express");
const router = express.Router();
const adminRouter = express.Router();
const userRouter = express.Router();
const controller = require("../controllers/appointment.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.use(authMiddleware);

adminRouter.use(role("admin"));
adminRouter.get("/", controller.getAppointments);
adminRouter.put("/:id", controller.updateAppointment);
adminRouter.delete("/:id", controller.deleteAppointment);
adminRouter.post("/:id/cancel", controller.cancelAppointment);
adminRouter.post("/:id/reschedule", controller.rescheduleAppointment);
adminRouter.get("/slots/availability", controller.getSlotAvailability);

userRouter.use(role("user"));
userRouter.get("/", controller.getAppointments);
userRouter.post("/", controller.createAppointment);
userRouter.put("/:id", controller.updateAppointment);
userRouter.delete("/:id", controller.deleteAppointment);
userRouter.post("/:id/cancel", controller.cancelAppointment);
userRouter.post("/:id/reschedule", controller.rescheduleAppointment);
userRouter.get("/slots/availability", controller.getSlotAvailability);

router.use("/admin", adminRouter);
router.use("/user", userRouter);

module.exports = router;