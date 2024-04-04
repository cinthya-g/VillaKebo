import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

/**
 * @swagger
 * components:
 *  schemas:
 *    DatabaseConnection:
 *      type: object
 *      properties:
 *        status:
 *          type: string
 *          description: The current status of the database connection
 *        uri:
 *          type: string
 *          description: The URI used for the database connection
 */

const mongoURI = process.env.DB; // The database URI from environment variables

let db = mongoose.connection;

// Event listener for MongoDB connection success
db.on('connected', () => {
    console.log('MongoDB is running successfully');
    /**
     * @swagger
     * /database/status:
     *  get:
     *    description: Get the current status of the database connection
     *    tags: [Database]
     *    responses:
     *      200:
     *        description: A successful response indicating the database is connected
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/DatabaseConnection'
     */
});

// Connect to MongoDB using the URI
mongoose.connect(mongoURI)
    .then()
    .catch();
