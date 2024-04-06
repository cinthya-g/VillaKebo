import {Schema, model} from "mongoose";


/**
 * @swagger
 * components:
 *  schemas:
 *    Activity:
 *      type: object
 *      required:
 *        - title
 *        - description
 *        - frequency
 *      properties:
 *        title:
 *          type: string
 *          description: Activity title
 *        Description:
 *          type: string
 *          description: Activity description
 *        Frequency:
 *          type: string
 *          description: How often the activity occurs
 *        timesCompleted:
 *          type: number
 *          default: 0
 *          description: Status of how many times the activity has been completed according to the frequency parameter
 */

const activitySchema = new Schema({
    reservationID: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    frequency: { type: String, required: true },
    timesCompleted: { type: Number, default: 0 },
});

export default model("activities", activitySchema);