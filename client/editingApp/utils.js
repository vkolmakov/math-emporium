export function selectTransformOptions(valueKey = 'id', labelKey = 'name') {
    return (options) => {
        return options.map(
            option => Object.keys(option).reduce((result, key) => {
                if (key === valueKey) {
                    result.value = option[key];
                } else if (key === labelKey) {
                    result.label = option[key];
                }
                return result;
            }, {})
        );
    };
}
