import { Schema, model } from "mongoose";

const reservationSchema = new Schema({
    ID: { type: String, required: true },
    OwnerID: { type: String, required: true },
    PetID: { type: String, required: true },
    StartDate: { type: Date, required: true },
    EndDate: { type: Date, required: true },
    ActivitiesIDs:[ { type: String, required: true }],
});

export default model("reservations", reservationSchema);