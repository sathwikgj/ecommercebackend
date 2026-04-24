
const prisma = require("../prisma/client");

exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    const {password: _, ...userData} = users;
    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const {password: _, ...userData} = user;
    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// exports.createUser = async (req, res) => {
//   try {
//     let { name, email, password, phone } = req.body;

//     const existingUser = await prisma.user.findUnique({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists" });
//     }
//     if (!email || !password || !name || !phone) {
//       return res.status(400).json({ message: "Enter all the details" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await prisma.user.create({
//       data: {
//         name,
//         email,
//         password: hashedPassword,
//         phone,
//       },
//     });
//     const {password: _ , ...userData} = user;
//     res.status(201).json(userData);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

exports.updateUser = async (req, res) => {
  try {
    let {name,email,phone}= req.body;
    const existingUser = await prisma.user.findUnique({
      where: { email } || {phone},
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, email, phone },
    });

    const {password: _, ...userData} = user;
    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    // let { email, password }= req.body;
    await prisma.user.delete({
      where: { id: req.params.id },
    }) || await prisma.admin.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};