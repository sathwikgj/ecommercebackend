const express = require("express");
const router = express.Router();

const { validate, authMiddleware } = require("../middleware/auth.middleware");
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validations/auth.validation");
const controller = require("../controllers/auth.controller");

router.post("/register", validate(registerSchema), controller.register);

router.post("/login", validate(loginSchema), controller.login);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  controller.forgotPassword
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  controller.resetPassword
);

router.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: "Profile data", user: req.user });
});

module.exports = router;