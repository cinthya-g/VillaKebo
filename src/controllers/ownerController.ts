import { Request, Response } from "express";

import Owner from "../models/owner";
import { ResponseCodes } from "../utils/res-codes";
import { Rols } from "../utils/rols";
import { hashPassword, comparePassword } from "../utils/passwordHash";
import { genToken } from "../utils/genToken";

class OwnerController{
    async registerOwner(req: Request, res: Response){
        try {
            const data = {
                username: req.body.username,
                email: req.body.email.toLowerCase(),
                password: hashPassword(req.body.password),
                rol: Rols.OWNER
            }

            if(!data.username || !data.email || !data.password){
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            const owner = await Owner.create(data);
            const token = genToken(owner);
            res.status(ResponseCodes.SUCCESS).send(token);
        }
        catch (error) {
            if (error.code === 11000 && error.keyPattern.email) {
                return res.status(ResponseCodes.BAD_REQUEST).send({ error: "Email is already registered." });
            }

            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }

    async loginOwner(req: Request, res: Response){
        try {
            let { email, password } = req.body;

            if (!email || !password) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            const owner = await Owner.findOne({ email: email.toLowerCase() });
            if (!owner || !comparePassword(password, owner.password)) {
                res.status(ResponseCodes.UNAUTHENTICATED).send("User not found or password incorrect");
                return;
            }
            
            const token = genToken(owner);
            res.status(ResponseCodes.SUCCESS).send(token);
        }
        catch (error) {
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }
}

export default new OwnerController();