// Vercel serverless entry point.
//
// Vercel treats every file in /api as its own serverless function. By
// exporting the Express app directly, Vercel's Node.js runtime will
// call it as a request handler (app(req, res)) for every request that
// vercel.json routes here — so all existing Express routes, middleware,
// and error handling keep working unchanged.
//
// Local development still uses server.js (npm run dev), which calls
// app.listen() directly. This file is ONLY used in the Vercel deployment.

const app = require("../app");

module.exports = app;
