const router = require("express").Router();
const controller = require("../controllers/appointment.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.use(auth);

router.get("/", role("admin","user"), controller.getAppointments);
router.post("/", role("user"), controller.createAppointment);
router.put("/:id", role("admin","user"), controller.updateAppointment);
router.delete("/:id", role("admin","user"), controller.deleteAppointment);
router.post("/:id/cancel", role("admin","user"), controller.cancelAppointment);
router.post("/:id/reschedule", role("admin","user"), controller.rescheduleAppointment);
router.get("/slots/availability", role("admin","user"), controller.getSlotAvailability);

module.exports = router;