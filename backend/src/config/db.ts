import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI!;

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(`${MONGO_URI}/${process.env.MONGODB_DATABASE!}`);
    console.log("Connected to MongoDB");
  }
  catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;