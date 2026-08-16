const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const {
  requireStudent
} = require("../middleware/authMiddleware");

const {
  getDashboard,
  getProfile,
  uploadResume,
  getResume,
  getResult,
  getPhoto
} = require("../controllers/studentController");

const router = express.Router();

router.use(requireStudent);

router.get("/dashboard", getDashboard);
router.get("/profile", getProfile);
router.get("/profile/:usn", getProfile);

router.post(
  "/resume",
  upload.single("resume"),
  uploadResume
);

router.get("/resume", getResume);

router.get("/results/:sem", getResult);

router.get("/:usn/photo", getPhoto);

module.exports = router;
