const { hashPassword, comparePassword } = require("../utils/common");
const { generateToken } = require("../utils/jwt");
const crypto = require("crypto");
const prisma = require("../prisma/client");
const {
  sendRegistrationSampleEmail,
  sendPasswordResetEmail,
  sendTwoFactorOtpEmail,
} = require("../services/email.service");
const { sendOtpToPhone, verifyPhoneOtp } = require("../services/otp.service");

const isProduction = process.env.NODE_ENV === "production";
const isTwoFactorEnabled = process.env.ENABLE_2FA === "true";
const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const buildAuthResponse = (user, tokenRole) => {
  const tokenPayload = {
    id: user.id,
    role: tokenRole,
  };

  let adminAccess;
  if (tokenRole === "admin" && user.roles) {
    const roles = user.roles.map((item) => item.role.name);
    const permissions = user.roles.flatMap((item) =>
      item.role.permissions.map((permissionItem) => ({
        role: item.role.name,
        module: permissionItem.permission.module,
        action: permissionItem.permission.action,
      }))
    );

    tokenPayload.roles = roles;
    tokenPayload.permissions = permissions;
    adminAccess = { roles, permissions };
  }

  const token = generateToken(tokenPayload);
  return {
    message: "Login successful",
    token,
    ...(adminAccess ? { adminAccess } : {}),
  };
};

