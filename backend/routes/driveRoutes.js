const express = require("express");
const {
  requireAdmin,
  requireLogin
} = require("../middleware/authMiddleware");

const {
  getDrives,
  getDrive,
  addDrive
} = require("../controllers/driveController");

const router = express.Router();

router.get("/", requireLogin, getDrives);
router.get("/:id", requireLogin, getDrive);
router.post("/", requireAdmin, addDrive);

module.exports = router;
