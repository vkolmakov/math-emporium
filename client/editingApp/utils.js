export function selectTransformOptions(
    valueKey = "id",
    labelKey = "name",
    colorKey = null,
) {
    return (options) => {
        return options.map((option) =>
            Object.keys(option).reduce((result, key) => {
                if (key === valueKey) {
                    result.value = option[key];
                } else if (key === labelKey) {
                    result.label = option[key];
                } else if (colorKey && key === colorKey) {
                    result.color = option[key];
                }
                return result;
            }, {}),
        );
    };
}
