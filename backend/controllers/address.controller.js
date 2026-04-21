const prisma = require("../prisma/client");

exports.getAddresses = async (req, res) => {
  try {
    let addresses;

    if (req.user.role === "ADMIN") {
      addresses = await prisma.address.findMany();
    } else {
      addresses = await prisma.address.findMany({
        where: { userId: req.user.id },
      });
    }
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching addresses" });
  }
};

exports.getAddress = async (req, res) => {
  try {
    const address = await prisma.address.findUnique({
      where: { id: req.params.id },
    });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    if(req.user.role !== "ADMIN" && address.userId !== req.user.id){
      return res.status(403).json({ message: "Unauthorized access" });
    }
    res.json(address);
  } catch (err) {
    res.status(500).json({ message: "Error fetching address" });
  }
};

exports.createAddress = async (req, res) => {
  try {
      let {street, city, state, zipCode} = req.body;
      if(!street || !city || !state || !zipCode){
        return res.status(400).json({ message: "Enter all the details" });
      }

    const address = await prisma.address.create({
      data: {
        street,
        city,
        state,
        zipCode,
        userId: req.user.id,
      }
    });
    res.status(201).json(address);
  } catch (err) {
    res.status(500).json({ message: "Error creating address" });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const address = await prisma.address.findUnique({
      where: { id: req.params.id },
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (req.user.role !== "ADMIN" && address.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const updateAddress = await prisma.address.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updateAddress);
  } catch (err) {
    res.status(500).json({ message: "Error updating address" });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const address = await prisma.address.findUnique({
      where: { id: req.params.id },
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (req.user.role !== "ADMIN" && address.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    } 
    await prisma.address.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "Address deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting address" });
  }
};