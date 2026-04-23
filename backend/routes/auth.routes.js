const express = require("express");
const router = express.Router();

const { validate, authMiddleware } = require("../middleware/auth.middleware");
const controller = require("../controllers/auth.controller");

const {
  registerSchema,
  loginSchema,
  verifyTwoFactorSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validations/auth.validation");

router.post( "/register", validate(registerSchema),controller.register );

router.post("/login",validate(loginSchema),controller.login);

router.post("/verify-2fa",validate(verifyTwoFactorSchema), controller.verifyTwoFactor );
router.post("/verify-phone", authMiddleware, controller.verifyPhoneLogin);

router.post( "/forgot-password", validate(forgotPasswordSchema), controller.forgotPassword);

router.post( "/reset-password", validate(resetPasswordSchema), controller.resetPassword);

router.get("/profile", authMiddleware, (req, res) => {res.json({
    message: "Profile fetched successfully",
    user: req.user,
  });
});

module.exports = router;