import { Router } from "express";
import { deleteUrl, getUrl, redirectUrl, shortenUrl } from "../controllers/url.controllers.js";

const urlRouter = Router();

urlRouter.post('/urls/shorten', shortenUrl);
urlRouter.get('/urls/:id', getUrl);
urlRouter.get('/urls/open/:shortUrl', redirectUrl);
urlRouter.delete('/urls/:id', deleteUrl);

export default urlRouter;