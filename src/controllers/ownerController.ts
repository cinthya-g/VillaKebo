import { Request, Response } from "express";

import { comparePassword } from "../utils/passwordHash";
import { genToken } from "../utils/genToken";
import { ResponseCodes } from "../utils/res-codes";

import Owner from "../models/owner";
import Pet from "../models/pet";
import upload from "middleware/aws-upload-middleware";

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
    
    async uploadPetRecords(req: Request, res: Response) {
        try{
            let { petID, records } = req.body;

            if (!petID || !records) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            const pet = await Pet.findOne({ _id: petID });

            if (!pet) {
                res.status(ResponseCodes.BAD_REQUEST).send("This pet Does not exist");
                return;
            }

            //Todo : Upload records to S3
            // const upload = upload.single('file'); ???
            // file name = petID + 'Record' ??

            res.status(ResponseCodes.SUCCESS).send("Records uploaded successfully");
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
            let { ownerID, petID } = req.body;
            
            /* Expected request
                {   
                    "ownerID": "66100027b52a931e19a6111a",
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
            let { ownerID } = req.body.user;

            console.log(ownerID);

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


}

export default new OwnerController();