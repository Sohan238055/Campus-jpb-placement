const { ObjectId } = require("mongodb");
const { getCollections } = require("../config/db");
const { toBuffer } = require("../services/pdfService");

async function getCompanies(req, res) {
  try {
    const { companies } = getCollections();
    const data = await companies.find().sort({ company: 1 }).toArray();

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("GET COMPANIES ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load companies"
    });
  }
}

async function addCompany(req, res) {
  try {
    const {
      company,
      email,
      role,
      package: packageValue,
      mincgpa,
      deadline,
      description
    } = req.body;

    if (!company || !email) {
      return res.status(400).json({
        success: false,
        message: "Company and email are required"
      });
    }

    const { companies } = getCollections();

    const existing = await companies.findOne({ email });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Company/HR already exists with this email"
      });
    }

    const result = await companies.insertOne({
      company,
      email,
      password: "company123",
      role,
      package: packageValue,
      mincgpa: Number(mincgpa),
      deadline,
      description,
      logo: req.file ? req.file.buffer : null,
      logoContentType: req.file ? req.file.mimetype : null,
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: "Company added successfully",
      companyId: result.insertedId,
      defaultPassword: "company123"
    });
  } catch (error) {
    console.error("ADD COMPANY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add company"
    });
  }
}

async function editCompany(req, res) {
  try {
    const { companies } = getCollections();

    const result = await companies.updateOne(
      {
        _id: new ObjectId(req.params.id)
      },
      {
        $set: {
          company: req.body.company,
          email: req.body.email,
          role: req.body.role,
          package: req.body.package,
          mincgpa: Number(req.body.mincgpa),
          deadline: req.body.deadline,
          description: req.body.description
        }
      }
    );

    if (!result.matchedCount) {
      return res.status(404).json({
        success: false,
        message: "Company not found"
      });
    }

    res.json({
      success: true,
      message: "Company updated successfully"
    });
  } catch (error) {
    console.error("EDIT COMPANY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update company"
    });
  }
}

async function deleteCompany(req, res) {
  try {
    const { companies } = getCollections();

    const result = await companies.deleteOne({
      _id: new ObjectId(req.params.id)
    });

    if (!result.deletedCount) {
      return res.status(404).json({
        success: false,
        message: "Company not found"
      });
    }

    res.json({
      success: true,
      message: "Company deleted successfully"
    });
  } catch (error) {
    console.error("DELETE COMPANY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete company"
    });
  }
}

async function getLogo(req, res) {
  try {
    const { companies } = getCollections();

    const company = await companies.findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!company || !company.logo) {
      return res.status(404).send("Logo not found");
    }

    const buffer = toBuffer(company.logo);

    res.set(
      "Content-Type",
      company.logoContentType || "image/png"
    );

    res.send(buffer);
  } catch (error) {
    console.error("COMPANY LOGO ERROR:", error);
    res.status(500).send("Error loading logo");
  }
}

module.exports = {
  getCompanies,
  addCompany,
  editCompany,
  deleteCompany,
  getLogo
};