const register = async (req, res) => {
  try {
    const { name, email, password, phone, role = "user" } = req.body;

    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin || existingUserByEmail) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    if (role === "admin") {
      const shouldForceResetOnFirstLogin =
        normalizeEmail(password) === normalizeEmail(email);

      const admin = await prisma.admin.create({
        data: {
          name,
          email,
          password: hashedPassword,
          mustResetPassword: shouldForceResetOnFirstLogin,
        },
      });

      const emailResult = await sendRegistrationSampleEmail({
        toEmail: email,
        name,
      });

      return res.status(201).json({
        message: "Admin registered successfully",
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: "admin",
          status: admin.status,
          mustResetPassword: admin.mustResetPassword,
          createdAt: admin.createdAt,
        },
        emailStatus: emailResult.message,
      });
    }

    const existingUserByPhone = await prisma.user.findUnique({
      where: { phone },
    });
    if (existingUserByPhone) {
      return res.status(400).json({ message: "Phone already exists" });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
      },
    });

    const emailResult = await sendRegistrationSampleEmail({
      toEmail: email,
      name,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: "user",
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        createdAt: user.createdAt,
      },
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
    let tokenRole = "user";

    if (email && password) {
      user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        const admin = await prisma.admin.findUnique({
          where: { email },
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!admin) {
          return res.status(400).json({ message: "User not found" });
        }

        const isAdminPasswordMatch = await comparePassword(password, admin.password);
        if (!isAdminPasswordMatch) {
          return res.status(400).json({ message: "Invalid password" });
        }

        const shouldForceReset =
          admin.mustResetPassword &&
          normalizeEmail(password) === normalizeEmail(admin.email);
        if (shouldForceReset) {
          return res.status(403).json({
            message:
              "Password reset required on first admin login. Use forgot password flow.",
            mustResetPassword: true,
          });
        }

        user = admin;
        tokenRole = "admin";
      }

      if (tokenRole === "user") {
        const isMatch = await comparePassword(password, user.password);

        if (!isMatch) {
          return res.status(400).json({ message: "Invalid password" });
        }
      }
    } else if (phone) {
      user = await prisma.user.findUnique({
        where: { phone },
      });

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

    if (
      isTwoFactorEnabled &&
      email &&
      password &&
      tokenRole === "admin"
    ) {
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const otp = String(Math.floor(100000 + Math.random() * 900000));
      const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

      const otpEmailResult = await sendTwoFactorOtpEmail({
        toEmail: user.email,
        name: user.name,
        otp,
      });
      if (!otpEmailResult.sent) {
        return res.status(400).json({ message: otpEmailResult.message });
      }

      await prisma.twoFactorSession.deleteMany({ where: { adminId: user.id } });
      const session = await prisma.twoFactorSession.create({
        data: {
          accountType: "ADMIN",
          method: "EMAIL_OTP",
          adminId: user.id,
          otpHash,
          expiresAt,
        },
      });

      return res.status(200).json({
        message: "2FA OTP sent to registered email",
        twoFactorRequired: true,
        challengeId: session.id,
      });
    }

    return res.json(buildAuthResponse(user, tokenRole));
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

const verifyTwoFactor = async (req, res) => {
  try {
    const { challengeId, otp } = req.body;
    const session = await prisma.twoFactorSession.findUnique({
      where: { id: challengeId },
      include: {
        user: true,
        admin: {
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: { permission: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!session) {
      return res.status(400).json({ message: "Invalid 2FA challenge" });
    }

    if (Date.now() > session.expiresAt.getTime()) {
      await prisma.twoFactorSession.delete({ where: { id: session.id } });
      return res.status(400).json({ message: "2FA challenge expired" });
    }

    if (session.method === "PHONE_OTP") {
      const otpVerification = await verifyPhoneOtp(session.phone, otp);
      if (!otpVerification.verified) {
        return res.status(400).json({ message: otpVerification.message });
      }

      const user = session.user;
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      await prisma.twoFactorSession.delete({ where: { id: session.id } });
      return res.status(200).json(buildAuthResponse(user, "user"));
    }

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    if (otpHash !== session.otpHash) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const admin = session.admin;
    if (!admin) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.twoFactorSession.delete({ where: { id: session.id } });
    return res.status(200).json(buildAuthResponse(admin, "admin"));
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
    });
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    let emailResult;

    if (user) {
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });
      await prisma.passwordResetToken.create({
        data: {
          token: resetTokenHash,
          userId: user.id,
          expiresAt,
        },
      });

      emailResult = await sendPasswordResetEmail({
        toEmail: user.email,
        name: user.name,
        resetToken,
      });
    } else {
      const admin = await prisma.admin.findUnique({
        where: { email },
      });

      if (!admin) {
        return res.status(404).json({ message: "User not found" });
      }

      await prisma.adminPasswordResetToken.deleteMany({
        where: { adminId: admin.id },
      });
      await prisma.adminPasswordResetToken.create({
        data: {
          token: resetTokenHash,
          adminId: admin.id,
          expiresAt,
        },
      });

      emailResult = await sendPasswordResetEmail({
        toEmail: admin.email,
        name: admin.name,
        resetToken,
      });
    }

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
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const tokenData = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
    });
    const adminTokenData = tokenData
      ? null
      : await prisma.adminPasswordResetToken.findUnique({
          where: { token: tokenHash },
        });

    if (!tokenData && !adminTokenData) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    const activeToken = tokenData || adminTokenData;
    if (Date.now() > activeToken.expiresAt.getTime()) {
      if (tokenData) {
        await prisma.passwordResetToken.delete({ where: { token: tokenHash } });
      } else {
        await prisma.adminPasswordResetToken.delete({ where: { token: tokenHash } });
      }
      return res.status(400).json({ message: "Reset token expired" });
    }

    const hashedPassword = await hashPassword(newPassword);

    if (tokenData) {
      const user = await prisma.user.findUnique({
        where: { id: tokenData.userId },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      await prisma.passwordResetToken.delete({
        where: { token: tokenHash },
      });
    } else {
      const admin = await prisma.admin.findUnique({
        where: { id: adminTokenData.adminId },
      });

      if (!admin) {
        return res.status(404).json({ message: "User not found" });
      }

      await prisma.admin.update({
        where: { id: admin.id },
        data: {
          password: hashedPassword,
          mustResetPassword: false,
        },
      });
      await prisma.adminPasswordResetToken.delete({
        where: { token: tokenHash },
      });
    }

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
  verifyTwoFactor,
  forgotPassword,
  resetPassword,
};