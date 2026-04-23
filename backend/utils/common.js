const bcrypt = require("bcrypt");

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
const hashValue = async (value) => {
  const saltRounds = 10;
  return bcrypt.hash(value, saltRounds);
};

const compareValue = async (value, hash) => {
  return bcrypt.compare(value, hash);
};

module.exports = {
  hashPassword,
  comparePassword,
  hashValue,
  compareValue,
};