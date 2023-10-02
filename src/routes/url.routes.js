import { Router } from "express";
import { shortenUrl } from "../controllers/url.controllers.js";

const urlRouter = Router();

urlRouter.post('/urls/shorten', shortenUrl);

export default urlRouter;