import { Schema, model } from "mongoose";

const ownerSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    phone: { type: String },
    status: { type: String },
    PetsIDs: [{ type: Schema.Types.ObjectId, ref: "pets" }],
    ReservationsIDs: [{ type: Schema.Types.ObjectId, ref: "reservations" }],
    profilePicture: { type: String },
    //TODO DEFINE WHAT IS REQUIRED
});

export default model("Owner", ownerSchema);
