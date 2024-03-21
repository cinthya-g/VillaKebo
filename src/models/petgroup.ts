import { Schema, model } from "mongoose";

const petGroupSchema = new Schema({
    ID: { type: String, required: true},
    PetsIDs: { type: String, required: true },
    Name: [{ type: Schema.Types.ObjectId, ref: 'pets' }],
    CaretakerID: { type: String, required: true },

});

export default model("petgroups", petGroupSchema);