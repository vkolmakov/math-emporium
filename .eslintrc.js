module.exports = {
    parser: "babel-eslint",
    extends: ["eslint:recommended", "prettier"],
    plugins: ["prettier", "react"],
    rules: {
        "prettier/prettier": "error",
        "react/jsx-uses-react": "error",
        "react/jsx-uses-vars": "error",
        eqeqeq: "error",
    },
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
            modules: true,
        },
    },
    env: {
        browser: true,
        node: true,
        es6: true,
    },
};
