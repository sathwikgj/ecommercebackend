const { hashPassword, comparePassword } = require("../utils/common");
const { generateToken } = require("../utils/jwt");
const crypto = require("crypto");
const {
  sendRegistrationSampleEmail,
  sendPasswordResetEmail,
} = require("../services/email.service");
const { sendOtpToPhone, verifyPhoneOtp } = require("../services/otp.service");

const users = []; 
const passwordResetTokens = new Map();

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

        if (!otpResult.sent) {
          return res.status(400).json({ message: otpResult.message });
        }

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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 15 * 60 * 1000;

    passwordResetTokens.set(resetToken, {
      userId: user.id,
      expiresAt,
    });

    const emailResult = await sendPasswordResetEmail({
      toEmail: user.email,
      name: user.name,
      resetToken,
    });

    return res.status(200).json({
      message: "Reset password email flow completed",
      emailStatus: emailResult.message,
      // Useful during API testing before frontend reset page exists.
      resetToken,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const tokenData = passwordResetTokens.get(token);

    if (!tokenData) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    if (Date.now() > tokenData.expiresAt) {
      passwordResetTokens.delete(token);
      return res.status(400).json({ message: "Reset token expired" });
    }

    const user = users.find((u) => u.id === tokenData.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = await hashPassword(newPassword);
    passwordResetTokens.delete(token);

    return res.status(200).json({
      message: "Password reset successful",
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};