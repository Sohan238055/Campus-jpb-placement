const express = require("express");
const {
  requireHR
} = require("../middleware/authMiddleware");

const {
  scanResume,
  getATSResult
} = require("../controllers/atsController");

const router = express.Router();

router.get(
  "/scan/:usn/:driveId",
  requireHR,
  scanResume
);

router.get(
  "/result/:id",
  requireHR,
  getATSResult
);

module.exports = router;
