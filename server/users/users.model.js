import bcrypt from 'bcrypt-nodejs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export default function createUserModel(sequelize, DataTypes) {
    const user = sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                // TODO: make a custom validator ensure uniqueness only by location
                msg: 'Email address must be unique!',
            },
            validate: {
                // TODO: add validation http://docs.sequelizejs.com/en/latest/docs/models-definition/
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                // TODO: add validation http://docs.sequelizejs.com/en/latest/docs/models-definition/
            },
            set(password) {
                const user = this;
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) {
                        console.log(err);
                    }
                    bcrypt.hash(password, salt, null, (err, hash) => {
                        if (err) {
                            console.log(err); // TODO: handle errors
                        }
                        user.setDataValue('password', hash);
                    });
                });
            },
        },
        name: {
            type: DataTypes.STRING,
        },
        group: {
            type: DataTypes.INTEGER,
            defaultValue: 0, // TODO ADD IN CONFIG
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        activationToken: {
            type: DataTypes.STRING,
            set(secret) {
                const user = this;
                crypto.randomBytes(20, (err, buf) => {
                    const token = buf.toString('hex');
                    user.setDataValue('activationToken', token);
                });
            },
        },
        activationTokenExpiration: {
            type: DataTypes.DATE,
            defaultValue: Date.now() + 3600000 * 24,
        },
    }, {
        timestamps: true,
        instanceMethods: {
            validatePassword(password, callback) {
                bcrypt.compare(password, this.getDataValue('password'), (err, isMatch) => {
                    if (err) {
                        return callback(err);
                    }
                    return callback(null, isMatch);
                });
            },
            sendActivationEmail() {
                // TODO: Move HOSTNAME to server env variable;
                const HOSTNAME = 'http://localhost:3000';

                const user = this;
                const token = user.getDataValue('activationToken');
                const [serverEmail, serverEmailPass] = ['user%40gmail.com', 'pass'];
                const transporter = nodemailer.createTransport(`smtps://${serverEmail}:${serverEmailPass}@smtp.gmail.com`);

                const mailOptions = {
                    from: serverEmail,
                    to: user.getDataValue('email'),
                    subject: 'Hello from ...',
                    text: `To activate your account at ... copy and paste this link into your browser ${HOSTNAME}/activate/${token}`,
                    html: `<p>To activate your account at ... click <a href="${HOSTNAME}/activate/${token}">here</a></p>`,
                };

                transporter.sendMail(mailOptions, function(err, info) {
                    if (err) {
                        console.log(err);
                        throw new Error('Failed to send an email');
                    }
                    return info;
                });
            },
        },
    });
    return user;
}
