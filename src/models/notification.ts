import { Schema,model } from "mongoose";



export const notificationSchema = new Schema({
    ownerID: { type: String, required: true },
    caretakerID: { type: String, required: true },
    caretakerName: { type: String, required: true },
    petID: { type: String, required: true },
    petName: { type: String, required: true },
    activity: { type: String, required: true },
    timesCompleted: { type: Number, default: 0 },
    date: { type: String, default: 0},
    time: { type: String, default: 0}, 
});

export default model("notifications", notificationSchema);