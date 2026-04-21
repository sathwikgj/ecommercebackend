const { z } = require("zod");

const phoneSchema = z.preprocess(
  (value) => (value === undefined || value === null ? value : String(value)),
  z.string().min(10).max(15)
);

const registerSchema = z.object({
  name: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  phone: phoneSchema,
  role: z.enum(["user", "admin"]).default("user"),
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

module.exports = { registerSchema, loginSchema };