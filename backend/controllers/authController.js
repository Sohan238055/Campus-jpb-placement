const { getCollections } = require("../config/db");

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    const { users } = getCollections();

    const existing = await users.findOne({ email });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "User already exists"
      });
    }

    const result = await users.insertOne({
      name,
      email,
      password,
      role: "admin",
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      userId: result.insertedId
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed"
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const {
      users,
      students,
      companies
    } = getCollections();

    const admin = await users.findOne({
      email,
      password
    });

    if (admin) {
      req.session.user = {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        role: "admin"
      };

      return res.json({
        success: true,
        role: "admin",
        user: req.session.user
      });
    }

    const student = await students.findOne({
      email,
      usn: password.toUpperCase()
    });

    if (student) {
      req.session.user = {
        id: student._id.toString(),
        email: student.email,
        name: student.fullname,
        role: "student",
        usn: student.usn
      };

      return res.json({
        success: true,
        role: "student",
        usn: student.usn,
        user: req.session.user
      });
    }

    const hr = await companies.findOne({
      email
    });

    if (
      hr &&
      (password === "company123" || password === hr.password)
    ) {
      req.session.user = {
        id: hr._id.toString(),
        email: hr.email,
        name: hr.company,
        role: "hr",
        company: hr.company
      };

      return res.json({
        success: true,
        role: "hr",
        company: hr.company,
        user: req.session.user
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid email or password"
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
}

function me(req, res) {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: "Not logged in"
    });
  }

  res.json({
    success: true,
    user: req.session.user
  });
}

function logout(req, res) {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: "Logout failed"
      });
    }

    res.clearCookie("connect.sid");

    res.json({
      success: true,
      message: "Logged out successfully"
    });
  });
}

module.exports = {
  register,
  login,
  me,
  logout
};
