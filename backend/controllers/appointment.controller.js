const prisma = require("../prisma/client");

exports.getAppointments = async (req, res) => {
  try {
    if (req.user.role === "ADMIN") {
      appointments = await prisma.appointment.findMany({
        include: { user: true, slot: true },
      });
    } else {
      appointments = await prisma.appointment.findMany({
        where: { userId: req.user.id },
        include: { slot: true },
      });
    }
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching appointments" });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const { userId, slotId } = req.body;
    const slot = await prisma.appointmentSlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    const bookingCount = await prisma.appointment.count({
      where: {
        slotId,
        status: {
          not: "CANCELLED", 
        },
      },
    });
    if (bookingCount >= slot.capacity) {
      return res.status(400).json({ message: "Slot is full" });
    }
    const appointment = await prisma.appointment.create({
      data: {
        userId,
        slotId,
        status: "BOOKED",
      },
    });
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: "Error creating appointment" });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    if ( req.user.role !== "ADMIN" && appointment.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const updateAppointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updateAppointment);
  } catch (err) {
    res.status(500).json({ message: "Error updating appointment" });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    if ( req.user.role !== "ADMIN" && appointment.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    await prisma.appointment.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting appointment" });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const {reason} = req.body;
    if (!reason) {
      return res.status(400).json({ message: "Reason is required" });
    }
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    if ( req.user.role !== "ADMIN" && appointment.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (appointment.status === "CANCELLED") {
      return res.status(400).json({ message: "Already cancelled" });
    }
    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: "CANCELLED",
        reason,
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error cancelling appointment" });
  }
};

exports.rescheduleAppointment = async (req, res) => {
  try {
    const { slotId, reason } = req.body;
    if (!slotId) {
      return res.status(400).json({ message: "slotId is required" });
    }
    const slot = await prisma.appointmentSlot.findUnique({
      where: { id: slotId },
    });
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    const bookingCount = await prisma.appointment.count({
      where: {
        slotId,
        status: {
          not: "CANCELLED",
        },
      },
    });
    if (bookingCount >= slot.capacity) {
      return res.status(400).json({ message: "Slot is full" });
    }
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: {
        slotId,
        reason,
        status: "RESCHEDULED",
      },
    });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: "Error rescheduling appointment" });
  }
};


exports.getSlotAvailability = async (req, res) => {
  try {
    const slots = await prisma.appointmentSlot.findMany();
    const result = await Promise.all(
      slots.map(async (slot) => {
        const bookedCount = await prisma.appointment.count({
          where: {
            slotId: slot.id,
            status: {
              not: "CANCELLED",
            },
          },
        });

        const available = slot.capacity - bookedCount;

        return {
          id: slot.id,
          date: slot.date,
          time: slot.time,
          capacity: slot.capacity,
          booked: bookedCount,
          available: available < 0 ? 0 : available,
          isFull: bookedCount >= slot.capacity,
        };
      })
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Error fetching slot availability" });
  }
};