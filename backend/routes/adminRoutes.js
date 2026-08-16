const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const {
  requireAdmin
} = require("../middleware/authMiddleware");

const {
  getDashboard,
  getStudents,
  getStudent,
  addStudent,
  editStudent,
  deleteStudent,
  searchStudents,
  addResult,
  getPhoto
} = require("../controllers/adminController");

const router = express.Router();

router.use(requireAdmin);

router.get("/dashboard", getDashboard);

router.get("/students", getStudents);
router.get("/students/search", searchStudents);
router.get("/students/:usn", getStudent);
router.post("/students", upload.single("photo"), addStudent);
router.put("/students/:usn", upload.single("photo"), editStudent);
router.delete("/students/:usn", deleteStudent);

router.post("/students/:usn/results", addResult);

router.get("/students/:usn/photo", getPhoto);

module.exports = router;
