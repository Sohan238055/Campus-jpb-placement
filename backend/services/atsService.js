const SKILLS = [
  "c++",
  "java",
  "python",
  "javascript",
  "react",
  "node.js",
  "node",
  "mongodb",
  "mysql",
  "sql",
  "html",
  "css",
  "git",
  "github",
  "express",
  "flask",
  "machine learning",
  "data analytics",
  "data science",
  "docker",
  "aws",
  "azure",
  "pandas",
  "numpy",
  "ejs"
];

function calculateATS(resumeText, jobDescription) {
  const resume = (resumeText || "").toLowerCase();
  const job = (jobDescription || "").toLowerCase();

  const resumeSkills = SKILLS.filter((skill) => resume.includes(skill));
  const requiredSkills = SKILLS.filter((skill) => job.includes(skill));

  const matchedSkills = [];
  const missingSkills = [];

  for (const skill of requiredSkills) {
    if (resumeSkills.includes(skill)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  let score = 0;

  if (requiredSkills.length > 0) {
    score = Math.round(
      (matchedSkills.length / requiredSkills.length) * 100
    );
  }

  let result;

  if (score >= 80) {
    result = "Excellent Match";
  } else if (score >= 60) {
    result = "Good Match";
  } else if (score >= 40) {
    result = "Average Match";
  } else {
    result = "Low Match";
  }

  return {
    score,
    result,
    resumeSkills,
    requiredSkills,
    matchedSkills,
    missingSkills
  };
}

module.exports = {
  calculateATS,
  SKILLS
};
