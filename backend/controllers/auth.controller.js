const { hashPassword, comparePassword } = require("../utils/common");
const { generateToken } = require("../utils/jwt");
const { sendRegistrationSampleEmail } = require("../services/email.service");
const { sendOtpToPhone, verifyPhoneOtp } = require("../services/otp.service");

const users = []; 

const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = users.find(
      (u) => u.email === email || u.phone === phone
    );

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const user = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    };

    users.push(user);

    const emailResult = await sendRegistrationSampleEmail({
      toEmail: email,
      name,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user,
      emailStatus: emailResult.message,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, phone, otp } = req.body;

    let user;

    if (email && password) {
      user = users.find((u) => u.email === email);

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      const isMatch = await comparePassword(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Invalid password" });
      }
    } else if (phone) {
      user = users.find((u) => u.phone === phone);

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      if (!otp) {
        const otpResult = await sendOtpToPhone(phone);

        return res.status(200).json({
          message: otpResult.message,
          otpSent: otpResult.sent,
        });
      }

      const otpVerification = await verifyPhoneOtp(phone, otp);

      if (!otpVerification.verified) {
        return res.status(400).json({ message: otpVerification.message });
      }
    }

    const token = generateToken({
      id: user.id,
      role: user.role,
    });

    return res.json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login,
};