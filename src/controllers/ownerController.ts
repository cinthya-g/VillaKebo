import { Request, Response } from "express";

import { comparePassword } from "../utils/passwordHash";
import { genToken } from "../utils/genToken";
import { ResponseCodes } from "../utils/res-codes";

import Owner from "../models/owner";
import Pet from "../models/pet";
import Reservation from "../models/reservation";
import Activity from "../models/activity";
import PetGroup from "../models/petgroup";
import { deleteFileFromS3, getS3Url } from "../middleware/upload-s3-middleware";

/**
 * @swagger
 * tags:
 *   name: Owner
 *   description: Operations related to pet owners
 * 
 * /auth/owner-login:
 *   post:
 *     tags: [Owner]
 *     summary: Log in an owner
 *     description: Authenticates an owner and returns an auth token.
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
 *                 description: Owner's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Owner's password
 *     responses:
 *       200:
 *         description: Successful login, returns token and owner information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/Owner'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Owner not found or incorrect password
 *       500:
 *         description: Internal Server Error
 * 
 * /owner/create-pet:
 *   post:
 *     tags: [Owner]
 *     summary: Create a pet for the owner
 *     description: Registers a new pet under the owner's account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - age
 *               - breed
 *             properties:
 *               name:
 *                 type: string
 *                 description: Pet's name
 *               age:
 *                 type: integer
 *                 description: Pet's age
 *               breed:
 *                 type: string
 *                 description: Pet's breed
 *     responses:
 *       200:
 *         description: Pet created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal Server Error
 * 
 * /owner/delete-pet:
 *   delete:
 *     tags: [Owner]
 *     summary: Delete an owner's pet
 *     description: Removes a pet from the owner's account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - petID
 *             properties:
 *               petID:
 *                 type: string
 *                 description: The ID of the pet to delete
 *     responses:
 *       200:
 *         description: Pet deleted successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal Server Error
 */
class OwnerController{
    
