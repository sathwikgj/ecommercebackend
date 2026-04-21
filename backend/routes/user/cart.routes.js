const router = require("express").Router();
const controller = require("../../controllers/user/cart.controller");
const role = require("../../middleware/role.middleware");
const { authMiddleware } = require("../../middleware/auth.middleware");

router.use(authMiddleware, role("user"));
router.get("/", controller.getCart);
router.post("/", controller.addToCart);
router.put("/:id", controller.updateCartItem);
router.delete("/:id", controller.removeCartItem);

module.exports = router;
