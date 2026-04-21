const prisma = require("../prisma/client");

exports.getCart = async (req, res) => {
    try {
      const {userId} = req.user.id;
      const cart = await prisma.cart.findMany({
          where: { userId },
          include: {
            product : true,
            variant : true,
            quantity : true
          }
      });
      res.json(cart);
    } catch (err) {
        res.status(500).json({ message: "Error fetching cart" });
    }
};

exports.updateCartItem = async (req, res) => {
  try {
    const id = req.params.id;
    const { quantity } = req.body;
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }
    const item = await prisma.cart.findUnique({
      where: { id },
    });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    if (item.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const variant = await prisma.variant.findUnique({
      where: { id: item.variantId },
    });
    if (quantity > variant.stock) {
      return res.status(400).json({ message: "Stock exceeded" });
    }
    const updated = await prisma.cart.update({
      where: { id },
      data: { quantity },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating cart"});
  }
};

exports.removeCartItem = async (req, res) => { 
    try {
        await prisma.cart.delete({
            where : {id : req.params.id}
        });

        res.json({message : "item removed from cart"});
    } catch (err) {
        res.status(500).json({ message: "Error removing item from cart" });
    }
};

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, variantId, quantity = 1 } = req.body;
    const variant = await prisma.variant.findUnique({
      where: { id: variantId },
      select: { id: true, stock: true },
    });
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }
    const cartItem = await prisma.cart.upsert({
      where: {
        userId_productId_variantId: {
          userId,
          productId,
          variantId,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        userId,
        productId,
        variantId,
        quantity,
      },
    });
    if (cartItem.quantity > variant.stock) {
      await prisma.cart.update({
        where: { id: cartItem.id },
        data: {
          quantity: { decrement: quantity },
        },
      });
      return res.status(400).json({ message: "Stock exceeded" });
    }
    res.json(cartItem);

  } catch (err) {
    res.status(500).json({ message: "Error adding to cart" });
  }
};