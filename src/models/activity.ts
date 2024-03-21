import {Schema, model} from "mongoose";

const activitySchema = new Schema({
    ID: { type: String, required: true },
    Name: { type: String, required: true },
    Description: { type: String, required: true },
    Frequency: { type: String, required: true }
});

export default model("activities", activitySchema);