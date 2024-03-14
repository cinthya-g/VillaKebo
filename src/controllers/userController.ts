import { Request, Response } from "express";

import User from "../models/users";
import { ResponseCodes } from "../utils/res-codes";
import { Rols } from "../utils/rols";
import { hashPassword } from "../utils/passwordHash";
import { genToken } from "../utils/genToken";

class UserController{

}

export default new UserController();