    async loginOwner(req: Request, res: Response) {
        try {
            let { email, password } = req.body;

            if (!email || !password) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            const owner = await Owner.findOne({ email: email.toLowerCase() });
            if (!owner || !comparePassword(password, owner.password)) {
                res.status(ResponseCodes.UNAUTHENTICATED).send("Owner not found or incorrect password");
                return;
            }
            
            const token = genToken(owner);
            res.status(ResponseCodes.SUCCESS).json(
                {
                    token: token,
                    user: owner
                }
            );
        }
        catch (error) {
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }

    async updateOwner(req: Request, res: Response) {
        try{
            const options = { new: true }; 

            let ownerID = req.body.user.id;
            let {update} = req.body;
            
            if (!ownerID || !update) {
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
            
            const updatedOwner = await Owner.findOneAndUpdate({ _id: ownerID }, update, options);
            res.status(ResponseCodes.SUCCESS).send(updatedOwner);
        }
        catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }

    async createPet(req: Request, res: Response) {
        try {
            let { name, age, breed  } = req.body;
            let ownerID = req.body.user.id;
            
            if (!name || !age || !breed ) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }
            
            const newPet = {
                ownerID: ownerID,
                name: name,
                age: age,
                breed: breed
            }

            const pet = await Pet.create(newPet);
            await Owner.findOneAndUpdate({ _id: ownerID }, { $push: { petsIDs: pet._id } });

            res.status(ResponseCodes.SUCCESS).send("Pet created successfully");

        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }
    
    async updatePet(req: Request, res: Response) {
        try{
            const options = { new: true }; // This option ensures that the updated document is returned
            
            let { petID, update } = req.body;
            
            if (!petID || !update) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            /* Expected request
                {
                    "petID": "66100027b52a931e19a6035d",
                    "update": {
                        "ownerID": "aaaff",
                        "name": "bbccb",
                        "age":  77795685,
                        "breed": "5ccc"
                        ...other fields if necessary...
                    }
                }
            */
            
            const updatedPet = await Pet.findOneAndUpdate({ _id: petID }, update, options);
            res.status(ResponseCodes.SUCCESS).send(updatedPet);
        }
        catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }

    async deletePet(req: Request, res: Response) {
        try {
            let ownerID = req.body.user.id;
            let { petID } = req.body;
            
            /* Expected request
                {   
                    (the user.id parameter comes from the authMiddleware already)
                    "petID": "66100027b52a931e19a6035d"
                }
            */

            if (!petID) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }
            
            const result = await Pet.findOneAndDelete({ _id: petID });
            if (!result) {
                res.status(ResponseCodes.NOT_FOUND).send("No pet found with that ID");
            } else {
                // Delete pet from the Owner's petsIDs array
                await Owner.findOneAndUpdate({ _id: ownerID }, {$pull: { petsIDs: petID }});
                res.status(ResponseCodes.SUCCESS).send("Pet deleted successfully");
            }

        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }

    async getOwnerPets(req: Request, res: Response) {
        try {
            let ownerID = req.body.user.id;

            if (!ownerID) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            const petsByOwnerIDs = await Owner.findOne({ _id: ownerID }, 'petsIDs');
            const petsByOwner = await Pet.find({ _id: { $in: petsByOwnerIDs.petsIDs } });
            res.status(ResponseCodes.SUCCESS).send(petsByOwner);

        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }

    async saveUploadedPhoto(req: Request, res: Response) {

            /* Expected request
                {
                    "ownerID": "aaaaaa",
                    "file": {
                        "originalname": "newFilename.jpg",
                        "fieldname": "aaaff",
                        "mimetype": "image",
                        ...other fields...
                    }
                }
            */

        try {
            const options = { new: true };
            const fileName =  req.file.originalname;
            const { ownerID } = req.body;

            if (!ownerID || !fileName) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }
            
            // Look for the previous photo on the S3 bucket and delete it 
            const owner = await Owner.findOne({ _id: ownerID });
            if (owner.profilePicture) {
                await deleteFileFromS3(process.env.PHOTOS_BUCKET_NAME, owner.profilePicture);
            }

            // Save the uploaded photo to the owner's profile
            const updatedOwner = await Owner.findOneAndUpdate({ _id: ownerID }, { profilePicture: fileName }, options);
            res.status(ResponseCodes.SUCCESS).send(updatedOwner);
        
        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }

    async getPicture(req: Request, res: Response) {
        try {
            const ownerID = req.body.user.id;
            if (!ownerID) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            const owner = await Owner.findOne({ _id: ownerID }, 'profilePicture');
            const pictureUrl = getS3Url(process.env.PHOTOS_BUCKET_NAME, owner.profilePicture);
            res.status(ResponseCodes.SUCCESS).send(pictureUrl);

        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }

    }

    async saveUploadedPetPhoto(req: Request, res: Response) {
        /* Expected request
                {
                    "ownerID": "aaaaaa",
                    "petID": "bbbbbb",
                    "file": {
                        "originalname": "newFilename.jpg",
                        "fieldname": "aaaff",
                        "mimetype": "image",
                        ...other fields...
                    }
                }
            */
        
        try {
            const options = { new: true };
            const fileName =  req.file.originalname;
            const { ownerID, petID } = req.body;
        
            if (!ownerID || !petID || !fileName) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }
                    
            // Check that the pet belongs to the owner
            const owner = await Owner.findOne({ _id: ownerID });
            if (!owner.petsIDs.includes(petID)) {
                res.status(ResponseCodes.UNAUTHORIZED).send("This pet does not belong to the owner");
                return;
            }

            // Look for the previous pet photo on the S3 bucket and delete it
            const pet = await Pet.findOne({ _id: petID });
            if (pet.profilePicture) {
                await deleteFileFromS3(process.env.PHOTOS_BUCKET_NAME, pet.profilePicture);
            }
        
            // Save the uploaded photo to the pets's profile
            const updatedPet = await Pet.findOneAndUpdate({ _id: petID }, { profilePicture: fileName }, options);
            res.status(ResponseCodes.SUCCESS).send(updatedPet);
                
        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }
    
    async getPetPicture(req: Request, res: Response) {
        try {
            const ownerID = req.body.user.id;
            const { petID } = req.body;

            if (!ownerID || !petID) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            // Check that the pet belongs to the owner
            const owner = await Owner.findOne({ _id: ownerID });
            if (!owner.petsIDs.includes(petID)) {
                res.status(ResponseCodes.UNAUTHORIZED).send("This pet does not belong to the owner");
                return;
            }

            // Get the pet's profile picture
            const pet = await Pet.findOne({ _id: petID }, 'profilePicture');
            const pictureUrl = getS3Url(process.env.PHOTOS_BUCKET_NAME, pet.profilePicture);
            res.status(ResponseCodes.SUCCESS).send(pictureUrl);

        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }

    }

    async uploadPetRecord(req: Request, res: Response) {

        /* Expected request
            {
                "ownerID": "aaaaaa",
                "petID", "bbbbbb",
                "pdf": {
                    "originalname": "newFilename.jpg",
                    "fieldname": "aaaff",
                    "mimetype": "application/pdf",
                    ...other fields...
                }
            }
        */

        try {
            const options = { new: true };
            const fileName =  req.file.originalname;
            const { ownerID, petID } = req.body;
            
            if (!ownerID || !petID || !fileName) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }
                        
            // Check that the pet belongs to the owner
            const owner = await Owner.findOne({ _id: ownerID });
            if (!owner.petsIDs.includes(petID)) {
                res.status(ResponseCodes.UNAUTHORIZED).send("This pet does not belong to the owner");
                return;
            }
    
            // Look for the previous pet record on the S3 bucket and delete it
            const pet = await Pet.findOne({ _id: petID });
            if (pet.record) {
                await deleteFileFromS3(process.env.FILES_BUCKET_NAME, pet.record);
            }
            
            // Save the uploaded photo to the pets's profile
            const updatedPet = await Pet.findOneAndUpdate({ _id: petID }, { record: fileName }, options);
            res.status(ResponseCodes.SUCCESS).send(updatedPet);
                    
        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }   
    }

    async getPetRecord(req: Request, res: Response) {
        try {
            const ownerID = req.body.user.id;
            const { petID } = req.body;

            if (!ownerID || !petID) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            // Check that the pet belongs to the owner
            const owner = await Owner.findOne({ _id: ownerID });
            if (!owner.petsIDs.includes(petID)) {
                res.status(ResponseCodes.UNAUTHORIZED).send("This pet does not belong to the owner");
                return;
            }

            // Get the pet's record
            const pet = await Pet.findOne({ _id: petID }, 'record');
            const recordUrl = getS3Url(process.env.FILES_BUCKET_NAME, pet.record);
            res.status(ResponseCodes.SUCCESS).send(recordUrl);

        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }

    }

    async createReservation(req: Request, res: Response) {
        try {
            let ownerID = req.body.user.id;                        
            let { petID, startDate, endDate } = req.body;
            
            if (!ownerID || !petID || !startDate || !endDate) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            const newReservation = {
                ownerID: ownerID,
                petID: petID,
                startDate: startDate,
                endDate: endDate
            }

            // Check if the currentReservation pet field is null
            const pet = await Pet.findOne({ _id: petID });
            if(pet.currentReservation) {
                res.status(ResponseCodes.UNAUTHORIZED).send("This pet already has an active reservation");
                return;
            }

            // If not, then create it and add it to the Owner's array and the Pet's currentReservation field
            const reservation = await Reservation.create(newReservation);
            await Owner.findOneAndUpdate({ _id: ownerID }, { $push: { reservationsIDs: reservation._id } });
            pet.currentReservation = reservation._id.toString();
            await pet.save();

            res.status(ResponseCodes.SUCCESS).send(reservation);

        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }

    async confirmReservation(req: Request, res: Response) {}

    async cancelReservation(req: Request, res: Response) {}

    async getOwnerReservations(req: Request, res: Response) {}

    async createActivity(req: Request, res: Response) {
        try {
            let { reservationID, title, description, frequency } = req.body;
            
            if (!reservationID || !title || !description || !frequency) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            const newActivity = {
                reservationID: reservationID,
                title: title,
                description: description,
                frequency: frequency
            }

            const activity = await Activity.create(newActivity);
            await Reservation.findOneAndUpdate({ _id: reservationID }, { $addToSet: { activitiesIDs: activity._id } });
            
            res.status(ResponseCodes.SUCCESS).send(activity);

        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }

    async updateActivity(req: Request, res: Response) {
        try{
            const options = { new: true }; 
            let { activityID, update } = req.body;
            
            if (!activityID || !update) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            /* Expected request
                {
                    "activityID": "66100027b52a931e19a6035d",
                    "update": {
                        "reservationID": "aaaa",
                        "title": "title",
                        "description": "aaaa",
                        "frequency": "once"
                        "timesCompleted": 3
                    }
                }
            */
            
            const updatedActivity = await Activity.findOneAndUpdate({ _id: activityID }, update, options);
            res.status(ResponseCodes.SUCCESS).send(updatedActivity);
        }
        catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }
    
    async deleteActivity(req: Request, res: Response) {
        try {
            let { activityID } = req.body;
            
            if (!activityID) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }
            
            const result = await Activity.findOneAndDelete({ _id: activityID });
            if (!result) {
                res.status(ResponseCodes.NOT_FOUND).send("No activity found with that ID");
            } else {
                // Delete from the reservation's activitiesIDs array
                await Reservation.findOneAndUpdate({ activitiesIDs: activityID }, {$pull: { activitiesIDs: activityID }});
                res.status(ResponseCodes.SUCCESS).send("Activity deleted successfully");
            }

        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }

    async getReservationActivities(req: Request, res: Response) {}


}

export default new OwnerController();