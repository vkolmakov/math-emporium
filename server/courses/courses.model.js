import * as locationModel from "../locations/locations.model";

export const pluckPublicFields = ({ id, name, code, location, subject }) => ({
    id,
    name,
    code,
    location: { id: location.id },
    subject: { id: subject.id },
});

export const isActive = ({ location }) => locationModel.isActive(location);

export default function createCourseModel(sequelize, DataTypes) {
    const course = sequelize.define(
        "course",
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            code: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: {
                    // TODO: make a custom validator ensure uniqueness only by location
                    msg: "Course code must be unique!",
                },
            },
            color: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            timestamps: true,
            classMethods: {
                associate(models) {
                    course.belongsToMany(models.tutor, {
                        through: "tutor_course",
                        as: "tutors",
                    });
                    course.belongsTo(models.location);
                    course.belongsTo(models.subject);
                },
            },
        },
    );
    return course;
}
