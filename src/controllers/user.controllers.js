import db from '../database/db.js';
import userSchema from '../schemas/user.schemas.js';
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