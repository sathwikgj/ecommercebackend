const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(5).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(10).max(15),
  role: z.enum(["user", "admin"]).default("user"),
});

const loginSchema = z
  .object({
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    phone: z.string().min(10).max(15).optional(),
    otp: z.string().length(6).optional(),
  })
  .refine((data) => {
    return (
      (data.email && data.password) ||
      (data.phone && (!data.otp || data.otp))
    );
  }, {
    message: "Provide email+password OR phone (with/without OTP)",
  });

module.exports = { registerSchema, loginSchema };