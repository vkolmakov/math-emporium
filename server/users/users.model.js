import bcrypt from 'bcrypt-nodejs';
import crypto from 'crypto';
import moment from 'moment';
import { CalendarService } from '../services/googleApis';
import { TIMEZONE, AUTH_GROUPS, TIMESTAMP_VISIBLE_FORMAT, USER_EMAIL_REGEX } from '../aux';
import * as email from '../services/email';

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
        lastSigninAt: {
            type: DataTypes.DATE,
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
                    email.match(USER_EMAIL_REGEX),
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

            sendEmail({ subjectConstructor, emailBodyConstructor }) {
                const user = this;
                const emailAddress = user.getDataValue('email');
                const firstName = user.getDataValue('firstName');
                const client = email.createClient();
                return email.send(client,
                                  { email: emailAddress, firstName },
                                  { subjectConstructor, emailBodyConstructor });
            },

            sendActivationEmail() {
                const user = this;
                const token = user.getDataValue('activationToken');

                const emailBodyConstructor = (_, host) =>
                      `To activate your account click on this link:\n${host}/activate/${token}\n`;
                const subjectConstructor = orgName => `Hello from ${orgName}`;

                return user.sendEmail({ subjectConstructor, emailBodyConstructor });
            },

            sendResetPasswordEmail() {
                const user = this;
                const token = user.getDataValue('resetPasswordToken');

                const emailBodyConstructor = (_, host) =>
                      `To reset your password follow this link:\n${host}/reset-password/${token}\n`;
                const subjectConstructor = orgName => `Reset your password at ${orgName}`;

                return user.sendEmail({ subjectConstructor, emailBodyConstructor });
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
                    'Created online',
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
                const emailBodyConstructor = () =>
                      `Your appointment for ${course.code} with ${tutor.name} on ${formattedTime} in the ${location.name} has been scheduled.`;
                const subjectConstructor = () => `Appointment reminder: ${location.name} on ${formattedTime}`;
                return user.sendEmail({ subjectConstructor, emailBodyConstructor });
            },

            sendAppoinmentRemovalConfirmation({ appointmentTime }) {
                const user = this;
                moment.tz.setDefault(TIMEZONE);
                const formattedTime = appointmentTime.format(TIMESTAMP_VISIBLE_FORMAT);
                const emailBodyConstructor = () =>
                      `We've successfully cancelled your appointment on ${formattedTime}. Feel free to reschedule anytime!`;
                const subjectConstructor = () => 'Your appointment was successfully cancelled';

                return user.sendEmail({ subjectConstructor, emailBodyConstructor });
            },
        },
    });
    return user;
}

