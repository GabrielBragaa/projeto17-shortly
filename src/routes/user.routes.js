import { Router } from "express";
import { signUp } from "../controllers/user.controllers.js";

const userRouter = Router();

userRouter.post('/signup', signUp);

export default userRouter;