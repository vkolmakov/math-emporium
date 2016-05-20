const aux = {};

aux.extractDataValues = (allowedFields) => {
    // returns a function that takes in a result from sequelize query
    // and filters them using predefined array of allowedFields
    return (sequelizeRes) => {
        let data = sequelizeRes.dataValues;
        // Grab only the allowed fields
        return allowedFields.reduce((result, fieldName) => {
            result[fieldName] = data[fieldName];
            return result;
        }, {});
    };
};

aux.isObject = (obj) => obj === Object(obj);

aux.hasOneOf = (obj, ...keys) => [...keys].some((key) => Object.keys(obj).indexOf(key) > -1);

module.exports = aux;
