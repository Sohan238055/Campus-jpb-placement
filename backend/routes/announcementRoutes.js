const express = require("express");
const {
  requireLogin,
  requireAdmin
} = require("../middleware/authMiddleware");

const {
  getAnnouncements,
  addAnnouncement
} = require("../controllers/announcementController");

const router = express.Router();

router.get("/", requireLogin, getAnnouncements);
router.post("/", requireAdmin, addAnnouncement);

module.exports = router;
