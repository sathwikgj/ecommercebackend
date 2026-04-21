const router = require("express").Router();
const controller = require("../controllers/address.controller");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
router.use(auth);

router.get("/",role("admin","user"), controller.getAddresses);
router.get("/:id", role("admin","user"), controller.getAddress);
router.post("/", role("admin","user"), controller.createAddress);
router.put("/:id", role("admin","user"), controller.updateAddress);
router.delete("/:id", role("admin","user"), controller.deleteAddress);
module.exports = router;