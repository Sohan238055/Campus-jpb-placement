const { ObjectId } = require("mongodb");
const { getCollections } = require("../config/db");

async function getDrives(req, res) {
  try {
    const { drives } = getCollections();

    const data = await drives.find().sort({ deadline: 1 }).toArray();

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("GET DRIVES ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load drives"
    });
  }
}

async function getDrive(req, res) {
  try {
    const { drives } = getCollections();

    const drive = await drives.findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: "Drive not found"
      });
    }

    res.json({
      success: true,
      drive
    });
  } catch (error) {
    console.error("GET DRIVE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Invalid drive ID"
    });
  }
}

async function addDrive(req, res) {
  try {
    const {
      company,
      role,
      mincgpa,
      interviewDate,
      deadline,
      package: packageValue,
      description
    } = req.body;

    const { drives } = getCollections();

    const result = await drives.insertOne({
      company,
      role,
      mincgpa: Number(mincgpa),
      interviewDate,
      deadline,
      package: packageValue,
      description,
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: "Placement drive added successfully",
      driveId: result.insertedId
    });
  } catch (error) {
    console.error("ADD DRIVE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add drive"
    });
  }
}

module.exports = {
  getDrives,
  getDrive,
  addDrive
};
