import { Router } from "express";
import { getUrl, shortenUrl } from "../controllers/url.controllers.js";

const urlRouter = Router();

urlRouter.post('/urls/shorten', shortenUrl);
urlRouter.get('/urls/:id', getUrl)

export default urlRouter;