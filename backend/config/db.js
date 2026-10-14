import mongoose from "mongoose";
export const connectDB =async ()=>{
  await mongoose.connect("mongodb+srv://anujasiddam123_db_user:0dskEOD8Gc2CUjyA@cluster0.pferge8.mongodb.net/Expense")
  .then(()=> console.log("DB CONNECTED"));
}