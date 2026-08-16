const express = require("express");
const {
  requireStudent,
  requireHR
} = require("../middleware/authMiddleware");

const {
  addSlot,
  getHRSlots,
  getStudentSlots,
  bookSlot
} = require("../controllers/interviewController");

const router = express.Router();

router.post("/slots", requireHR, addSlot);
router.get("/slots/hr", requireHR, getHRSlots);

router.get(
  "/slots/student/:driveId",
  requireStudent,
  getStudentSlots
);

router.post(
  "/slots/book",
  requireStudent,
  bookSlot
);

module.exports = router;
