import bcrypt from 'bcrypt-nodejs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import moment from 'moment';
import { CalendarService } from '../services/googleApis';

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
        firstName: {
            type: DataTypes.STRING,
        },
        lastName: {
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
        },
        instanceMethods: {
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
            sendActivationEmail() {
                return new Promise((resolve, reject) => {
                    const HOSTNAME = process.env.HOSTNAME || 'http://localhost:3000';

                    const user = this;
                    const token = user.getDataValue('activationToken');

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
                        subject: `Hello from ${HOSTNAME}`,
                        text: `To activate your account at ${HOSTNAME} copy and paste this link into your browser ${HOSTNAME}/activate/${token}`,
                        html: `<p>To activate your account at ${HOSTNAME} click <a href="${HOSTNAME}/activate/${token}">here</a></p>`,
                    };
                    transporter.sendMail(mailOptions, (err, info) => {
                        if (err) {
                            reject(err);
                        }
                        resolve(info);
                    });
                });
            },
            createGoogleCalendarAppointment({ time, course, location, tutor }) {
                const user = this;

                return new Promise(async (resolve, reject) => {
                    const calendarService = new CalendarService;
                    await calendarService.create();

                    const calendarId = location.calendarId;
                    const startTime = time.toISOString();
                    const endTime = moment(time).add(1, 'hours');
                    const summary = user.getAppointmentSummary({ course, tutor });
                    const description = user.getAppointmentDescription({ course, tutor });

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
            getAppointmentDescription({ course, tutor }) {
                const user = this;
                return [`Student: ${user.firstName} ${user.lastName}`,
                        `Course: ${course.code}: ${course.name}`,
                        `Created on: ${moment().format('MM/DD/YYYY h:mm a')}`,
                        `Created by: ${process.env.HOSTNAME}`].join('\n');
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
        },
    });
    return user;
}
