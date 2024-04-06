import { Request, Response } from "express";

import { comparePassword } from "../utils/passwordHash";
import { genToken } from "../utils/genToken";
import { ResponseCodes } from "../utils/res-codes";

import Caretaker from "../models/caretaker";
import Pet from "../models/pet";
import { deleteFileFromS3 } from "../middleware/upload-s3-middleware";

 /**
 * @swagger
 * tags:
 *   name: Caretaker
 *   description: Caretaker related operations
 * 
 * /auth/caretaker-login:
 *   post:
 *     tags: [Caretaker]
 *     summary: Log in a caretaker
 *     description: Authenticates a caretaker and returns an auth token.
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
 *                   description: Authentication token
 *                 user:
 *                   $ref: '#/components/schemas/Caretaker'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Caretaker not found or incorrect password
 *       500:
 *         description: Internal Server Error
 */   
class CaretakerController{

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

}

export default new CaretakerController();