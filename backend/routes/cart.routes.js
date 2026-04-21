const router = require("express").Router();
const controller = require("../controllers/cart.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

router.use(auth);

router.get("/",role("user"), controller.getCart);
router.post("/",role("user"), controller.addToCart);
router.put("/:id",role("user"), controller.updateCartItem);
router.delete("/:id", role("user"), controller.removeCartItem);


module.exports = router;