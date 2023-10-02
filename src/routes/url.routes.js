import { Router } from "express";
import { getUrl, redirectUrl, shortenUrl } from "../controllers/url.controllers.js";

const urlRouter = Router();

urlRouter.post('/urls/shorten', shortenUrl);
urlRouter.get('/urls/:id', getUrl);
urlRouter.get('/urls/open/:shortUrl', redirectUrl);

export default urlRouter;