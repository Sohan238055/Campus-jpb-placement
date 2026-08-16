const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME || "college";

// NOTE: connection caching pattern below is required for serverless
// platforms like Vercel, where every request can hit a fresh function
// instance. Without caching, each invocation would open a brand new
// MongoDB connection, quickly exhausting your connection pool.
let cachedClient = global._mongoClient;
let cachedDb = global._mongoDb;

async function connectDB() {
  if (cachedDb) {
    return cachedDb;
  }

  if (!uri) {
    throw new Error("MONGO_URI is missing from environment variables");
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    global._mongoClient = cachedClient;
  }

  await cachedClient.connect();
  cachedDb = cachedClient.db(dbName);
  global._mongoDb = cachedDb;

  console.log(`MongoDB Connected: ${dbName}`);
  return cachedDb;
}

function getDB() {
  if (!cachedDb) {
    throw new Error("Database is not connected. Call connectDB() first.");
  }

  return cachedDb;
}

function getCollections() {
  const database = getDB();

  return {
    users: database.collection("users"),
    students: database.collection("students"),
    companies: database.collection("companies"),
    drives: database.collection("drives"),
    applications: database.collection("applications"),
    announcements: database.collection("announcements"),
    interviewSlots: database.collection("interviewSlots")
  };
}

module.exports = {
  connectDB,
  getDB,
  getCollections
};
