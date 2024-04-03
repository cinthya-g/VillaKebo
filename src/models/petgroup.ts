import { Schema, model } from "mongoose";

const petGroupSchema = new Schema({
    petsIDs: { type: String, required: true },
    name: [{ type: Schema.Types.ObjectId, ref: 'pets' }],
    caretakerID: { type: String, required: true },

});

export default model("petgroups", petGroupSchema);