import mongoose from "mongoose"
import dotenv from "dotenv"
import { DB_NAME } from "../constants.js"
dotenv.config();



dotenv.config()
const connectDB = async()=>{
    try {
      const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);

        console.log("Mongoose is connected");
    } catch (error) {
        console.log("mongoDB connection error :"+ error);
    }
}

export default connectDB;