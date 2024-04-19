import { Request, Response } from "express";

import { comparePassword } from "../utils/passwordHash";
import { genToken } from "../utils/genToken";
import { ResponseCodes } from "../utils/res-codes";

import Caretaker from "../models/caretaker";
import Pet from "../models/pet";
import Reservation from "../models/reservation";
import { deleteFileFromS3, getS3Url } from "../middleware/upload-s3-middleware";


class CaretakerController{
    /**
     * @swagger
     * /auth/caretaker-login:
     *   post:
     *     tags: [Caretaker]
     *     summary: Log in a caretaker
     *     description: Authenticates a caretaker using their email and password, returning an authentication token and caretaker details if successful.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 description: Caretaker's email address
     *               password:
     *                 type: string
     *                 format: password
     *                 description: Caretaker's password
     *     responses:
     *       200:
     *         description: Successful login
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 token:
     *                   type: string
     *                   description: Authentication token issued upon successful authentication
     *                 user:
     *                   $ref: '#/components/schemas/Caretaker'
     *       400:
     *         description: Missing required fields such as email or password
     *       401:
     *         description: Authentication failed due to invalid credentials or caretaker not found
     *       500:
     *         description: Internal Server Error
     */
    async loginCaretaker(req: Request, res: Response) {
        try {
            let { email, password } = req.body;

            if (!email || !password) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            const caretaker = await Caretaker.findOne({ email: email.toLowerCase() });
            if (!caretaker || !comparePassword(password, caretaker.password)) {
                res.status(ResponseCodes.UNAUTHENTICATED).send("Caretaker not found or incorrect password");
                return;
            }
            
            const token = genToken(caretaker);
            res.status(ResponseCodes.SUCCESS).json(
                {
                    token: token,
                    user: caretaker
                }
            );
        }
        catch (error) {
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }
    /**
     * @swagger
     * /caretaker/update-caretaker:
     *   put:
     *     tags: [Caretaker]
     *     summary: Update caretaker details
     *     description: Updates the details of an existing caretaker based on the provided information in the request body.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - user
     *               - update
     *             properties:
     *               user:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                     description: The ID of the caretaker to be updated
     *               update:
     *                 type: object
     *                 description: The fields of the caretaker to update with new values
     *                 properties:
     *                   username:
     *                     type: string
     *                     description: New username of the caretaker
     *                   email:
     *                     type: string
     *                     format: email
     *                     description: New email address of the caretaker
     *                   password:
     *                     type: string
     *                     format: password
     *                     description: New password for the caretaker
     *     responses:
     *       200:
     *         description: Caretaker details updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Caretaker'
     *       400:
     *         description: Missing required fields or incorrect update data
     *       500:
     *         description: Internal Server Error
     */
    async updateCaretaker(req: Request, res: Response) {
        try{
            const options = { new: true }; 

            let caretakerID = req.body.user.id;
            let {update} = req.body;
            
            if (!caretakerID || !update) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            /* Expected request
                {
                    (the user.id parameter comes from the authMiddleware already)
                    "update": {
                        "username": "bbccb",
                        "email": "aaaff",
                        "password": "5ccc"
                        ...other fields if necessary...
                    }
                }
            */
            
            const updatedCaretaker = await Caretaker.findOneAndUpdate({ _id: caretakerID }, update, options);
            res.status(ResponseCodes.SUCCESS).send(updatedCaretaker);
        }
        catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }
    /**
     * @swagger
     * /caretaker/upload-photo:
     *   post:
     *     tags: [Caretaker]
     *     summary: Upload a profile photo for a caretaker
     *     description: Uploads a photo to the caretaker's profile, replacing the existing one if applicable, and returns the updated caretaker information including the new photo.
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             required:
     *               - caretakerID
     *               - file
     *             properties:
     *               caretakerID:
     *                 type: string
     *                 description: The ID of the caretaker whose photo is being uploaded
     *               file:
     *                 type: string
     *                 format: binary
     *                 description: The photo file to upload
     *     responses:
     *       200:
     *         description: Photo uploaded successfully and caretaker profile updated
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Caretaker'
     *       400:
     *         description: Missing required fields or incorrect file format
     *       500:
     *         description: Internal Server Error
     */
    async saveUploadedPhoto(req: Request, res: Response) {
        try {
            const options = { new: true };
            const fileName =  req.file.originalname;
            const { caretakerID } = req.body;

            if (!caretakerID) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }
            
            // Look for the previous photo on the S3 bucket and delete it 
            const caretaker = await Caretaker.findOne({ _id: caretakerID });
            if (caretaker.profilePicture) {
                await deleteFileFromS3(process.env.PHOTOS_BUCKET_NAME, caretaker.profilePicture);
            }

            // Save the uploaded photo to the caretaker's profile
            const updatedCaretaker = await Caretaker.findOneAndUpdate({ _id: caretakerID }, { profilePicture: fileName }, options);
            res.status(ResponseCodes.SUCCESS).send(updatedCaretaker);
        
        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }
    /**
     * @swagger
     * /caretaker/get-picture:
     *   get:
     *     tags: [Caretaker]
     *     summary: Get the profile picture of a caretaker
     *     description: Retrieves the URL of the profile picture for the specified caretaker based on the caretaker ID provided in the request body.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - id
     *             properties:
     *               id:
     *                 type: string
     *                 description: The ID of the caretaker to retrieve the picture for
     *     responses:
     *       200:
     *         description: Profile picture URL retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 url:
     *                   type: string
     *                   description: URL of the profile picture
     *       400:
     *         description: Missing required fields
     *       500:
     *         description: Internal Server Error
     */
    async getPicture(req: Request, res: Response) {
        try {
            const caretakerID = req.body.user.id;
            if (!caretakerID) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            const caretaker = await Caretaker .findOne({ _id: caretakerID }, 'profilePicture');
            const pictureUrl = getS3Url(process.env.PHOTOS_BUCKET_NAME, caretaker.profilePicture);
            res.status(ResponseCodes.SUCCESS).send(pictureUrl);

        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }

    }

    // TODO: Finish these functions with dummy responses
    async joinPetGroup(req: Request, res: Response) {
        // The caretaker will join a petgroup
        /**
         * Expected request
         * {
         *     "groupID": "5f7b1b7b4b3b4b3b4b3b4b3b"
         * }
         */
        res.status(ResponseCodes.SUCCESS).send("Dummy: You joined the petgroup!");
    }

    async getPetGroups(req: Request, res: Response) {
        // The caretaker will get the petgroups they are part of
        res.status(ResponseCodes.SUCCESS).send("Dummy: Here are the petgroups!");
    }

    async getPetGroup(req: Request, res: Response) {
        // The caretaker will get the details of a petgroup
        res.status(ResponseCodes.SUCCESS).send("Dummy: Here is the single petgroup!");
    }

    async accomplishActivity(req: Request, res: Response) {
        // The caretaker will increse the 'timesCompleted' field of an activity when it is accomplished
        /**
         * Expected request
         * {
         *     "activityID": "5f7b1b7b4b3b4b3b4b3b4b3b"
         * }
         */
        res.status(ResponseCodes.SUCCESS).send("Dummy: You accomplished the activity one more time!");
    }


}

export default new CaretakerController();