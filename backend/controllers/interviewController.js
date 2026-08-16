const { ObjectId } = require("mongodb");
const { getCollections } = require("../config/db");

async function addSlot(req, res) {
  try {
    const { drives, interviewSlots } = getCollections();

    const company = req.session.user.company;

    const drive = await drives.findOne({
      _id: new ObjectId(req.body.driveId),
      company
    });

    if (!drive) {
      return res.status(403).json({
        success: false,
        message: "Drive does not belong to your company"
      });
    }

    const slot = {
      company,
      driveId: drive._id,
      date: req.body.date,
      time: req.body.time,
      mode: req.body.mode,
      booked: false,
      studentUSN: null,
      createdAt: new Date()
    };

    const result = await interviewSlots.insertOne(slot);

    res.status(201).json({
      success: true,
      message: "Interview slot created",
      slotId: result.insertedId,
      slot
    });
  } catch (error) {
    console.error("ADD SLOT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add interview slot"
    });
  }
}

async function getHRSlots(req, res) {
  try {
    const { interviewSlots } = getCollections();

    const data = await interviewSlots
      .find({
        company: req.session.user.company
      })
      .sort({ date: 1, time: 1 })
      .toArray();

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("GET HR SLOTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load interview slots"
    });
  }
}

async function getStudentSlots(req, res) {
  try {
    const { applications, interviewSlots, drives } = getCollections();

    const driveId = new ObjectId(req.params.driveId);
    const usn = req.session.user.usn;

    const application = await applications.findOne({
      usn,
      driveId,
      status: "Shortlisted"
    });

    if (!application) {
      return res.status(403).json({
        success: false,
        message: "You are not shortlisted for this drive"
      });
    }

    const slots = await interviewSlots
      .find({
        driveId,
        booked: false
      })
      .sort({ date: 1, time: 1 })
      .toArray();

    const drive = await drives.findOne({
      _id: driveId
    });

    res.json({
      success: true,
      slots,
      drive,
      application
    });
  } catch (error) {
    console.error("GET STUDENT SLOTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load interview slots"
    });
  }
}

async function bookSlot(req, res) {
  try {
    const {
      applications,
      interviewSlots
    } = getCollections();

    const slotId = new ObjectId(req.body.slotId);
    const driveId = new ObjectId(req.body.driveId);
    const usn = req.session.user.usn;

    const application = await applications.findOne({
      usn,
      driveId,
      status: "Shortlisted"
    });

    if (!application) {
      return res.status(403).json({
        success: false,
        message: "You are not shortlisted"
      });
    }

    const slot = await interviewSlots.findOneAndUpdate(
      {
        _id: slotId,
        driveId,
        booked: false
      },
      {
        $set: {
          booked: true,
          studentUSN: usn,
          bookedAt: new Date()
        }
      },
      {
        returnDocument: "after"
      }
    );

    if (!slot) {
      return res.status(409).json({
        success: false,
        message: "Sorry, this slot has already been booked"
      });
    }

    await applications.updateOne(
      {
        _id: application._id
      },
      {
        $set: {
          status: "Interview Scheduled",
          interviewSlotId: slot._id,
          interviewDate: slot.date,
          interviewTime: slot.time,
          interviewMode: slot.mode
        }
      }
    );

    res.json({
      success: true,
      message: "Interview slot booked successfully",
      slot
    });
  } catch (error) {
    console.error("BOOK SLOT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to book interview slot"
    });
  }
}

module.exports = {
  addSlot,
  getHRSlots,
  getStudentSlots,
  bookSlot
};
