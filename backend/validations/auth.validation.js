const { z } = require("zod");

const normalizeIndianPhone = (value) => {
  const raw = String(value).trim().replace(/[\s-]/g, "");
  const digits = raw.replace(/\D/g, "");

  if (/^[6-9]\d{9}$/.test(digits)) {
    return `+91${digits}`;
  }

  if (/^91[6-9]\d{9}$/.test(digits)) {
    return `+${digits}`;
  }

  if (/^0[6-9]\d{9}$/.test(digits)) {
    return `+91${digits.slice(1)}`;
  }

  if (/^\+91[6-9]\d{9}$/.test(raw)) {
    return raw;
  }

  return String(value);
};

const phoneSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null) {
      return value;
    }

    return normalizeIndianPhone(value);
  },
  z
    .string()
    .regex(
      /^\+91[6-9]\d{9}$/,
      "Enter a valid Indian mobile number (e.g. 9876543210 or +919876543210)"
    )
);

const registerSchema = z.object({
  name: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  phone: phoneSchema.optional(),
  role: z.enum(["user", "admin"]).default("user"),
}).refine((data) => {
  if (data.role === "user") {
    return Boolean(data.phone);
  }

  return true;
}, {
  message: "Phone is required when role is user",
  path: ["phone"],
});

const loginSchema = z
  .object({
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    phone: phoneSchema.optional(),
    otp: z.string().length(6).optional(),
  })
  .refine((data) => {
    const emailLogin = Boolean(data.email && data.password);
    const phoneLogin = Boolean(data.phone);

    return emailLogin || phoneLogin;
  }, {
    message: "Provide email+password OR phone",
  });

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(20),
  newPassword: z.string().min(6),
});

const verifyTwoFactorSchema = z.object({
  challengeId: z.string().uuid(),
  otp: z.string().length(6),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyTwoFactorSchema,
};