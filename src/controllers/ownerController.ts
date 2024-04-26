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
import {addSocket,getSocket,getUserIdFromSocket} from "../utils/userSockets";


class OwnerController{
    /**
     * @swagger
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
     *                 owner:
     *                   $ref: '#/components/schemas/Owner'
     *       400:
     *         description: Missing required fields
     *       401:
     *         description: Owner not found or incorrect password
     *       500:
     *         description: Internal Server Error
     */
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

    /**
     * @swagger
     * /owner/update:
     *   put:
     *     tags: [Owner]
     *     summary: Update owner details
     *     description: Updates the details of an existing owner based on the provided information.
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
     *                     description: The ID of the owner to be updated
     *               update:
     *                 type: object
     *                 description: The fields of the owner to update with new values
     *                 properties:
     *                   username:
     *                     type: string
     *                     description: New username of the owner
     *                   email:
     *                     type: string
     *                     format: email
     *                     description: New email address of the owner
     *                   password:
     *                     type: string
     *                     format: password
     *                     description: New password of the owner
     *     responses:
     *       200:
     *         description: Owner details updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 updatedOwner:
     *                   $ref: '#/components/schemas/Owner'
     *       400:
     *         description: Missing required fields or bad request
     *       500:
     *         description: Internal Server Error
     */
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

    /**
     * @swagger
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
     */
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

