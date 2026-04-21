const router = require("express").Router();
const controller = require("../controllers/user.controller");
const role = require("../middleware/role.middleware");
const auth = require("../middleware/auth.middleware");
router.use(auth);

router.get("/", auth,role("admin"), controller.getUsers);
router.get("/:id", role("admin"), controller.getUser);
router.post("/", role("admin"), controller.createUser);
router.put("/:id", role("admin","user"), controller.updateUser);
router.delete("/:id", role("admin"), controller.deleteUser);

module.exports = router;