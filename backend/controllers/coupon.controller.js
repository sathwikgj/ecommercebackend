const prisma = require("../prisma/client");

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      where: {
        status: "ACTIVE",
      }
    });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: "Error fetching coupons" });
  }
};

exports.getCoupon = async (req, res) => {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: req.params.id },
    });
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: "Error fetching coupon" });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    let {name ,code,type, value, expiry, minAmount} = req.body;
    if(!code || !type || !value){
      return res.status(400).json({ message: "Enter all the details" });
    }
    code=code.toUpperCase();
    
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code },
    });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const coupon = await prisma.coupon.create({
      data: {
        name,
        code,
        type,
        value,
        expiry,
        minAmount
      },
    });
    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ message: "Error creating coupon" });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    let {name ,code,type, value, expiry, minAmount} = req.body;
    code = code.toUpperCase();
    const existingCouponCode = await prisma.coupon.findUnique({
      where: { code },
    });
    if (existingCouponCode){
      return res.status(400).json({ message: "Coupon code already exists" });
    }
    const coupon = await prisma.coupon.update({
      where: { id: req.params.id },
      data: {
        name,
        code,
        type,
        value,
        expiry,
        minAmount
      },  
    });
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: "Error updating coupon" });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    await prisma.coupon.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "Coupon deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting coupon" });
  }
};

exports.applyCoupon = async (req, res) => {
  try {
    const { code, amount } = req.body;
    code = code.toUpperCase();
    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });
    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon" });
    }
    if (coupon.status !== "ACTIVE") {
      return res.status(400).json({ message: "Coupon inactive" });
    }
    if (coupon.expiry < new Date()) {
      return res.status(400).json({ message: "Coupon expired" });
    }
    if (coupon.minAmount && amount < coupon.minAmount) {
      return res.status(400).json({ message: "Minimum amount not met" });
    }
    let discount = 0;
    if (coupon.type === "PERCENTAGE") {
      discount = (amount * coupon.value) / 100;
    } else {
      discount = coupon.value;
    }
    res.json({
      discount,
      finalAmount: amount - discount,
    });
  } catch (err) {
    res.status(500).json({ message: "Error applying coupon" });
  }
};