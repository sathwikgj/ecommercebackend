const router = require("express").Router();
const controller = require("../../controllers/user/address.controller");
const role = require("../../middleware/role.middleware");
const { authMiddleware } = require("../../middleware/auth.middleware");

router.use(authMiddleware, role("user", "admin"));
router.get("/", controller.getAddresses);
router.get("/:id", controller.getAddress);
router.post("/", controller.createAddress);
router.put("/:id", controller.updateAddress);
router.delete("/:id", controller.deleteAddress);

module.exports = router;
