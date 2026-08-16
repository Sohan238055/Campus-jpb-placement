const { ObjectId } = require("mongodb");
const { getCollections } = require("../config/db");
const { toBuffer } = require("../services/pdfService");

async function getDashboard(req, res) {
  try {
    const {
      students,
      companies,
      drives,
      applications,
      announcements
    } = getCollections();

    const [
      studentCount,
      companyCount,
      driveCount,
      applicationCount,
      news
    ] = await Promise.all([
      students.countDocuments(),
      companies.countDocuments(),
      drives.countDocuments(),
      applications.countDocuments(),
      announcements.find().sort({ date: -1 }).limit(10).toArray()
    ]);

    res.json({
      success: true,
      stats: {
        students: studentCount,
        companies: companyCount,
        drives: driveCount,
        applications: applicationCount
      },
      announcements: news
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard"
    });
  }
}

async function getStudents(req, res) {
  try {
    const { students } = getCollections();
    const data = await students.find().sort({ fullname: 1 }).toArray();

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("GET STUDENTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load students"
    });
  }
}

async function getStudent(req, res) {
  try {
    const { students } = getCollections();

    const student = await students.findOne({
      usn: req.params.usn.toUpperCase()
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
    console.error("GET STUDENT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load student"
    });
  }
}

async function addStudent(req, res) {
  try {
    const {
      usn,
      fullname,
      email,
      branch,
      sem,
      cgpa
    } = req.body;

    if (!usn || !fullname || !email) {
      return res.status(400).json({
        success: false,
        message: "USN, fullname and email are required"
      });
    }

    const { students } = getCollections();

    const normalizedUSN = usn.toUpperCase();

    const existing = await students.findOne({
      usn: normalizedUSN
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Student already exists"
      });
    }

    const student = {
      usn: normalizedUSN,
      fullname,
      email,
      branch,
      sem: Number(sem),
      cgpa: Number(cgpa),
      photo: req.file ? req.file.buffer : null,
      contentType: req.file ? req.file.mimetype : null,
      resume: null,
      resumeName: null,
      resumeContentType: null,
      results: [],
      createdAt: new Date()
    };

    const result = await students.insertOne(student);

    res.status(201).json({
      success: true,
      message: "Student added successfully",
      studentId: result.insertedId
    });
  } catch (error) {
    console.error("ADD STUDENT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add student"
    });
  }
}

async function editStudent(req, res) {
  try {
    const { students } = getCollections();

    const data = {
      fullname: req.body.fullname,
      email: req.body.email,
      branch: req.body.branch,
      sem: Number(req.body.sem),
      cgpa: Number(req.body.cgpa)
    };

    if (req.file) {
      data.photo = req.file.buffer;
      data.contentType = req.file.mimetype;
    }

    const result = await students.updateOne(
      {
        usn: req.params.usn.toUpperCase()
      },
      {
        $set: data
      }
    );

    if (!result.matchedCount) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.json({
      success: true,
      message: "Student updated successfully"
    });
  } catch (error) {
    console.error("EDIT STUDENT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update student"
    });
  }
}

async function deleteStudent(req, res) {
  try {
    const { students } = getCollections();

    const result = await students.deleteOne({
      usn: req.params.usn.toUpperCase()
    });

    if (!result.deletedCount) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.json({
      success: true,
      message: "Student deleted successfully"
    });
  } catch (error) {
    console.error("DELETE STUDENT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete student"
    });
  }
}

async function searchStudents(req, res) {
  try {
    const { students } = getCollections();
    const keyword = req.query.keyword || "";

    const data = await students
      .find({
        fullname: {
          $regex: keyword,
          $options: "i"
        }
      })
      .toArray();

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("SEARCH STUDENTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Search failed"
    });
  }
}

async function addResult(req, res) {
  try {
    const { students } = getCollections();

    const result = {
      sem: Number(req.body.semester),
      subjects: [
        { subject: req.body.sub1, marks: Number(req.body.mark1) },
        { subject: req.body.sub2, marks: Number(req.body.mark2) },
        { subject: req.body.sub3, marks: Number(req.body.mark3) },
        { subject: req.body.sub4, marks: Number(req.body.mark4) },
        { subject: req.body.sub5, marks: Number(req.body.mark5) },
        { subject: req.body.sub6, marks: Number(req.body.mark6) }
      ],
      percentage: Number(req.body.percentage),
      cgpa: Number(req.body.cgpa),
      published: true,
      addedAt: new Date()
    };

    const update = await students.updateOne(
      {
        usn: req.params.usn.toUpperCase()
      },
      {
        $push: {
          results: result
        }
      }
    );

    if (!update.matchedCount) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.status(201).json({
      success: true,
      message: "Result added successfully",
      result
    });
  } catch (error) {
    console.error("ADD RESULT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add result"
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
    console.error("PHOTO ERROR:", error);
    res.status(500).send("Error loading photo");
  }
}

module.exports = {
  getDashboard,
  getStudents,
  getStudent,
  addStudent,
  editStudent,
  deleteStudent,
  searchStudents,
  addResult,
  getPhoto
};
