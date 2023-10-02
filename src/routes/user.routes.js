import { Router } from "express";
import { getMe, signIn, signUp } from "../controllers/user.controllers.js";

const userRouter = Router();

userRouter.post('/signup', signUp);
userRouter.post('/signin', signIn);
userRouter.get('/users/me', getMe)

export default userRouter;