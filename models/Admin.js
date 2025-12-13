import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  username: String,
  password: String   
});

export default mongoose.model("Admin", AdminSchema);
