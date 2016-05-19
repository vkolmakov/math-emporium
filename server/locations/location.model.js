export default function createLocationModel(sequelize, DataTypes) {
    const location = sequelize.define('location', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                msg: 'Location name must be unique!',
            },
        },
        // TODO: add one-to-many relationships
    }, {
        timestamps: false,
    });
    return location;
}