            res.status(ResponseCodes.SUCCESS).send(pet);

        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }

    /**
     * @swagger
     * /owner/update:
     *   put:
     *     tags: [Pet]
     *     summary: Update pet details
     *     description: Updates the details of an existing pet based on the provided information.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - petID
     *               - update
     *             properties:
     *               petID:
     *                 type: string
     *                 description: The ID of the pet to be updated
     *               update:
     *                 type: object
     *                 description: The fields of the pet to update with new values
     *                 properties:
     *                   ownerID:
     *                     type: string
     *                     description: The owner's ID of the pet
     *                   name:
     *                     type: string
     *                     description: New name of the pet
     *                   age:
     *                     type: integer
     *                     description: New age of the pet
     *                   breed:
     *                     type: string
     *                     description: New breed of the pet
     *     responses:
     *       200:
     *         description: Pet details updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 updatedPet:
     *                   $ref: '#/components/schemas/Pet'
     *       400:
     *         description: Missing required fields or bad request
     *       500:
     *         description: Internal Server Error
     */
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

    /**
     * @swagger
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
                const owner = await Owner.findOneAndUpdate({ _id: ownerID }, {$pull: { petsIDs: petID }}, { new: true });
                res.status(ResponseCodes.SUCCESS).send(owner);
            }

        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }


    /**
     * @swagger
     * /owner/get-pets-by-owner:
     *   get:
     *     tags: [Owner]
     *     summary: Retrieve all pets owned by the owner
     *     description: Fetches all pets associated with the owner's account. Requires 'owner' or 'admin' role.
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Successfully retrieved list of pets owned by the owner
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Pet' // This should be defined elsewhere in your Swagger components
     *       400:
     *         description: Missing required fields, such as owner ID
     *       401:
     *         description: Unauthorized access
     *       500:
     *         description: Internal Server Error
     */
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
    
    /**
     * @swagger
     * /owner/upload-photo:
     *   post:
     *     tags: [Owner]
     *     summary: Upload and update owner's profile photo
     *     description: Uploads a new profile photo for the owner and updates the owner's profile with the new photo. Previous photo is deleted if it exists.
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             required:
     *               - ownerID
     *               - photo
     *             properties:
     *               ownerID:
     *                 type: string
     *                 description: The unique identifier of the owner
     *               photo:
     *                 type: string
     *                 format: binary
     *                 description: The photo file to upload
     *     responses:
     *       200:
     *         description: Profile photo updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Owner' // Assumes an Owner schema is defined in your Swagger components
     *       400:
     *         description: Missing required fields, such as owner ID or photo
     *       401:
     *         description: Unauthorized access
     *       500:
     *         description: Internal Server Error
     */
    async saveUploadedPhoto(req: Request, res: Response) {

            /* Expected request
                {
                    "ownerID": "aaaaaa",
                    "file": {
                        "originalname": "newFilename.jpg",
                        "fieldname": "aaaff",
                        "mimetype": "image",
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

    /**
     * @swagger
     * /owner/get-picture:
     *   get:
     *     tags: [Owner]
     *     summary: Get the owner's profile picture
     *     description: Retrieves the URL of the owner's profile picture stored in S3.
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: URL of the profile picture retrieved successfully
     *         content:
     *           text/plain:
     *             schema:
     *               type: string
     *       400:
     *         description: Missing required fields, such as owner ID
     *       401:
     *         description: Unauthorized access
     *       500:
     *         description: Internal Server Error
     */
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
    /**
     * @swagger
     * /owner/upload-pet-photo:
     *   post:
     *     tags: [Owner]
     *     summary: Upload and update a pet's profile photo
     *     description: Uploads a new profile photo for a pet and updates the pet's profile with the new photo. Previous photo is deleted if it exists.
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             required:
     *               - ownerID
     *               - petID
     *               - photo
     *             properties:
     *               ownerID:
     *                 type: string
     *                 description: The owner's unique identifier
     *               petID:
     *                 type: string
     *                 description: The pet's unique identifier
     *               photo:
     *                 type: string
     *                 format: binary
     *                 description: The photo file to upload
     *     responses:
     *       200:
     *         description: Pet's profile photo updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Pet' // Assumes a Pet schema is defined in Swagger components
     *       400:
     *         description: Missing required fields, such as owner ID, pet ID, or photo
     *       401:
     *         description: Unauthorized access or pet does not belong to the owner
     *       500:
     *         description: Internal Server Error
     */
    async saveUploadedPetPhoto(req: Request, res: Response) {
        /* Expected request
                {
                    "ownerID": "aaaaaa",
                    "petID": "bbbbbb",
                    "file": {
                        "originalname": "newFilename.jpg",
                        "fieldname": "aaaff",
                        "mimetype": "image",
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

    /**
     * @swagger
     * /owner/get-pet-picture:
     *   get:
     *     tags: [Owner]
     *     summary: Get the pet's profile picture
     *     description: Retrieves the URL of the pet's profile picture. Validates if the pet belongs to the owner before proceeding.
     *     security:
     *       - bearerAuth: []
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
     *                 description: The pet's unique identifier
     *     responses:
     *       200:
     *         description: URL of the pet's profile picture retrieved successfully
     *         content:
     *           text/plain:
     *             schema:
     *               type: string
     *       400:
     *         description: Missing required fields, such as pet ID
     *       401:
     *         description: Unauthorized access or pet does not belong to the owner
     *       500:
     *         description: Internal Server Error
     */
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

    /**
     * @swagger
     * /owner/upload-record:
     *   post:
     *     tags: [Owner]
     *     summary: Upload and update a pet's record
     *     description: Uploads a new record for the pet and updates the pet's profile with the new record file. Previous record file is deleted if it exists.
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             required:
     *               - ownerID
     *               - petID
     *               - pdf
     *             properties:
     *               ownerID:
     *                 type: string
     *                 description: The owner's unique identifier
     *               petID:
     *                 type: string
     *                 description: The pet's unique identifier
     *               pdf:
     *                 type: string
     *                 format: binary
     *                 description: The PDF file to upload as the pet's record
     *     responses:
     *       200:
     *         description: Pet's record updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Pet' // Assumes a Pet schema is defined in Swagger components
     *       400:
     *         description: Missing required fields, such as owner ID, pet ID, or PDF file
     *       401:
     *         description: Unauthorized access or pet does not belong to the owner
     *       500:
     *         description: Internal Server Error
     */
    async uploadPetRecord(req: Request, res: Response) {

        /* Expected request
            {
                "ownerID": "aaaaaa",
                "petID", "bbbbbb",
                "pdf": {
                    "originalname": "newFilename.jpg",
                    "fieldname": "aaaff",
                    "mimetype": "application/pdf",
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

    /**
     * @swagger
     * /owner/get-record:
     *   get:
     *     tags: [Owner]
     *     summary: Get the pet's medical record
     *     description: Retrieves the URL of the pet's medical record file stored in S3. Validates if the pet belongs to the owner before proceeding.
     *     security:
     *       - bearerAuth: []
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
     *                 description: The pet's unique identifier
     *     responses:
     *       200:
     *         description: URL of the pet's medical record retrieved successfully
     *         content:
     *           text/plain:
     *             schema:
     *               type: string
     *       400:
     *         description: Missing required fields, such as pet ID
     *       401:
     *         description: Unauthorized access or pet does not belong to the owner
     *       500:
     *         description: Internal Server Error
     */
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

    /**
     * @swagger
     * /owner/create-reservation:
     *   post:
     *     tags: [Owner]
     *     summary: Create a reservation for a pet
     *     description: Creates a new reservation for a pet. Checks if the pet already has an active reservation before proceeding.
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - petID
     *               - startDate
     *               - endDate
     *             properties:
     *               petID:
     *                 type: string
     *                 description: The pet's unique identifier
     *               startDate:
     *                 type: string
     *                 format: date-time
     *                 description: The start date of the reservation
     *               endDate:
     *                 type: string
     *                 format: date-time
     *                 description: The end date of the reservation
     *     responses:
     *       200:
     *         description: Reservation created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Reservation' // Assumes a Reservation schema is defined in Swagger components
     *       400:
     *         description: Missing required fields, such as pet ID, start date, or end date
     *       401:
     *         description: Unauthorized access or pet already has an active reservation
     *       500:
     *         description: Internal Server Error
     */
    async createReservation(req: Request, res: Response) {
        try {
            let ownerID = req.body.user.id;                        
            let { petID, startDate, endDate } = req.body;
            
            if (!ownerID || !petID || !startDate || !endDate) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            if(startDate > endDate) {
                res.status(ResponseCodes.BAD_REQUEST).send("Start date must be before end date");
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

    /**
     * @swagger
     * /owner/confirm-reservation:
     *   put:
     *     tags: [Owner]
     *     summary: Confirm a reservation
     *     description: Confirms a previously created reservation. A reservation cannot be confirmed if it has no activities.
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - reservationID
     *             properties:
     *               reservationID:
     *                 type: string
     *                 description: The unique identifier of the reservation to confirm
     *     responses:
     *       200:
     *         description: Reservation confirmed successfully
     *       400:
     *         description: Missing required fields
     *       404:
     *         description: No reservation found with that ID
     *       401:
     *         description: Unauthorized or reservations without activities cannot be confirmed
     *       500:
     *         description: Internal Server Error
     */
     async confirmReservation(req: Request, res: Response) {
        /* A previously created Reservation with Activities within its activitiesIDs array
         is confirmed by changing its status to confirmed: true
         Reservations can't be confirmed if they don't have any activities
         and can't be changed or updated, just canceled
         */

        // TODO: Develop the logic to add pets to certain GroupPets when a Reservation's confirmed
        try {
            let { reservationID } = req.body;
            
            if (!reservationID) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            const reservation = await Reservation.findOne({ _id: reservationID });
            if (!reservation) {
                res.status(ResponseCodes.NOT_FOUND).send("No reservation found with that ID");
                return;
            }

            if (reservation.activitiesIDs.length === 0) {
                res.status(ResponseCodes.UNAUTHORIZED).send("Reservations without activities can't be confirmed!");
                return;
            }

            reservation.confirmed = true;
            await reservation.save();

            res.status(ResponseCodes.SUCCESS).send(reservation);
        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }

    /**
     * @swagger
     * /owner/cancel-reservation:
     *   delete:
     *     tags: [Owner]
     *     summary: Cancel a reservation
     *     description: Cancels an existing reservation and deletes it along with any associated activities.
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - reservationID
     *             properties:
     *               reservationID:
     *                 type: string
     *                 description: The unique identifier of the reservation to cancel
     *     responses:
     *       200:
     *         description: Reservation canceled and deleted successfully
     *       400:
     *         description: Missing required fields
     *       404:
     *         description: No reservation found with that ID
     *       500:
     *         description: Internal Server Error
     */
    async cancelReservation(req: Request, res: Response) {
        // Delete the created reservation
        try {
            let ownerID = req.body.user.id;
            let { reservationID } = req.body;
            
            if (!reservationID || !ownerID) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            const result = await Reservation.findOneAndDelete({ _id: reservationID });
            if (!result) {
                res.status(ResponseCodes.NOT_FOUND).send("No reservation found with that ID");
            } else {
                // Save the petID from the reservation
                const { petID } = result;
                // Find the owner with that reservation and delete it from its reservationsIDs array
                await Owner.findOneAndUpdate({ _id: ownerID },{ $pull: { reservationsIDs: reservationID }});
                // Delete from the pet's currentReservation field
                await Pet.findOneAndUpdate({ _id: petID },{ currentReservation: null} );
                // Delete the activities associated with that reservationID
                await Activity.deleteMany({ reservationID: reservationID });
                
                res.status(ResponseCodes.SUCCESS).send("Reservation deleted successfully");
            }

        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }

    /**
     * @swagger
     * /owner/get-reservations-by-owner:
     *   get:
     *     tags: [Owner]
     *     summary: Get confirmed reservations by owner
     *     description: Retrieves all confirmed reservations made by the owner.
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Successfully retrieved confirmed reservations
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Reservation' // Assumes a Reservation schema is defined
     *       400:
     *         description: Missing required fields
     *       401:
     *         description: Unauthorized access
     *       500:
     *         description: Internal Server Error
     */
    async getOwnerReservations(req: Request, res: Response) {
        // Return the confirmed:true reservations made by the owner
        try {
            let ownerID = req.body.user.id;

            if (!ownerID) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            const reservations = await Reservation.find({ ownerID: ownerID, confirmed: true });
            res.status(ResponseCodes.SUCCESS).send(reservations);
        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }

    /**
     * @swagger
     * /owner/create-activity:
     *   post:
     *     tags: [Owner]
     *     summary: Create a new activity for a reservation
     *     description: Creates a new activity associated with a specific reservation.
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - reservationID
     *               - title
     *               - description
     *               - frequency
     *             properties:
     *               reservationID:
     *                 type: string
     *                 description: The unique identifier of the reservation
     *               title:
     *                 type: string
     *                 description: The title of the activity
     *               description:
     *                 type: string
     *                 description: The description of the activity
     *               frequency:
     *                 type: string
     *                 description: How often the activity occurs
     *     responses:
     *       200:
     *         description: Activity created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Activity' // Assumes an Activity schema is defined in Swagger components
     *       400:
     *         description: Missing required fields
     *       401:
     *         description: Unauthorized access
     *       500:
     *         description: Internal Server Error
    */
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
            const reservation = await Reservation.findOneAndUpdate(
                { _id: reservationID },
                { $addToSet: { activitiesIDs: activity._id } },
                { new: true }
            );
            
            res.status(ResponseCodes.SUCCESS).send({
                activity,
                reservation
            });

        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }

    /**
     * @swagger
     * /owner/update-activity:
     *   put:
     *     tags: [Owner]
     *     summary: Update an existing activity
     *     description: Updates the details of an existing activity.
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - activityID
     *               - update
     *             properties:
     *               activityID:
     *                 type: string
     *                 description: The unique identifier of the activity to update
     *               update:
     *                 type: object
     *                 description: The fields to update with their new values
     *     responses:
     *       200:
     *         description: Activity updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Activity' // Assumes an Activity schema is defined in Swagger components
     *       400:
     *         description: Missing required fields
     *       401:
     *         description: Unauthorized access
     *       500:
     *         description: Internal Server Error
     */
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

    /**
     * @swagger
     * /owner/delete-activity:
     *   delete:
     *     tags: [Owner]
     *     summary: Delete an existing activity
     *     description: Deletes an activity by its ID. Removes the activity from the associated reservation.
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - activityID
     *             properties:
     *               activityID:
     *                 type: string
     *                 description: The unique identifier of the activity to delete
     *     responses:
     *       200:
     *         description: Activity deleted successfully
     *       400:
     *         description: Missing required field 'activityID'
     *       404:
     *         description: No activity found with that ID
     *       500:
     *         description: Internal Server Error
     */
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

    /**
     * @swagger
     * /owner/get-activities-by-reservation:
     *   get:
     *     tags: [Owner]
     *     summary: Get activities for a reservation
     *     description: Retrieves all activities associated with a specific reservation.
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - reservationID
     *             properties:
     *               reservationID:
     *                 type: string
     *                 description: The unique identifier of the reservation to fetch activities for
     *     responses:
     *       200:
     *         description: Successfully retrieved activities for the reservation
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Activity' // Assumes an Activity schema is defined
     *       400:
     *         description: Missing required fields
     *       500:
     *         description: Internal Server Error
     */
    async getReservationActivities(req: Request, res: Response) {
        try {
            let { reservationID } = req.body;

            if (!reservationID) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            const activities = await Activity.find({ reservationID: reservationID });
            res.status(ResponseCodes.SUCCESS).send(activities);

        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }


}

export default new OwnerController();