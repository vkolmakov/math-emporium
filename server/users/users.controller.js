import jwt from 'jwt-simple';
import db from 'sequelize-connect';

const User = db.models.user;
const SECRET = 'this is supersecret';

export const tokenForUser = (user) => {
    const timestamp = new Date().getTime();
    return jwt.encode({ sub: user.dataValues.id, iat: timestamp }, SECRET);
};

export const signup = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(422).send({ error: 'You must provide email and password!' });
    }
    try {
        const existingUser = await User.findOne({
            where: { email },
        });
        if (existingUser) {
            res.status(422).send({ error: 'Email is in use' });
        }

        const newUser = await User.create(req.body, {
            fields: ['email', 'password'],
        });
        res.status(201).json({ token: tokenForUser(newUser) });
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: 'Something wrond happened...' });
    }
};

export const signin = (req, res, next) => {
    res.send({ token: tokenForUser(req.user) });
};
