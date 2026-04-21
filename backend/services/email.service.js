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

module.exports = {
  sendRegistrationSampleEmail,
};
