const base = require("../cart.controller");

module.exports = {
  getCart: base.getCart,
  addToCart: base.addToCart,
  updateCartItem: base.updateCartItem,
  removeCartItem: base.removeCartItem,
};
