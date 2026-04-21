const express = require("express");
const router = express.Router();

const { validate, authMiddleware } = require("../middleware/auth.middleware");
const { rateLimit } = require("../middleware/rateLimit.middleware");
const {
  registerSchema,
  loginSchema,
  verifyTwoFactorSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validations/auth.validation");
const controller = require("../controllers/auth.controller");

const registerLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: "Too many register attempts. Please try again later.",
});

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: "Too many login attempts. Please try again later.",
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many forgot password attempts. Please try again later.",
});

const resetPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: "Too many reset password attempts. Please try again later.",
});

const verifyTwoFactorLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  message: "Too many 2FA verification attempts. Please try again later.",
});

router.post("/register", registerLimiter, validate(registerSchema), controller.register);

router.post("/login", loginLimiter, validate(loginSchema), controller.login);
router.post(
  "/verify-2fa",
  verifyTwoFactorLimiter,
  validate(verifyTwoFactorSchema),
  controller.verifyTwoFactor
);
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  controller.forgotPassword
);
router.post(
  "/reset-password",
  resetPasswordLimiter,
  validate(resetPasswordSchema),
  controller.resetPassword
);

router.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: "Profile data", user: req.user });
});

module.exports = router;