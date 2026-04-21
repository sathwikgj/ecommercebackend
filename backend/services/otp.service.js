const twilio = require("twilio");

const getTwilioClient = () => {
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioApiKey = process.env.TWILIO_API_KEY;
  const twilioApiSecret = process.env.TWILIO_API_SECRET;

  if (twilioAccountSid && twilioAuthToken) {
    return twilio(twilioAccountSid, twilioAuthToken);
  }

  if (twilioApiKey && twilioApiSecret && twilioAccountSid) {
    return twilio(twilioApiKey, twilioApiSecret, { accountSid: twilioAccountSid });
  }

  return null;
};

const toE164Phone = (phone) => {
  const raw = String(phone).trim().replace(/[\s-]/g, "");
  const digits = raw.replace(/\D/g, "");

  if (/^\+91[6-9]\d{9}$/.test(raw)) {
    return raw;
  }

  if (/^[6-9]\d{9}$/.test(digits)) {
    return `+91${digits}`;
  }

  if (/^91[6-9]\d{9}$/.test(digits)) {
    return `+${digits}`;
  }

  if (/^0[6-9]\d{9}$/.test(digits)) {
    return `+91${digits.slice(1)}`;
  }

  return raw;
};

const sendOtpToPhone = async (phone) => {
  const twilioVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  const client = getTwilioClient();

  if (!client || !twilioVerifyServiceSid) {
    return {
      sent: false,
      message:
        "Twilio OTP service is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_VERIFY_SERVICE_SID, and either TWILIO_AUTH_TOKEN or TWILIO_API_KEY + TWILIO_API_SECRET",
    };
  }

  try {
    await client.verify.v2
      .services(twilioVerifyServiceSid)
      .verifications.create({ to: toE164Phone(phone), channel: "sms" });
  } catch (error) {
    return {
      sent: false,
      message: `OTP send failed: ${error.message}`,
    };
  }

  return {
    sent: true,
    message: "OTP sent to mobile number",
  };
};

const verifyPhoneOtp = async (phone, otp) => {
  const twilioVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  const client = getTwilioClient();

  if (!client || !twilioVerifyServiceSid) {
    return {
      verified: false,
      message:
        "Twilio OTP service is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_VERIFY_SERVICE_SID, and either TWILIO_AUTH_TOKEN or TWILIO_API_KEY + TWILIO_API_SECRET",
    };
  }

  let verificationCheck;
  try {
    verificationCheck = await client.verify.v2
      .services(twilioVerifyServiceSid)
      .verificationChecks.create({ to: toE164Phone(phone), code: otp });
  } catch (error) {
    return {
      verified: false,
      message: `OTP verification failed: ${error.message}`,
    };
  }

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
