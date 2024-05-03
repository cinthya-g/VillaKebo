import { Schema,model } from "mongoose";


export const notificationSchema = new Schema({
    ownerID: { type: String, required: true },
    caretakerID: { type: String, required: true },
    petID: { type: String, required: true },
    activity: { type: String, required: true },
    timesCompleted: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }
});

export default model("notifications", notificationSchema);