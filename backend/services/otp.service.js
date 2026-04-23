const twilio = require("twilio");

const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.error(" Twilio credentials missing in .env");
    return null;
  }

  return twilio(accountSid, authToken);
};
const toE164Phone = (phone) => {
  const raw = String(phone).trim().replace(/[\s-]/g, "");
  const digits = raw.replace(/\D/g, "");

  if (/^\+91[6-9]\d{9}$/.test(raw)) return raw;
  if (/^[6-9]\d{9}$/.test(digits)) return `+91${digits}`;
  if (/^91[6-9]\d{9}$/.test(digits)) return `+${digits}`;
  if (/^0[6-9]\d{9}$/.test(digits)) return `+91${digits.slice(1)}`;

  return raw; 
};
const sendOtpToPhone = async (phone) => {
  const client = getTwilioClient();
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!client || !serviceSid) {
    return {
      sent: false,
      message:
        "Twilio not configured. Check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID",
    };
  }

  try {
    const formattedPhone = toE164Phone(phone);

    await client.verify.v2
      .services(serviceSid)
      .verifications.create({
        to: formattedPhone,
        channel: "sms",
      });

    return {
      sent: true,
      message: "OTP sent successfully",
    };
  } catch (error) {
    console.error(" Send OTP Error:", error.message);

    return {
      sent: false,
      message: error.message,
    };
  }
};
const verifyPhoneOtp = async (phone, otp) => {
  const client = getTwilioClient();
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!client || !serviceSid) {
    return {
      verified: false,
      message:
        "Twilio not configured. Check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID",
    };
  }

  try {
    const formattedPhone = toE164Phone(phone);

    const response = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({
        to: formattedPhone,
        code: otp,
      });

    if (response.status !== "approved") {
      return {
        verified: false,
        message: "Invalid or expired OTP",
      };
    }

    return {
      verified: true,
      message: "OTP verified successfully",
    };
  } catch (error) {
    console.error("Verify OTP Error:", error.message);

    return {
      verified: false,
      message: error.message,
    };
  }
};

module.exports = {
  sendOtpToPhone,
  verifyPhoneOtp,
};