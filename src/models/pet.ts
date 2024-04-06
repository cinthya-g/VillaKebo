import { Schema, model } from "mongoose";

/**
 * @swagger
 * components:
 *  schemas:
 *    Pet:
 *      type: object
 *      required:
 *        - ownerID
 *        - name
 *        - age
 *        - breed
 *      properties:
 *        ownerID:
 *          type: string
 *          description: Identifier for the owner of the pet
 *        name:
 *          type: string
 *          description: Name of the pet
 *        age:
 *          type: number
 *          description: Age of the pet
 *        breed:
 *          type: string
 *          description: Breed of the pet
 *        size:
 *          type: string
 *          default: 'M'
 *          description: Size category of the pet, default is Medium (M)
 *        weight:
 *          type: number
 *          description: Weight of the pet in kilograms
 *        photo:
 *          type: string
 *          description: URL to a photo of the pet
 *        files:
 *          type: array
 *          items:
 *            type: string
 *          description: List of file URLs related to the pet (Medical records, etc.)
 */


const petSchema = new Schema({
    ownerID: { type: String, required: true},
    name: { type: String, required: true },
    age: { type: Number, required: true },
    breed: { type: String, required: true },
    size: { type: String, default: 'M' },
    weight: { type: Number },
    profilePicture: { type: String },
    record: { type: String }, 
    currentReservation: { type: String, default: null }
});


export default model("pets", petSchema);