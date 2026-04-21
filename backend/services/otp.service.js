const twilio = require("twilio");

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

const client =
  twilioAccountSid && twilioAuthToken
    ? twilio(twilioAccountSid, twilioAuthToken)
    : null;

const sendOtpToPhone = async (phone) => {
  if (!client || !twilioVerifyServiceSid) {
    return {
      sent: false,
      message: "Twilio OTP service is not configured",
    };
  }

  await client.verify.v2
    .services(twilioVerifyServiceSid)
    .verifications.create({ to: phone, channel: "sms" });

  return {
    sent: true,
    message: "OTP sent to mobile number",
  };
};

const verifyPhoneOtp = async (phone, otp) => {
  if (!client || !twilioVerifyServiceSid) {
    return {
      verified: false,
      message: "Twilio OTP service is not configured",
    };
  }

  const verificationCheck = await client.verify.v2
    .services(twilioVerifyServiceSid)
    .verificationChecks.create({ to: phone, code: otp });

  if (verificationCheck.status !== "approved") {
    return {
      verified: false,
      message: "Invalid or expired OTP",
    };
  }

  return {
    verified: true,
    message: "OTP verified successfully",
  };
};

module.exports = {
  sendOtpToPhone,
  verifyPhoneOtp,
};
