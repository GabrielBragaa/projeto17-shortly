import db from '../database/db.js';
import {userSchema, loginSchema} from '../schemas/user.schemas.js';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

export async function signUp(req, res) {
    const {name, email, password, confirmPassword} = req.body;

    if (!name || !email || !password || !confirmPassword) {
        return res.status(422).send("Preencha todos os campos.");
    }

    if (password !== confirmPassword) {
        return res.status(422).send("As senhas devem coincidir.");
    }

    const user = {name, email, password};

    const validation = userSchema.validate(user, {abortEarly: false});

    if (validation.error) {
       const error = validation.error.details.map(detail => detail.message);
       return res.status(422).send(error);
    }

    const encryptedPassword = bcrypt.hashSync(password, 10);

    try {
        
        const userExists = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);

        if (userExists.rowCount !== 0) {
            return res.status(409).send("E-mail já cadastrado.");
        }

        await db.query(`INSERT INTO users(name, email, password) VALUES($1, $2, $3);`, [name, email, encryptedPassword]);

        res.status(201).send("Usuário cadastrado com sucesso!");
    } catch (err) {
        return res.status(500).send(err)
    }

}

export async function signIn(req, res) {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(422).send("Preencha todos os campos.");
    }

    const user = {email, password};

    const validation = loginSchema.validate(user, {abortEarly: false});

    if (validation.error) {
        const error = validation.error.details.map(detail => detail.message);
        return res.status(422).send(error);
    }

    try {
        
        const userExists = await db.query(`SELECT * FROM users WHERE email = $1;`, [email]);

        if (userExists.rowCount === 0) {
            return res.status(401).send("Usuário não cadastrado.");
        }

        const rawDbPassword = await db.query(`SELECT password FROM users WHERE email = $1;`, [email]);
        const dbPassword = rawDbPassword.rows[0].password;

        const rawUserId = await db.query(`SELECT id FROM users WHERE email = $1;`, [email]);
        const userId = rawUserId.rows[0].id;

        if (bcrypt.compareSync(password, dbPassword) === true) {
            const token = uuid();
            await db.query(`INSERT INTO sessions("userID", token) VALUES($1, $2);`, [userId, token]);
            res.status(200).send(token);
        } else {
            return res.status(401).send("Senha incorreta.");
        }

    } catch (err) {
        return res.status(500).send(err);
    }
}

export async function getMe(req, res) { 
    const {authorization} = req.headers;
    const token = authorization?.replace('Bearer ', '');

    if (!token) { 
        return res.status(401).send("Você deve estar logado.");
    }

    try {

        const user = await db.query(`SELECT users.id AS "id", users.name AS "name", SUM("visitCount") AS "visitCount"
        FROM sessions
        JOIN users ON users.id = sessions."userID" 
        JOIN urls ON "createdBy" = sessions."userID"
        WHERE token = $1
        GROUP BY users.id;`, [token]);

        res.send(user.rows);

    } catch (err) { 

    }
}

export async function ranking(req, res) {


    try {

        const user = await db.query(`SELECT users.id AS "id", users.name AS "name", COALESCE(SUM("visitCount"), 0) AS "visitCount", 
        COALESCE(COUNT("createdBy"), 0) AS "linksCount"
        FROM sessions
        LEFT JOIN users ON users.id = sessions."userID" 
        LEFT JOIN urls ON "createdBy" = sessions."userID"
        GROUP BY users.id
        ORDER BY "visitCount" DESC
        LIMIT 10;`);

        res.send(user.rows)

    } catch (err) {
        res.status(500).send(err)
    }

}