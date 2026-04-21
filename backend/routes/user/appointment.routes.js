const router = require("express").Router();
const controller = require("../../controllers/user/appointment.controller");
const role = require("../../middleware/role.middleware");
const { authMiddleware } = require("../../middleware/auth.middleware");

router.use(authMiddleware, role("user"));
router.get("/", controller.getAppointments);
router.post("/", controller.createAppointment);
router.put("/:id", controller.updateAppointment);
router.delete("/:id", controller.deleteAppointment);
router.post("/:id/cancel", controller.cancelAppointment);
router.post("/:id/reschedule", controller.rescheduleAppointment);
router.get("/slots/availability", controller.getSlotAvailability);

module.exports = router;
