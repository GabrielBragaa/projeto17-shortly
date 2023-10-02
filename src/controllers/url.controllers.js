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

    const validation = schemaUrl.validate(req.body, {abortEarly: false});

    if (validation.error) {
        const error = validation.error.details.map(detail => detail.message);
        return res.status(422).send(error);
    }

    const shortUrl = nanoid(8)

    try {   

        const urlExists = await db.query(`SELECT * FROM urls WHERE url = $1;`, [req.body]);

        if (urlExists.rowCount !== 0) {
            return res.status(422).send("Essa URL já existe em nossa base de dados. Você pode acessá-la através desse link: http://" + urlExists.rows[0].shortUrl + ".com");
        }

        await db.query(`INSERT INTO urls(url, "shortUrl") VALUES($1, $2);`, [req.body, shortUrl]);

        const urlInfo = await db.query(`SELECT id, "shortUrl" FROM urls WHERE url = $1;`, [req.body]);

        res.status(201).send(urlInfo.rows[0]);

    } catch (err) {

    }
}