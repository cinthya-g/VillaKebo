import {Schema, model} from "mongoose";

const activitySchema = new Schema({
    name: { type: String, required: true },
    Description: { type: String, required: true },
    Frequency: { type: String, required: true },
    Completed: { type: Boolean, default: false },
});

export default model("activities", activitySchema);