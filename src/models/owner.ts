import { Schema, model } from "mongoose";
import { Roles } from "../utils/roles";

/**
 * @swagger
 * components:
 *  schemas:
 *    Owner:
 *      type: object
 *      required:
 *        - username
 *        - email
 *        - password
 *      properties:
 *        username:
 *          type: string
 *          description: Username for the Owner
 *        email:
 *          type: string
 *          format: email
 *          description: Unique email address of the Owner
 *        password:
 *          type: string
 *          description: Password for the Owner's account
 *        role:
 *          type: string
 *          default: 'OWNER'
 *          description: The role of the user in the system, defaults to OWNER
 *        status:
 *          type: string
 *          default: '¡Acabo de unirme a Villa Kebo!'
 *          description: Status message or description for the Owner's profile
 *        PetsIDs:
 *          type: array
 *          items:
 *            type: string
 *            format: uuid
 *            description: Identifiers for pets owned by the Owner
 *        ReservationsIDs:
 *          type: array
 *          items:
 *            type: string
 *            format: uuid
 *            description: Identifiers for reservations made by the Owner
 *        profilePicture:
 *          type: string
 *          description: URL to the profile picture of the Owner
 */

const defaultPicture = "no-user-photo.png";

const ownerSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: Roles.OWNER },
    status: { type: String, default: "¡Acabo de unirme a Villa Kebo!" },
    petsIDs: [{ type: Schema.Types.ObjectId, ref: "pets" }],
    reservationsIDs: [{ type: Schema.Types.ObjectId, ref: "reservations" }],
    profilePicture: { type: String, default: defaultPicture },
    //TODO DEFINE WHAT IS REQUIRED
});

export default model("owners", ownerSchema);
