import {Schema, model} from "mongoose";


/**
 * @swagger
 * components:
 *  schemas:
 *    Activity:
 *      type: object
 *      required:
 *        - name
 *        - Description
 *        - Frequency
 *      properties:
 *        name:
 *          type: string
 *          description: Activity name
 *        Description:
 *          type: string
 *          description: Activity description
 *        Frequency:
 *          type: string
 *          description: How often the activity occurs
 *        Completed:
 *          type: boolean
 *          default: false
 *          description: Status of whether the activity is completed or not
 */

const activitySchema = new Schema({
    name: { type: String, required: true },
    Description: { type: String, required: true },
    Frequency: { type: String, required: true },
    Completed: { type: Boolean, default: false },
});

export default model("activities", activitySchema);