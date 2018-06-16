import phoneNumber from "../services/phoneNumber";
import { authGroups, Either } from "../aux";

export default function createUserModel(sequelize, DataTypes) {
    const user = sequelize.define(
        "user",
        {
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: {
                    msg: "Email address must be unique!",
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
                        () => {
                            throw new Error("Invalid phone number");
                        },
                        (p) => p,
                        phoneNumber.parse(value),
                    );

                    this.setDataValue("phoneNumber", parsedPhoneNumberOrNull);
                },
            },
            group: {
                type: DataTypes.INTEGER,
                defaultValue: authGroups.USER,
            },
            lastSigninAt: {
                type: DataTypes.DATE,
            },
        },
        {
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
                hasDefaultAppointmentPreferences() {
                    return !!this.getDataValue("locationId");
                },

                setDefaultAppointmentPreferences(
                    locationRes,
                    subjectRes,
                    courseRes,
                ) {
                    const user = this;

                    return user.update(
                        {
                            locationId: locationRes.id,
                            subjectId: subjectRes.id,
                            courseId: courseRes.id,
                        },
                        {
                            fields: ["locationId", "subjectId", "courseId"],
                        },
                    );
                },

                setDefaultAppointmentPreferencesIfNoneSet(
                    location,
                    subject,
                    course,
                ) {
                    let result = Promise.resolve();
                    if (!this.hasDefaultAppointmentPreferences()) {
                        result = this.setDefaultAppointmentPreferences(
                            location,
                            subject,
                            course,
                        );
                    }
                    return result;
                },
            },
        },
    );
    return user;
}
