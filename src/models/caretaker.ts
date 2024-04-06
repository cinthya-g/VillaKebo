import { Schema, model } from "mongoose";
import { Roles } from "../utils/roles";

/**
 * @swagger
 * components:
 *  schemas:
 *    Caretaker:
 *      type: object
 *      required:
 *        - username
 *        - email
 *        - password
 *      properties:
 *        username:
 *          type: string
 *          description: Unique username for the Caretaker
 *        email:
 *          type: string
 *          format: email
 *          description: Email address of the Caretaker
 *        password:
 *          type: string
 *          description: Password for the Caretaker account
 *        role:
 *          type: string
 *          default: 'CARETAKER'
 *          description: The role of the user in the system, defaults to CARETAKER
 *        status:
 *          type: string
 *          default: 'I <3 pets!'
 *          description: Status message or description for the Caretaker profile
 *        GroupsIDs:
 *          type: array
 *          items:
 *            type: Schema.Types.ObjectId
 *            format: uuid
 *            description: Identifiers for groups that the Caretaker is part of
 *        profilePicture:
 *          type: string
 *          description: URL to the profile picture of the Caretaker
 */


const caretakerSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: Roles.CARETAKER },
    status: { type: String, default: "I <3 pets!"},
    groupsIDs: [{ type: Schema.Types.ObjectId, ref: "Pet" }],
    profilePicture: { type: String },
    //TODO DEFINE WHAT IS REQUIRED
});

export default model("caretakers", caretakerSchema);