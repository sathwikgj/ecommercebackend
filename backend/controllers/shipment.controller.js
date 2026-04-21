const prisma = require("../prisma/client");

exports.createShipment = async (req, res) => {
  try {
    const { orderId, provider } = req.body;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const trackingId = "ABC" + Date.now();
    const shipment = await prisma.shipment.create({
      data: {
        orderId,
        provider,
        trackingId,
        status: "CREATED",
      },
    });
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ message: "Error creating shipment" });
  }
};

exports.updateShipmentStatus = async (req, res) => {
  try {
    const { trackingId, status } = req.body;
    const shipment = await prisma.shipment.update({
      where: { trackingId },
      data: {
        status,
        shippedAt: status === "SHIPPED" ? new Date() : undefined,
        deliveredAt: status === "DELIVERED" ? new Date() : undefined,
      },
    });
    await prisma.order.update({
      where: { id: shipment.orderId },
      data: { status },
    });
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ message: "Error updating shipment" });
  }
};

exports.trackShipment = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const shipment = await prisma.shipment.findUnique({
      where: { trackingId },
      include: {
        order: true,
      },
    });
    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ message: "Error tracking shipment" });
  }
};