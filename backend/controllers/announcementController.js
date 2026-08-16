const { getCollections } = require("../config/db");

async function getAnnouncements(req, res) {
  try {
    const { announcements } = getCollections();

    const data = await announcements
      .find()
      .sort({ date: -1 })
      .toArray();

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("GET ANNOUNCEMENTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load announcements"
    });
  }
}

async function addAnnouncement(req, res) {
  try {
    const { announcements } = getCollections();

    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required"
      });
    }

    const announcement = {
      title,
      message,
      date: new Date()
    };

    const result = await announcements.insertOne(announcement);

    res.status(201).json({
      success: true,
      message: "Announcement added successfully",
      announcementId: result.insertedId,
      announcement
    });
  } catch (error) {
    console.error("ADD ANNOUNCEMENT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add announcement"
    });
  }
}

module.exports = {
  getAnnouncements,
  addAnnouncement
};
