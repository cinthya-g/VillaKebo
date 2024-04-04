import { Request, Response } from "express";

import { comparePassword } from "../utils/passwordHash";
import { genToken } from "../utils/genToken";
import { ResponseCodes } from "../utils/res-codes";

import Owner from "../models/owner";
import Pet from "../models/pet";

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

            await Pet.create(newPet);
            res.status(ResponseCodes.SUCCESS).send("Pet created successfully");

        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }

    async deletePet(req: Request, res: Response) {
        try {
            let { petID } = req.body;

            if (!petID) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }
            
            await Pet.findOneAndDelete({ _id: petID });
            res.status(ResponseCodes.SUCCESS).send("Pet deleted successfully");

        } catch(error) {
            console.log('ERROR:', error);
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }

}

export default new OwnerController();