import { Request, Response } from "express";

import { comparePassword } from "../utils/passwordHash";
import { genToken } from "../utils/genToken";
import { ResponseCodes } from "../utils/res-codes";

import Owner from "../models/owner";
import Pet from "../models/pet";

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