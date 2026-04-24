
const { hashPassword, comparePassword } = require("../utils/common");
const { generateToken } = require("../utils/jwt");
const crypto = require("crypto");
const prisma = require("../prisma/client");

const {
  sendRegistrationSampleEmail,
  sendPasswordResetEmail,
} = require("../services/email.service");

const { sendOtpToPhone, verifyPhoneOtp } = require("../services/otp.service");
const { createQR, verifyOTP } = require("../services/twoFactor.service");

const register = async (req, res) => {
  try {
    const { name, email, password, phone, role = "user" } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields required" });
    }
    const existingUser =
      (await prisma.user.findUnique({ where: { email } })) ||
      (await prisma.admin.findUnique({ where: { email } }));
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await hashPassword(password);
    if (role === "admin") {
      const admin = await prisma.admin.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          twoFactorSecret: null,
          isTwoFactorEnabled: false,
        },
      });
      await sendRegistrationSampleEmail({ toEmail: email, name });
      return res.json({ message: "Admin registered", admin });
    }
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, phone },
    });
    await sendRegistrationSampleEmail({ toEmail: email, name });
    return res.json({ message: "User registered", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, phone, otp } = req.body;
    if (email && password) {
      let user = await prisma.user.findUnique({ where: { email } });
      let role = "user";
      if (!user) {
        user = await prisma.admin.findUnique({ where: { email } });
        role = "admin";
      }
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid password" });
      }
      if (role === "admin") {
        if (!user.twoFactorSecret) {
          const { secret, qr } = await createQR(user.email);
          await prisma.admin.update({
            where: { id: user.id },
            data: { twoFactorSecret: secret },
          });
          return res.json({
            message: "Scan QR with Google Authenticator",
            qr,
            setup: true,
          });
        }
        const session = await prisma.twoFactorSession.create({
          data: {
            accountType: "ADMIN",
            adminId: user.id,
            method: "TOTP",
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          },
        });
        return res.json({
          message: "Enter OTP from Authenticator",
          requires2FA: true,
          sessionId: session.id,
        });
      }
      return res.json(buildAuthResponse(user, role));
    }
    if (phone) {
      let user = await prisma.user.findFirst({ where: { phone } });
      let role = "user";
      if (!user) {
        user = await prisma.admin.findFirst({ where: { phone } });
        role = "admin";
      }
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      if (!otp) {
        const result = await sendOtpToPhone(phone);
        return res.json({
          message: result.message,
          otpSent: result.sent,
        });
      }
      const verify = await verifyPhoneOtp(phone, otp);
      if (!verify.verified) {
        return res.status(400).json({ message: verify.message });
      }
      if (role === "admin") {
        const session = await prisma.twoFactorSession.create({
          data: {
            accountType: "ADMIN",
            adminId: user.id,
            method: "PHONE_OTP",
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          },
        });

        return res.json({
          message: "Phone verified. Proceed with 2FA",
          requires2FA: true,
          sessionId: session.id,
        });
      }

      return res.json(buildAuthResponse(user, "user"));
    }

    return res.status(400).json({ message: "Invalid login method" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyTwoFactor = async (req, res) => {
  try {
    const { sessionId, otp } = req.body;

    const session = await prisma.twoFactorSession.findUnique({
      where: { id: sessionId },
      include: { admin: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return res.status(400).json({ message: "Session expired" });
    }

    const admin = session.admin;
    let isValid = false;

    if (session.method === "TOTP") {
      const speakeasy = require("speakeasy");

      const cleanOtp = otp.replace(/\s/g, "");

      const expectedOtp = speakeasy.totp({
        secret: admin.twoFactorSecret,
        encoding: "base32",
      });
      console.log("DB Secret:", admin.twoFactorSecret);
      console.log("EXPECTED OTP:", expectedOtp);
      console.log("USER OTP:", cleanOtp);

      isValid = verifyOTP(admin.twoFactorSecret, cleanOtp);

    } else if (session.method === "PHONE_OTP") {
      const verify = await verifyPhoneOtp(admin.phone, otp);
      isValid = verify.verified;
    }

    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: { isTwoFactorEnabled: true },
    });

    await prisma.twoFactorSession.delete({
      where: { id: sessionId },
    });

    return res.json(buildAuthResponse(admin, "admin"));

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyPhoneLogin = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const user = await prisma.user.findFirst({ where: { phone } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const verify = await verifyPhoneOtp(phone, otp);
    if (!verify.verified) {
      return res.status(400).json({ message: verify.message });
    }
    return res.json(buildAuthResponse(user, "user"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
const buildAuthResponse = (user, role) => {
  const token = generateToken({
    id: user.id,
    role,
  });

  return {
    message: "Login successful",
    token,
  };
};
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!user && !admin) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    if (admin) {
      await prisma.adminPasswordResetToken.create({
        data: {
          token,
          adminId: admin.id,
          expiresAt,
        },
      });

      await sendPasswordResetEmail({
        toEmail: admin.email,
        name: admin.name,
        resetToken: token,
      });

    } else {
      await prisma.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt,
        },
      });

      await sendPasswordResetEmail({
        toEmail: user.email,
        name: user.name,
        resetToken: token,
      });
    }

    return res.json({ message: "Reset email sent" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and newPassword required",
      });
    }

    let record = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    let isAdmin = false;

    if (!record) {
      record = await prisma.adminPasswordResetToken.findUnique({
        where: { token },
      });
      isAdmin = true;
    }

    if (!record) {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "Token expired" });
    }

    const hashed = await hashPassword(newPassword);

    if (isAdmin) {
      await prisma.admin.update({
        where: { id: record.adminId },
        data: { password: hashed },
      });

      await prisma.adminPasswordResetToken.delete({
        where: { token },
      });
    } else {
      await prisma.user.update({
        where: { id: record.userId },
        data: { password: hashed },
      });

      await prisma.passwordResetToken.delete({
        where: { token },
      });
    }

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  register,
  login,
  verifyTwoFactor,
  verifyPhoneLogin,
  forgotPassword,
  resetPassword,
};