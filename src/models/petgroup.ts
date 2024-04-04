import { Schema, model } from "mongoose";

/**
 * @swagger
 * components:
 *  schemas:
 *    PetGroup:
 *      type: object
 *      required:
 *        - petsIDs
 *        - caretakerID
 *      properties:
 *        petsIDs:
 *          type: string
 *          description: Identifier for the group of pets
 *        name:
 *          type: array
 *          items:
 *            type: string
 *            description: List of names of the pets in the group
 *        caretakerID:
 *          type: string
 *          description: Identifier for the caretaker of the pet group
 */


const petGroupSchema = new Schema({
    petsIDs: { type: String, required: true },
    name: [{ type: Schema.Types.ObjectId, ref: 'pets' }],
    caretakerID: { type: String, required: true },

});

export default model("petgroups", petGroupSchema);