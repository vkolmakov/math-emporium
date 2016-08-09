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
        if (!User.validateEmail(email)) {
            throw new Error('Email does not satsfy all requirements');
        }

        if (!User.validatePassword(password)) {
            throw new Error('Password does not satsfy all requirements');
        }

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
        });

        const passwordHash = await newUser.hashAndSaltPassword(password);
        const activationTokenData = await newUser.generateActivationTokenData(SECRET);

        newUser.set({
            password: passwordHash,
            activationToken: activationTokenData.token,
            activationTokenExpiration: activationTokenData.expiration,
        });

        await newUser.sendActivationEmail();

        await newUser.save();

        res.status(201).json({});
    } catch (err) {
        next(err);
    }
};

export const signin = (req, res, next) => {
    const user = req.user;
    res.send({
        group: user.dataValues.group,
        token: tokenForUser(user),
    });
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
                activationTokenExpiration: { $gte: Date.now() },
            },
        });

        if (!user) {
            return res.status(422).send({ error: 'This activation token is inactive or your account is already activated' });
        }

        const result = await user.update({
            active: true,
        });

        res.status(200).json({
            token: tokenForUser(result),
            group: result.dataValues.group,
        });
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
        next(err);
    }
    return res.status(201).json({ message: 'Email was sent' });
};

export const requestResetPassword = async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({
        where: {
            email,
            active: true,
        },
    });

    if (!user) {
        return res.status(422).json({ error: 'Invalid email' });
    }

    try {
        const resetPasswordData = await user.generateResetPasswordData(SECRET);
        await user.update({
            resetPasswordToken: resetPasswordData.token,
            resetPasswordTokenExpiration: resetPasswordData.expiration,
        });

        await user.sendResetPasswordEmail();
    } catch (err) {
        next(err);
    }
    return res.status(201).json({ message: 'Email was sent' });
};

export const resetPassword = async (req, res, next) => {
    const { email, token, password: newPassword } = req.body;

    const user = await User.findOne({
        where: {
            email,
            resetPasswordToken: token,
            resetPasswordTokenExpiration: { $gte: Date.now() },
        },
    });

    if (!user) {
        return res.status(422).json({ error: 'Invalid email or token' });
    }

    try {
        if (!User.validatePassword(newPassword)) {
            throw new Error('Password does not satsfy all requirements');
        }

        const passwordHash = await user.hashAndSaltPassword(newPassword);

        await user.update({
            password: passwordHash,
            resetPasswordTokenExpiration: Date.now(),
        });

        return res.status(201).json({ message: 'Password was reset' });
    } catch (err) {
        next(err);
    }
};
