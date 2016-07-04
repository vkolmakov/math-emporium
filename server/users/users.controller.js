import jwt from 'jwt-simple';
import db from 'sequelize-connect';

const SECRET = 'this is supersecret';

export const tokenForUser = (user) => {
    const timestamp = new Date().getTime();
    return jwt.encode({ sub: user.dataValues.id, iat: timestamp }, SECRET);
};

export const signup = async (req, res, next) => {
    const User = db.models.user;
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(422).send({ error: 'You must provide email and password!' });
    }
    try {
        const existingUser = await User.findOne({
            // TODO: Dont take inactive users
            where: {
                email,
            },
        });
        if (existingUser) {
            res.status(422).send({ error: 'Email is in use' });
        }

        const newUser = await User.create({
            email,
            password,
            activationToken: SECRET,
        });
        await newUser.sendActivationEmail();
        res.status(201).json({});
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: 'Something wrong happened...' });
    }
};

export const signin = (req, res, next) => {
    res.send({ token: tokenForUser(req.user) });
};

export const activate = async (req, res, next) => {
    const User = db.models.user;
    const { token } = req.body;
    if (!token) {
        res.status(422).send({ error: 'Must provide a token' });
    }
    try {
        const user = await User.findOne({
            where: {
                active: false,
                activationToken: token,
                activationTokenExpiration: {
                    $gte: Date.now(),
                },
            },
        });

        if (!user) {
            return res.status(422).send({ error: 'This activation token is inactive or your account is already activated' });
        }

        const result = await user.update({
            active: true,
        });

        res.status(200).json({ token: tokenForUser(result) });
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: 'Something wrong happened...' });
    }
};
