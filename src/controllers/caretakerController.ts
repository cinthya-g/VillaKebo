import { Request, Response } from "express";

import User from "../models/caretaker";
import { ResponseCodes } from "../utils/res-codes";
import { Roles } from "../utils/roles";
import { hashPassword } from "../utils/passwordHash";
import { genToken } from "../utils/genToken";

class CaretakerController{

}

export default new CaretakerController();