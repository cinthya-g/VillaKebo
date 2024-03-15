import { Request, Response } from "express";

import { hashPassword } from "../utils/passwordHash";
import { genToken } from "../utils/genToken";
import { ResponseCodes } from "../utils/res-codes";

import Owner from "../models/owner";
import Caretaker from "../models/caretaker";

class RegisterController {

    async registerUser(req: Request, res: Response) {       
        try {
            const data = {
                username: req.body.username,
                email: req.body.email.toLowerCase(),
                password: hashPassword(req.body.password),
                isOwner: req.body.isOwner
            }
            
            if(!data.username || !data.email || !data.password || data.isOwner === undefined) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            let newUser;
            if(data.isOwner) {
                newUser = await Owner.create(data);
            } else {
                newUser = await Caretaker.create(data);
            }

            const token = genToken(newUser);
            res.status(ResponseCodes.CREATED).json(
                {
                    owner: newUser,
                    token: token
                }
            );
        }
        catch (error) {
            console.log('ERROR:', error);
            if (error.code === 11000 && error.keyPattern.email) {
                return res.status(ResponseCodes.BAD_REQUEST).send({ error: "Email is already registered." });
            }

            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }
}

export default new RegisterController();