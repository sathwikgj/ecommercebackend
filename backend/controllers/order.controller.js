const prisma = require("../prisma/client");

exports.getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {createdAt : "desc"},
      include: {
        user: true,
        orderItems: {
          include: {
            product: true,
            variant: true,
            payment: true,
          },
        },
      },
      });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders" });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include:{
        user: true,
        orderItems: {
          include: {
            product: true,
            variant: true,
            payment: true,
          },
        },
      }
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Error fetching order" });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const {items} = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "add ateleast one item" });
    }
    for(let item of items){
      const product = await prisma.product.findUnique({
      where: { id: item.productId },
      });
      if (!product) {
        return res.status(400).json({ message: `Product with id ${item.productId} not found` });
      }
      const variant = await prisma.variant.findUnique({
        where: { id: item.variantId },
      });
      if (!variant) {
        return res.status(400).json({ message: `Variant with id ${item.variantId} not found` });
      }
      if (variant.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for variant ${variant.id}` });
      }
      await prisma.variant.update({
        where: { id: item.variantId },
        data: { stock: variant.stock - item.quantity },
      });
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: variant.price,
          },
        });
      }
  res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Error creating order" });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Error updating order" });
  }
};


exports.updateOrderStatus = async (req, res) => {
  try {
    const orderStatus = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    res.json(orderStatus);
  } catch (err) {
    res.status(500).json({ message: "Error updating order status" });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const { reason } = req.body;
    const order = await prisma.order.findUnique({
      where: { id },
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if ( req.user.role !== "ADMIN" && order.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (order.status === "DELIVERED") {
      return res.status(400).json({
        message: "Delivered order cannot be cancelled",
      });
    }
    if (order.status === "CANCELLED") {
      return res.status(400).json({
        message: "Already cancelled",
      });
    }
    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelReason: reason || "User cancelled",
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error cancelling order" });
  }
};

exports.getOrderHistory = async (req, res) => {
  try {
    const { userId } = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        payment: true,
      },
    });

    res.json(orders);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching order history" });
  }
};