const router = require("express").Router();
const controller = require("../controllers/shipment.controller");

router.post("/", controller.createShipment);
router.put("/status", controller.updateShipmentStatus);
router.get("/track/:trackingId", controller.trackShipment);

module.exports = router;