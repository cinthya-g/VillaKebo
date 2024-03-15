import { Schema, model } from "mongoose";
import { Roles } from "../utils/roles";

const ownerSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: Roles.OWNER },
    phone: { type: String },
    status: { type: String, default: "¡Acabo de unirme a Villa Kebo!" },
    PetsIDs: [{ type: Schema.Types.ObjectId, ref: "pets" }],
    ReservationsIDs: [{ type: Schema.Types.ObjectId, ref: "reservations" }],
    profilePicture: { type: String },
    //TODO DEFINE WHAT IS REQUIRED
});

export default model("owners", ownerSchema);
