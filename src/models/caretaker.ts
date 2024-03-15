import { Schema, model } from "mongoose";

const caretakerSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    status: { type: String },
    GroupsIDs: [{ type: Schema.Types.ObjectId, ref: "Pet" }],
    profilePicture: { type: String },
    //TODO DEFINE WHAT IS REQUIRED
});

export default model("caretakers", caretakerSchema);