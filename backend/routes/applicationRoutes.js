const express = require("express");
const {
  requireLogin,
  requireStudent,
  requireHR
} = require("../middleware/authMiddleware");

const {
  applyForDrive,
  getApplications,
  shortlist,
  reject,
  select,
  scheduleInterviewLegacy
} = require("../controllers/applicationController");

const router = express.Router();

router.post(
  "/apply/:id",
  requireStudent,
  applyForDrive
);

router.get(
  "/",
  requireLogin,
  getApplications
);

router.patch(
  "/:id/shortlist",
  requireHR,
  shortlist
);

router.patch(
  "/:id/reject",
  requireHR,
  reject
);

router.patch(
  "/:id/select",
  requireHR,
  select
);

router.patch(
  "/:id/interview",
  requireHR,
  scheduleInterviewLegacy
);

module.exports = router;
