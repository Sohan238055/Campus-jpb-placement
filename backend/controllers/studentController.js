const { ObjectId } = require("mongodb");
const { getCollections } = require("../config/db");
const { toBuffer } = require("../services/pdfService");

async function getDashboard(req, res) {
  try {
    const { students, drives, applications, announcements } =
      getCollections();

    const usn = req.session.user.usn;

    const [student, companiesList, myApplications, news] =
      await Promise.all([
        students.findOne({ usn }),
        drives.find().sort({ deadline: 1 }).toArray(),
        applications.find({ usn }).sort({ appliedDate: -1 }).toArray(),
        announcements.find().sort({ date: -1 }).toArray()
      ]);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.json({
      success: true,
      student,
      companiesList,
      myApplications,
      news
    });
  } catch (error) {
    console.error("STUDENT DASHBOARD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load student dashboard"
    });
  }
}

async function getProfile(req, res) {
  try {
    const { students } = getCollections();

    const usn = req.params.usn || req.session.user.usn;

    const student = await students.findOne({
      usn: usn.toUpperCase()
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.json({
      success: true,
      student
    });
  } catch (error) {
    console.error("STUDENT PROFILE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load profile"
    });
  }
}

async function uploadResume(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a resume"
      });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({
        success: false,
        message: "Only PDF resumes are allowed"
      });
    }

    const { students } = getCollections();

    await students.updateOne(
      {
        usn: req.session.user.usn
      },
      {
        $set: {
          resume: req.file.buffer,
          resumeName: req.file.originalname,
          resumeContentType: req.file.mimetype,
          resumeUploadedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: "Resume uploaded successfully",
      resumeName: req.file.originalname
    });
  } catch (error) {
    console.error("UPLOAD RESUME ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload resume"
    });
  }
}

async function getResume(req, res) {
  try {
    const { students } = getCollections();

    const student = await students.findOne({
      usn: req.session.user.usn
    });

    if (!student || !student.resume) {
      return res.status(404).send("Resume not found");
    }

    const buffer = toBuffer(student.resume);

    res.set(
      "Content-Type",
      student.resumeContentType || "application/pdf"
    );

    if (student.resumeName) {
      res.set(
        "Content-Disposition",
        `inline; filename="${student.resumeName}"`
      );
    }

    res.send(buffer);
  } catch (error) {
    console.error("GET RESUME ERROR:", error);
    res.status(500).send("Error loading resume");
  }
}

async function getResult(req, res) {
  try {
    const { students } = getCollections();

    const student = await students.findOne({
      usn: req.session.user.usn
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const sem = Number(req.params.sem);

    const result = (student.results || []).find(
      (item) => item.sem === sem
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found"
      });
    }

    res.json({
      success: true,
      student,
      sem,
      result
    });
  } catch (error) {
    console.error("GET RESULT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load result"
    });
  }
}

async function getPhoto(req, res) {
  try {
    const { students } = getCollections();

    const student = await students.findOne({
      usn: req.params.usn.toUpperCase()
    });

    if (!student || !student.photo) {
      return res.status(404).send("Photo not found");
    }

    const buffer = toBuffer(student.photo);

    res.set(
      "Content-Type",
      student.contentType || "image/jpeg"
    );

    res.send(buffer);
  } catch (error) {
    console.error("STUDENT PHOTO ERROR:", error);
    res.status(500).send("Error loading photo");
  }
}

module.exports = {
  getDashboard,
  getProfile,
  uploadResume,
  getResume,
  getResult,
  getPhoto
};
