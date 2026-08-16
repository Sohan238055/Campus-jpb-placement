const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const {
  requireAdmin
} = require("../middleware/authMiddleware");

const {
  getCompanies,
  addCompany,
  editCompany,
  deleteCompany,
  getLogo
} = require("../controllers/companyController");

const router = express.Router();

router.get("/", getCompanies);
router.get("/:id/logo", getLogo);

router.post(
  "/",
  requireAdmin,
  upload.single("logo"),
  addCompany
);

router.put("/:id", requireAdmin, editCompany);
router.delete("/:id", requireAdmin, deleteCompany);

module.exports = router;
