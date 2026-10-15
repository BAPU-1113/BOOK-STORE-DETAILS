const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/BookStoreDB";

    const conn = await mongoose.connect(mongoURI);

    console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}`);
    console.log(`[Database] Active Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
