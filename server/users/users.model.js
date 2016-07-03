import bcrypt from 'bcrypt-nodejs';

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
        name: {
            type: DataTypes.STRING,
        },
        group: {
            type: DataTypes.INTEGER,
            defaultValue: 0, // TODO ADD IN CONFIG
        },
        // TODO: add course field for students - one-to-one
    }, {
        timestamps: true,
        instanceMethods: {
            validatePassword(password, callback) {
                bcrypt.compare(password, this.getDataValue('password'), (err, isMatch) => {
                    if (err) {
                        return callback(err);
                    }
                    return callback(null, isMatch);
                });
            },
        },
    });
    return user;
}
