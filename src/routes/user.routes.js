import { Router } from "express";
import { getMe, ranking, signIn, signUp } from "../controllers/user.controllers.js";

const userRouter = Router();

userRouter.post('/signup', signUp);
userRouter.post('/signin', signIn);
userRouter.get('/users/me', getMe);
userRouter.get('/ranking', ranking)

export default userRouter;