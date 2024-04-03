import { Schema, model } from "mongoose";

const reservationSchema = new Schema({
    ownerID: { type: String, required: true },
    petID: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    activitiesIDs:[ { type: String, required: true }],
});

export default model("reservations", reservationSchema);