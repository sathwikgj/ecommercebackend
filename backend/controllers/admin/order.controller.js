const base = require("../order.controller");

module.exports = {
  getOrders: base.getOrders,
  getOrder: base.getOrder,
  updateOrderStatus: base.updateOrderStatus,
  updateOrder: base.updateOrder,
  cancelOrder: base.cancelOrder,
  getOrderHistory: base.getOrderHistory,
};
