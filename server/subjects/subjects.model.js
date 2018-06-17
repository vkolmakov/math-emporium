import * as locationModel from "../locations/locations.model";

export const pluckPublicFields = ({ id, name, location }) => ({
    id,
    name,
    location: { id: location.id },
});

export const isActive = ({ location }) => locationModel.isActive(location);

export default function createSubjectModel(sequelize, DataTypes) {
    const subject = sequelize.define(
        "subject",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
            },
        },
        {
            timestamps: true,
            classMethods: {
                associate(models) {
                    subject.belongsTo(models.location);
                },
            },
        }
    );
    return subject;
}
