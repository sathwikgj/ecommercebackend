const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

const createQR = async (email) => {
  const secret = speakeasy.generateSecret({
    length: 20,
    name: `MyApp (${email})`,
  });

  const qr = await QRCode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    qr,
  };
};

const verifyOTP = (secret, token) => {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1,
  });
};

module.exports = { createQR, verifyOTP };