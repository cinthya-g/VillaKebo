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
 *            type: string
 *            format: uuid
 *            description: Identifiers for groups that the Caretaker is part of
 *        profilePicture:
 *          type: string
 *          description: URL to the profile picture of the Caretaker
 */

const defaultPicture = "no-user-photo.png";

const caretakerSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: Roles.CARETAKER },
    status: { type: String, default: "Yo <3 a las mascotas!"},
    assignedReservationsIDs: [{ type: Schema.Types.ObjectId, ref: "reservations" }],
    profilePicture: { type: String , default: defaultPicture},
});

export default model("caretakers", caretakerSchema);