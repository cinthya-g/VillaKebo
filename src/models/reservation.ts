import { Schema, model } from "mongoose";

/**
 * @swagger
 * components:
 *  schemas:
 *    Reservation:
 *      type: object
 *      required:
 *        - ownerID
 *        - petID
 *        - startDate
 *        - endDate
 *        - activitiesIDs
 *      properties:
 *        ownerID:
 *          type: string
 *          description: Identifier for the owner making the reservation
 *        petID:
 *          type: string
 *          description: Identifier for the pet for which the reservation is made
 *        startDate:
 *          type: date
 *          description: Start date of the reservation period
 *        endDate:
 *          type: date
 *          description: End date of the reservation period
 *        activitiesIDs:
 *          type: array
 *          items:
 *            type: string
 *          description: List of activities the pet will participate in during the reservation
 */

const reservationSchema = new Schema({
    ownerID: { type: String, required: true },
    petID: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    activitiesIDs:[ { type: String, required: true }],
});

export default model("reservations", reservationSchema);