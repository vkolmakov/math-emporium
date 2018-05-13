import moment from 'moment';
import { calendarService } from '../services/googleApis';
import phoneNumber from '../services/phoneNumber';
import { TIMEZONE, authGroups, Either,
         TIMESTAMP_VISIBLE_FORMAT, APPOINTMENT_LENGTH } from '../aux';
import sendEmail from '../services/email';
import cache from '../services/cache';

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
        phoneNumber: {
            type: DataTypes.STRING,
            validate: {
                isPhoneNumberOrNull(value) {
                    return phoneNumber.isValid(value);
                },
            },
            set(value) {
                const parsedPhoneNumberOrNull = Either.either(
                    (err) => { throw new Error('Invalid phone number'); },
                    (p) => p,
                    phoneNumber.parse(value)
                );

                this.setDataValue('phoneNumber', parsedPhoneNumberOrNull);
            },

        },
        group: {
            type: DataTypes.INTEGER,
            defaultValue: authGroups.USER,
        },
        lastSigninAt: {
            type: DataTypes.DATE,
        },
    }, {
        timestamps: true,
        classMethods: {
            associate(models) {
                // should say hasOne, but oh well
                user.belongsTo(models.location);
                user.belongsTo(models.subject);
                user.belongsTo(models.course);
            },
        },
        instanceMethods: {
            sendEmail({ subjectConstructor, emailBodyConstructor }) {
                const user = this;
                const emailAddress = user.getDataValue('email');
                const firstName = user.getDataValue('firstName');
                return sendEmail({ email: emailAddress, firstName },
                                 { subjectConstructor, emailBodyConstructor });
            },

            createGoogleCalendarAppointment({ time, course, location, tutorData, comments }) {
                const user = this;
                moment.tz.setDefault(TIMEZONE);
                return new Promise(async (resolve, reject) => {
                    const calendar = await calendarService();

                    const calendarId = location.calendarId;
                    const startTime = time.toISOString();
                    const endTime = moment(time).add(APPOINTMENT_LENGTH, 'minutes').toISOString();
                    const summary = user.getAppointmentSummary({
                        course,
                        tutorData,
                    });
                    const description = user.getAppointmentDescription({
                        course,
                        comments,
                    });

                    const result = await calendar.createCalendarEvent({
                        calendarId,
                        startTime,
                        endTime,
                        summary,
                        description,
                        colorId: course.color,
                    });

                    // invalidate the cache for a given location as soon
                    // as new appointment is registered
                    cache.calendarEvents.invalidate(calendarId);

                    resolve(result);
                });
            },

            getAppointmentSummary({ course, tutorData }) {
                const EXPLICITLY_REQUESTED_TUTOR_SYMBOL = ' ## ';

                const user = this;
                const tutorName = tutorData.tutor.name;
                const wasTutorExplicitlyRequested = tutorData.wasExplicitlyRequested;

                return `${tutorName}${wasTutorExplicitlyRequested ? EXPLICITLY_REQUESTED_TUTOR_SYMBOL : ' '}(${user.firstName}) ${course.code}`;
            },

            getAppointmentDescription({ course, comments }) {
                moment.tz.setDefault(TIMEZONE);
                const user = this;
                return [`Student: ${user.firstName} ${user.lastName}`,
                        `Email: ${user.email}`,
                        `Phone number: ${user.phoneNumber}`,
                        '',
                        `Course: ${course.code}: ${course.name}`,
                        `Created on: ${moment().format(TIMESTAMP_VISIBLE_FORMAT)}`,
                        'Created online',
                        comments ? `Comments: ${comments}` : '',
                       ].join('\n');
            },

            deleteGoogleCalendarAppointment() {
                const user = this;
                return new Promise(async (resolve, reject) => {
                    const calendar = await calendarService();
                    const calendarId = user.dataValues.googleCalendarId;
                    const eventId = user.dataValues.googleCalendarAppointmentId;
                    try {
                        const result = await calendar.deleteCalendarEvent({
                            calendarId,
                            eventId,
                        });

                        // invalidate the cache for a given location as soon
                        // as an appointment is deleted
                        cache.calendarEvents.invalidate(calendarId);

                        resolve(result);
                    } catch (err) {
                        reject(err);
                    }
                });
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

            hasDefaultAppointmentPreferences() {
                return !!this.getDataValue('locationId');
            },

            setDefaultAppointmentPreferences(locationRes, subjectRes, courseRes) {
                const user = this;

                return Promise.all([
                    user.setLocation(locationRes),
                    user.setSubject(subjectRes),
                    user.setCourse(courseRes),
                ]);
            },
        },
    });
    return user;
}

