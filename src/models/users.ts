import { Schema, model } from "mongoose";

const usersSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    rol: { type: String, required: true },
    phone: { type: String },
    status: { type: String },
    PetsIDs: [{ type: Schema.Types.ObjectId, ref: "Pet" }],
    ReservationsIDs: [{ type: Schema.Types.ObjectId, ref: "Reservation" }],
    profilePicture: { type: String },
    //TODO DEFINE WHAT IS REQUIRED
});

export default model("User", usersSchema);
