import bcrypt from 'bcrypt-nodejs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import moment from 'moment';
import { CalendarService } from '../services/googleApis';
import { TIMEZONE, AUTH_GROUPS, TIMESTAMP_VISIBLE_FORMAT, pickOneFrom } from '../aux';

const TOKEN_EXPIRATION_PERIOD = 3600000 * 24;

export default function createUserModel(sequelize, DataTypes) {
    const user = sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                msg: 'Email address must be unique!',
            },
        },
        password: {
            // salt + hash is stored, password validation is a class method
            type: DataTypes.STRING,
            allowNull: false,
        },
        firstName: {
            type: DataTypes.STRING,
        },
        lastName: {
            type: DataTypes.STRING,
        },
        group: {
            type: DataTypes.INTEGER,
            defaultValue: AUTH_GROUPS.user,
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        activationToken: {
            type: DataTypes.STRING,
        },
        activationTokenExpiration: {
            type: DataTypes.DATE,
        },
        resetPasswordToken: {
            type: DataTypes.STRING,
        },
        resetPasswordTokenExpiration: {
            type: DataTypes.DATE,
        },
        googleCalendarAppointmentId: {
            type: DataTypes.STRING,
        },
        googleCalendarAppointmentDate: {
            type: DataTypes.DATE,
        },
        googleCalendarId: {
            type: DataTypes.STRING,
        },
    }, {
        timestamps: true,
        classMethods: {
            associate(models) {
                user.belongsTo(models.location);
                user.belongsTo(models.course);
            },
            validatePassword(password) {
                const minPasswordLength = 8;
                const requirements = [
                    password.length >= minPasswordLength,
                ];

                return requirements.every(requirement => !!requirement);
            },
            validateEmail(email) {
                const requirements = [
                    email.match(/.+@.+\.\w+/),
                    // TODO: add school email requirement
                ];

                return requirements.every(requirement => !!requirement);
            },
        },
        instanceMethods: {
            hashAndSaltPassword(password) {
                return new Promise((resolve, reject) => {
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) {
                            reject(err);
                        }
                        bcrypt.hash(password, salt, null, (err, hash) => {
                            if (err) {
                                reject(err);
                            }
                            resolve(hash);
                        });
                    });
                });
            },

            validatePassword(password, _) {
                return new Promise((resolve, reject) => {
                    bcrypt.compare(password, this.getDataValue('password'), (err, isMatch) => {
                        if (err) {
                            reject(err);
                        }
                        resolve(isMatch);
                    });
                });
            },

            generateRandomToken() {
                return new Promise((resolve, reject) => {
                    crypto.randomBytes(32, (err, buf) => {
                        if (err) {
                            reject(err);
                        }
                        const token = buf.toString('hex');
                        resolve(token);
                    });
                });
            },

            async generateActivationTokenData(secret) {
                const token = await this.generateRandomToken();
                return {
                    token,
                    expiration: Date.now() + TOKEN_EXPIRATION_PERIOD,
                };
            },

            async generateResetPasswordData(secret) {
                const token = await this.generateRandomToken();
                return {
                    token,
                    expiration: Date.now() + TOKEN_EXPIRATION_PERIOD,
                };
            },

            sendEmail({ subject, text, html }) {
                const user = this;
                return new Promise((resolve, reject) => {
                    const [serverEmail, serverEmailPass] = [process.env.EMAIL_ADDRESS,
                                                            process.env.EMAIL_PASSWORD];

                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: serverEmail,
                            pass: serverEmailPass,
                        },
                    });

                    const mailOptions = {
                        from: serverEmail,
                        to: user.getDataValue('email'),
                        subject,
                        text,
                        html,
                    };

                    transporter.sendMail(mailOptions, (err, info) => {
                        if (err) {
                            reject(err);
                        }
                        resolve(info);
                    });
                });
            },
            sendActivationEmail() {
                const user = this;
                const HOSTNAME = process.env.HOSTNAME;
                const token = user.getDataValue('activationToken');
                const emailBody = `To activate your account click on this link:\n${HOSTNAME}/activate/${token}\n`;

                const mailOptions = {
                    subject: `Hello from ${HOSTNAME}`,
                    ...user.composeEmail(emailBody),
                };

                return user.sendEmail(mailOptions);
            },
            sendResetPasswordEmail() {
                const user = this;
                const HOSTNAME = process.env.HOSTNAME;
                const token = user.getDataValue('resetPasswordToken');
                const emailBody = `To reset your password follow this link:\n${HOSTNAME}/reset-password/${token}\n`;
                const mailOptions = {
                    subject: `Reset your password at ${HOSTNAME}`,
                    ...user.composeEmail(emailBody),
                };

                return user.sendEmail(mailOptions);
            },
            createGoogleCalendarAppointment({ time, course, location, tutor, comments }) {
                const user = this;
                moment.tz.setDefault(TIMEZONE);
                return new Promise(async (resolve, reject) => {
                    const calendarService = new CalendarService;
                    await calendarService.create();

                    const calendarId = location.calendarId;
                    const startTime = time.toISOString();
                    const endTime = moment(time).add(1, 'hours').toISOString();
                    const summary = user.getAppointmentSummary({ course, tutor });
                    const description = user.getAppointmentDescription({ course, tutor, comments });

                    const result = await calendarService.createCalendarEvent({
                        calendarId,
                        startTime,
                        endTime,
                        summary,
                        description,
                        colorId: course.color,
                    });

                    resolve(result);
                });
            },
            getAppointmentSummary({ course, tutor }) {
                const user = this;
                return `${tutor.name} (${user.firstName}) ${course.code}`;
            },
            getAppointmentDescription({ course, tutor, comments }) {
                moment.tz.setDefault(TIMEZONE);
                const user = this;
                return [`Student: ${user.firstName} ${user.lastName}`,
                    `Course: ${course.code}: ${course.name}`,
                    `Created on: ${moment().format(TIMESTAMP_VISIBLE_FORMAT)}`,
                    `Created by: ${process.env.HOSTNAME}`,
                    comments ? `Comments: ${comments}` : ''].join('\n');
            },
            deleteGoogleCalendarAppointment() {
                const user = this;
                return new Promise(async (resolve, reject) => {
                    const calendarService = new CalendarService;
                    try {
                        await calendarService.create();
                        const result = await calendarService.deleteCalendarEvent({
                            calendarId: user.dataValues.googleCalendarId,
                            eventId: user.dataValues.googleCalendarAppointmentId,
                        });

                        resolve(result);
                    } catch (err) {
                        reject(err);
                    }
                });
            },
            sendAppointmentReminder({ time, location, course, tutor }) {
                const user = this;
                moment.tz.setDefault(TIMEZONE);
                const formattedTime = time.format(TIMESTAMP_VISIBLE_FORMAT);
                const emailBody = `We'll see you at ${location.name} for your ${course.code} appointment with ${tutor.name} on ${formattedTime}`;

                const mailOptions = {
                    subject: `Appointment reminder: ${location.name} on ${formattedTime}`,
                    ...user.composeEmail(emailBody),
                };

                return user.sendEmail(mailOptions);
            },
            sendAppoinmentRemovalConfirmation({ appointmentTime }) {
                const user = this;
                moment.tz.setDefault(TIMEZONE);
                const formattedTime = appointmentTime.format(TIMESTAMP_VISIBLE_FORMAT);
                const emailBody = `We've successfully cancelled your appointment on ${formattedTime}. Feel free to reschedule anytime!`;

                const mailOptions = {
                    subject: 'Your appointment was successfully cancelled',
                    ...user.composeEmail(emailBody),
                };

                return user.sendEmail(mailOptions);
            },
            composeEmail(body) {
                function htmlify(sentence) {
                    const handleNewlines = s => s.replace(/\n/, '<br />');
                    const handleLinks = s => {
                        const linkRegex = new RegExp(`.*?(${process.env.HOSTNAME}.*?)\\s`, 'gi');
                        return s.replace(linkRegex, '<a href="$1">$1</a> ');
                    };

                    const handlers = [handleNewlines, handleLinks];
                    return handlers.reduce((result, handler) => handler(result), sentence);
                }

                const user = this;
                const openers = ['Hello', 'Hi', 'Greetings', 'Salut'];
                const greeting = `${pickOneFrom(openers)} ${user.dataValues.firstName || user.dataValues.email.split('@')[0]},`;

                const closers = ['Bye', 'Best', 'Thanks', 'Cheers'];
                const valediction = `${pickOneFrom(closers)},\n${process.env.HOSTNAME}`;

                const message = [greeting, body, valediction];

                return {
                    text: message.join('\n\n'),
                    html: message.map(sentence => `<p>${htmlify(sentence)}</p>`).join(''),
                };
            },
        },
    });
    return user;
}

