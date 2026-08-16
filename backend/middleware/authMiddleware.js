function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: "Please login first"
    });
  }

  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required"
    });
  }

  next();
}

function requireStudent(req, res, next) {
  if (!req.session.user || req.session.user.role !== "student") {
    return res.status(403).json({
      success: false,
      message: "Student access required"
    });
  }

  next();
}

function requireHR(req, res, next) {
  if (!req.session.user || req.session.user.role !== "hr") {
    return res.status(403).json({
      success: false,
      message: "HR access required"
    });
  }

  next();
}

module.exports = {
  requireLogin,
  requireAdmin,
  requireStudent,
  requireHR
};
