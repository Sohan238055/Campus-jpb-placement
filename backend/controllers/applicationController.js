const { ObjectId } = require("mongodb");
const { getCollections } = require("../config/db");

async function applyForDrive(req, res) {
  try {
    const { drives, students, applications } = getCollections();

    const student = await students.findOne({
      usn: req.session.user.usn
    });

    const drive = await drives.findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Drive not found"
      });
    }

    if (Number(student.cgpa) < Number(drive.mincgpa)) {
      return res.status(403).json({
        success: false,
        message: "Not eligible for this drive"
      });
    }

    const existing = await applications.findOne({
      usn: student.usn,
      driveId: drive._id
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Already applied for this drive",
        application: existing
      });
    }

    const application = {
      usn: student.usn,
      name: student.fullname,
      email: student.email,
      driveId: drive._id,
      company: drive.company,
      role: drive.role,
      status: "Applied",
      appliedDate: new Date()
    };

    const result = await applications.insertOne(application);

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      applicationId: result.insertedId,
      application
    });
  } catch (error) {
    console.error("APPLY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to apply"
    });
  }
}

async function getApplications(req, res) {
  try {
    const { applications } = getCollections();

    const query = {};

    if (req.session.user.role === "student") {
      query.usn = req.session.user.usn;
    }

    if (req.session.user.role === "hr") {
      query.company = req.session.user.company;
    }

    const data = await applications
      .find(query)
      .sort({ appliedDate: -1 })
      .toArray();

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("GET APPLICATIONS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load applications"
    });
  }
}

async function shortlist(req, res) {
  return updateStatus(req, res, "Shortlisted");
}

async function reject(req, res) {
  return updateStatus(req, res, "Rejected");
}

async function select(req, res) {
  return updateStatus(req, res, "Selected");
}

async function updateStatus(req, res, status) {
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
        message: "You cannot modify this application"
      });
    }

    await applications.updateOne(
      {
        _id: application._id
      },
      {
        $set: {
          status,
          statusUpdatedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: `Application marked as ${status}`
    });
  } catch (error) {
    console.error("UPDATE APPLICATION ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update application"
    });
  }
}

async function scheduleInterviewLegacy(req, res) {
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
        message: "You cannot modify this application"
      });
    }

    await applications.updateOne(
      {
        _id: application._id
      },
      {
        $set: {
          status: "Interview Scheduled",
          interviewDate: req.body.date,
          interviewTime: req.body.time,
          interviewMode: req.body.mode
        }
      }
    );

    res.json({
      success: true,
      message: "Interview scheduled"
    });
  } catch (error) {
    console.error("INTERVIEW ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to schedule interview"
    });
  }
}

module.exports = {
  applyForDrive,
  getApplications,
  shortlist,
  reject,
  select,
  updateStatus,
  scheduleInterviewLegacy
};
