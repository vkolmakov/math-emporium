export const pluckPublicFields = ({ id, name }) => ({
    id,
    name,
});

export default function createSubjectModel(sequelize, DataTypes) {
    const subject = sequelize.define('subject', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
        },
    }, {
        timestamps: true,
        classMethods: {
            associate(models) {
                subject.belongsTo(models.location);
            },
        },

    });
    return subject;
}
