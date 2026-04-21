const base = require("../appointment.controller");

module.exports = {
  getAppointments: base.getAppointments,
  createAppointment: base.createAppointment,
  updateAppointment: base.updateAppointment,
  deleteAppointment: base.deleteAppointment,
  cancelAppointment: base.cancelAppointment,
  rescheduleAppointment: base.rescheduleAppointment,
  getSlotAvailability: base.getSlotAvailability,
};
