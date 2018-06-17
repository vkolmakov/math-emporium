export const pluckPublicFields = ({
    courseId,
    subjectId,
    locationId,
    googleCalendarAppointmentDate,
    id,
}) => ({
    id,
    time: googleCalendarAppointmentDate,
    location: { id: locationId },
    subject: { id: subjectId },
    course: { id: courseId },
});

export default function createScheduledAppointmentModel(sequelize, DataTypes) {
    const scheduledAppointment = sequelize.define(
        "scheduledAppointment",
        {
            googleCalendarAppointmentId: {
                type: DataTypes.STRING,
            },
            googleCalendarAppointmentDate: {
                type: DataTypes.DATE,
            },
            googleCalendarId: {
                type: DataTypes.STRING,
            },
        },
        {
            timestamps: true,
            classMethods: {
                associate(models) {
                    scheduledAppointment.belongsTo(models.user);
                    scheduledAppointment.belongsTo(models.subject);
                    scheduledAppointment.belongsTo(models.course);
                    scheduledAppointment.belongsTo(models.location);
                },
            },
        }
    );

    return scheduledAppointment;
}
