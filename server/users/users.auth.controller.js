import jwt from 'jwt-simple';
import db from 'sequelize-connect';


const User = db.models.user;
const SECRET = process.env.SECRET || 'this is supersecret';


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
            // TODO: Dont take inactive users
            where: {
                email,
            },
        });
        if (existingUser) {
            res.status(422).send({ error: 'Email is in use' });
        }

        const newUser = User.build({
            email,
            password,
        });
        const activationTokenData = await newUser.generateActivationTokenData(SECRET);
        newUser.set({
            activationToken: activationTokenData.token,
            activationTokenExpiration: activationTokenData.expiration,
        });

        await newUser.save();

        await newUser.sendActivationEmail();
        res.status(201).json({});
    } catch (err) {
        next(err);
    }
};

export const signin = (req, res, next) => {
    res.send({ token: tokenForUser(req.user) });
};

export const activate = async (req, res, next) => {
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
        next(err);
    }
};

export const resendActivationEmail = async (req, res, next) => {
    // Reset activation token and send the activation email one more time
    // if the account is not activated
    const { email } = req.body;

    const user = await User.findOne({
        where: {
            email,
            active: false,
        },
    });

    if (!user) {
        return res.status(422).json({ error: 'Invalid email' });
    }

    try {
        const newActivationTokenData = await user.generateActivationTokenData(SECRET);
        await user.update({
            activationToken: newActivationTokenData.token,
            activationTokenExpiration: newActivationTokenData.expiration,
        });

        await user.sendActivationEmail();
    } catch (err) {
        return res.status(422).json({ error: `Failed to send the email` });
    }
    return res.status(201).json({ message: 'Email was sent' });
};
