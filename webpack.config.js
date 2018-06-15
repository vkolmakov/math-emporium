const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: "development",
    target: "web",
    devtool: "source-map",

    entry: [
        "webpack-hot-middleware/client?reload=true",
        path.resolve("client", "index.js"),
    ],

    output: {
        path: path.resolve("dist"),
        publicPath: "/",
        filename: "bundle.js",
    },

    resolve: {
        alias: {
            ["@client"]: path.resolve("client"),
        },
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve("client", "index.template.html"),
        }),
        new webpack.HotModuleReplacementPlugin(),
    ],

    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /node_modules/,
                options: {
                    presets: ["react", "es2015"],
                    plugins: ["syntax-dynamic-import"],
                },
            },
            {
                test: /\.s?[ac]ss$/,
                use: [
                    "style-loader",
                    "css-loader",
                    "postcss-loader",
                    "sass-loader",
                ],
            },
            {
                test: /\.(png|jpg|gif|svg|ico)$/,
                loader: "file-loader",
                query: {
                    name: "[name].[ext]",
                },
            },
        ],
    },
};
