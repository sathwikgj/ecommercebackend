const base = require("../order.controller");

module.exports = {
  getOrders: base.getOrders,
  getOrder: base.getOrder,
  createOrder: base.createOrder,
  updateOrder: base.updateOrder,
  cancelOrder: base.cancelOrder,
  getOrderHistory: base.getOrderHistory,
};
