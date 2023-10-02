import Joi from "joi";
import db from "../database/db.js";
import { nanoid } from "nanoid";

export async function shortenUrl(req, res) {
    const {authorization} = req.headers;
    const token = authorization?.replace('Bearer ', '');

    if (!token) { 
        return res.status(401).send("Você deve estar logado.");
    }

    const schemaUrl = Joi.object({url: Joi.string().uri().required()});

    const {url} = req.body;

    const validation = schemaUrl.validate(req.body, {abortEarly: false});

    if (validation.error) {
        const error = validation.error.details.map(detail => detail.message);
        return res.status(422).send(error);
    }

    const shortUrl = nanoid(8)

    try {   

        const urlExists = await db.query(`SELECT * FROM urls WHERE url = $1;`, [url]);

        if (urlExists.rowCount !== 0) {
            return res.status(422).send("Essa URL já existe em nossa base de dados. Você pode acessá-la através desse link: http://" + urlExists.rows[0].shortUrl + ".com");
        }

        await db.query(`INSERT INTO urls(url, "shortUrl") VALUES($1, $2);`, [url, shortUrl]);

        const urlInfo = await db.query(`SELECT id, "shortUrl" FROM urls WHERE url = $1;`, [url]);

        res.status(201).send(urlInfo.rows[0]);

    } catch (err) {

    }
}

export async function getUrl(req, res) {
    const {id} = req.params;

    try {

        const url = await db.query(`SELECT id, "shortUrl", url FROM urls WHERE id = $1;`, [id]);

        if (url.rowCount === 0) {
            return res.status(404).send("A URL requisitada não existe.");
        }

        res.status(200).send(url.rows[0]);

    } catch (err) {

    }
}

export async function redirectUrl(req, res) {
    const {shortUrl} = req.params;

    try {

        const urlExists = await db.query(`SELECT * FROM urls WHERE "shortUrl" = $1;`, [shortUrl]);

        if (urlExists.rowCount === 0) {
            return res.status(404).send("Essa URL não existe.");
        }

        const rawVisitCount = await db.query(`SELECT "visitCount" FROM urls WHERE "shortUrl" = $1;`, [shortUrl]);
        let visitCount = rawVisitCount.rows[0].visitCount;
        visitCount = visitCount + 1;

        await db.query(`UPDATE urls SET "visitCount" = $1 WHERE "shortUrl" = $2;`, [visitCount, shortUrl]);
        const rawLink = await db.query(`SELECT url FROM urls WHERE "shortUrl" = $1;`, [shortUrl]);
        const link = rawLink.rows[0].url;

        res.redirect(link);

    } catch (err) {

    }
}