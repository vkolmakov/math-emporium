const aux = {};

aux.isObject = (obj) => obj === Object(obj);

aux.hasOneOf = (obj, ...keys) => {
    return !!obj ? [...keys].some((key) => Object.keys(obj).indexOf(key) > -1) : false;
};

aux.createExtractDataValuesFunction = (allowedFields) => {
    // returns a function that takes in a result from sequelize query
    // and filters them using predefined array of allowedFields
    return (sequelizeRes) => {
        let data = sequelizeRes;
        // Grab only the allowed fields
        return allowedFields.reduce((result, fieldName) => {
            result[fieldName] = data.get(fieldName);
            return result;
        }, {});
    };
};

module.exports = aux;
