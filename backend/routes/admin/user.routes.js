const router = require("express").Router();
const controller = require("../../controllers/admin/user.controller");
const role = require("../../middleware/role.middleware");
const { authMiddleware } = require("../../middleware/auth.middleware");

router.use(authMiddleware, role("admin"));
router.get("/", controller.getUsers);
router.get("/:id", controller.getUser);
// router.post("/", controller.createUser);
router.put("/:id", controller.updateUser);
router.delete("/:id", controller.deleteUser);

module.exports = router;
