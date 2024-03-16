import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoURI = process.env.DB;
let db = mongoose.connection;

db.on('connected', () => {
    console.log('MongoDB is running sucessfully');
});
mongoose.connect(mongoURI).then().catch();