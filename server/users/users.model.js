import moment from 'moment';
import { calendarService } from '../services/googleApis';
import { TIMEZONE, AUTH_GROUPS,
         TIMESTAMP_VISIBLE_FORMAT, APPOINTMENT_LENGTH } from '../aux';
import * as email from '../services/email';


export default function createUserModel(sequelize, DataTypes) {
    const user = sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                msg: 'Email address must be unique!',
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
            defaultValue: AUTH_GROUPS.user,
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
        },
        instanceMethods: {
            sendEmail({ subjectConstructor, emailBodyConstructor }) {
                const user = this;
                const emailAddress = user.getDataValue('email');
                const firstName = user.getDataValue('firstName');
                const client = email.createClient();
                return email.send(client,
                                  { email: emailAddress, firstName },
                                  { subjectConstructor, emailBodyConstructor });
            },

            createGoogleCalendarAppointment({ time, course, location, tutor, comments }) {
                const user = this;
                moment.tz.setDefault(TIMEZONE);
                return new Promise(async (resolve, reject) => {
                    const calendar = await calendarService();

                    const calendarId = location.calendarId;
                    const startTime = time.toISOString();
                    const endTime = moment(time).add(APPOINTMENT_LENGTH, 'minutes').toISOString();
                    const summary = user.getAppointmentSummary({ course, tutor });
                    const description = user.getAppointmentDescription({ course, tutor, comments });

                    const result = await calendar.createCalendarEvent({
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
                    const calendar = await calendarService();
                    try {
                        const result = await calendar.deleteCalendarEvent({
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

