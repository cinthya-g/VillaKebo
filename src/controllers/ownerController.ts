import { Request, Response } from "express";

import Users from "../models/users";
import { ResponseCodes } from "../utils/res-codes";

class OwnerController{
    async registerOwner(req: Request, res: Response){
        try {
            const data = {
                username: req.body.username,
                email: req.body.email,
                password: req.body.password, //TODO Hash password
                rol: "owner" //TODO Change to enum
            }

            if (!data.username || !data.email || !data.password) {
                res.status(ResponseCodes.BAD_REQUEST).send("Missing required fields");
                return;
            }

            const user = await Users.create(data);
            //TODO Token
            res.status(ResponseCodes.SUCCESS).send(user);
        }
        catch (error) {
            res.status(ResponseCodes.SERVER_ERROR).send("Internal Server Error");
        }
    }
}

export default new OwnerController();