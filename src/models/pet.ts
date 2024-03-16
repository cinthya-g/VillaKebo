import { Schema, model } from "mongoose";

const petSchema = new Schema({
    ownerID: { type: String, required: true},
    name: { type: String, required: true },
    age: { type: Number, required: true },
    breed: { type: String, required: true },
    size: { type: String, default: 'M' },
    weight: { type: Number },
    photo: { type: String },
    files: [{ type: String }], 

});


export default model("pets", petSchema);