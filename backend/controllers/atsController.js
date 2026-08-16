const { ObjectId } = require("mongodb");
const { getCollections } = require("../config/db");
const { calculateATS } = require("../services/atsService");
const { extractPdfText } = require("../services/pdfService");

async function scanResume(req, res) {
  try {
    const {
      students,
      drives,
      applications
    } = getCollections();

    const usn = req.params.usn.toUpperCase();

    const student = await students.findOne({
      usn
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    if (!student.resume) {
      return res.status(400).json({
        success: false,
        message: "Student has not uploaded a resume"
      });
    }

    const drive = await drives.findOne({
      _id: new ObjectId(req.params.driveId)
    });

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Drive not found"
      });
    }

    if (
      req.session.user.role === "hr" &&
      drive.company !== req.session.user.company
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot scan resumes for this drive"
      });
    }

    const resumeText = await extractPdfText(student.resume);

    if (!resumeText.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "PDF was opened but no text could be extracted. Please upload a text-based PDF resume."
      });
    }

    const ats = calculateATS(
      resumeText,
      drive.description || ""
    );

    const application = await applications.findOne({
      usn: student.usn,
      driveId: drive._id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Student has not applied for this drive"
      });
    }

    const newStatus =
      ats.score > 70
        ? "Shortlisted"
        : application.status === "Shortlisted"
          ? "Applied"
          : application.status;

    await applications.updateOne(
      {
        _id: application._id
      },
      {
        $set: {
          status: newStatus,
          atsScore: ats.score,
          matchedSkills: ats.matchedSkills,
          missingSkills: ats.missingSkills,
          atsResult: ats.result,
          atsScannedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      student: {
        usn: student.usn,
        fullname: student.fullname,
        email: student.email
      },
      drive: {
        id: drive._id,
        company: drive.company,
        role: drive.role
      },
      ats,
      application: {
        ...application,
        status: newStatus,
        atsScore: ats.score,
        matchedSkills: ats.matchedSkills,
        missingSkills: ats.missingSkills,
        atsResult: ats.result
      }
    });
  } catch (error) {
    console.error("ATS SCANNER ERROR:", error);

    res.status(500).json({
      success: false,
      message: `ATS Error: ${error.message}`
    });
  }
}

async function getATSResult(req, res) {
  try {
    const { applications } = getCollections();

    const application = await applications.findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    if (
      req.session.user.role === "hr" &&
      application.company !== req.session.user.company
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    res.json({
      success: true,
      ats: {
        score: application.atsScore || 0,
        result: application.atsResult || "Not Scanned",
        matchedSkills: application.matchedSkills || [],
        missingSkills: application.missingSkills || [],
        scannedAt: application.atsScannedAt || null
      },
      application
    });
  } catch (error) {
    console.error("GET ATS RESULT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load ATS result"
    });
  }
}

module.exports = {
  scanResume,
  getATSResult
};
