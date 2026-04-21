const { Resend } = require("resend");

const sendRegistrationSampleEmail = async ({ toEmail, name }) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFromEmail = process.env.RESEND_FROM_EMAIL;
  const resend = resendApiKey ? new Resend(resendApiKey) : null;

  if (!resend || !resendFromEmail) {
    return {
      sent: false,
      message:
        "Email service is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL in backend/.env",
    };
  }

  try {
    await resend.emails.send({
      from: resendFromEmail,
      to: toEmail,
      subject: "Welcome to Ecommerce",
      html: `<p>Hi ${name},</p><p>This is a sample registration email from Ecommerce.</p>`,
    });
  } catch (error) {
    return {
      sent: false,
      message: `Email send failed: ${error.message}`,
    };
  }

  return {
    sent: true,
    message: "Sample email sent successfully",
  };
};

const sendPasswordResetEmail = async ({ toEmail, name, resetToken }) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFromEmail = process.env.RESEND_FROM_EMAIL;
  const resend = resendApiKey ? new Resend(resendApiKey) : null;

  if (!resend || !resendFromEmail) {
    return {
      sent: false,
      message:
        "Email service is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL in backend/.env",
    };
  }

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

  try {
    await resend.emails.send({
      from: resendFromEmail,
      to: toEmail,
      subject: "Reset your Ecommerce password",
      html: `<p>Hi ${name},</p><p>Use this link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you did not request this, ignore this email.</p>`,
    });
  } catch (error) {
    return {
      sent: false,
      message: `Email send failed: ${error.message}`,
    };
  }

  return {
    sent: true,
    message: "Password reset email sent successfully",
  };
};

const sendTwoFactorOtpEmail = async ({ toEmail, name, otp }) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFromEmail = process.env.RESEND_FROM_EMAIL;
  const resend = resendApiKey ? new Resend(resendApiKey) : null;

  if (!resend || !resendFromEmail) {
    return {
      sent: false,
      message:
        "Email service is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL in backend/.env",
    };
  }

  try {
    await resend.emails.send({
      from: resendFromEmail,
      to: toEmail,
      subject: "Your Ecommerce login OTP",
      html: `<p>Hi ${name},</p><p>Your login OTP is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
    });
  } catch (error) {
    return {
      sent: false,
      message: `Email send failed: ${error.message}`,
    };
  }

  return {
    sent: true,
    message: "2FA OTP email sent successfully",
  };
};

module.exports = {
  sendRegistrationSampleEmail,
  sendPasswordResetEmail,
  sendTwoFactorOtpEmail,
};
