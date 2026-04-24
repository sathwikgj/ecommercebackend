const router = require("express").Router();
const controller = require("../../controllers/user/user.controller");
const role = require("../../middleware/role.middleware");
const { authMiddleware } = require("../../middleware/auth.middleware");

router.use(authMiddleware, role("user", "admin"));
router.get("/:id", controller.getUser);
// router.post("/", controller.createUser);
router.delete("/:id", controller.deleteUser);
router.put("/:id", controller.updateUser);

module.exports = router;
