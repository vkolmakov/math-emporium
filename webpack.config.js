const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    devtool: 'source-map',
    entry: [
        'webpack-hot-middleware/client?reload=true',
        path.resolve(__dirname, 'client/index.js'),
    ],
    output: {
        path: path.resolve(__dirname, 'dist/'),
        publicPath: '/',
        filename: 'bundle.js',
    },
    module: {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            options: {
                presets: ['react', 'es2015'],
            },

        }, {
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract({
                loader: ['css-loader', 'sass-loader'],
            }),
        }, {
            test: /\.css$/,
            loader: ExtractTextPlugin.extract({
                loader: 'css-loader',
            }),
        }, {
            test: /\.(png|jpg|gif|svg|ico)$/,
            loader: 'file-loader',
            query: {
                name: '[name].[ext]',
            },
        }],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'client/index.template.html',
        }),
        new ExtractTextPlugin({
            filename: 'public/style.css',
            allChunks: true,
        }),

        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
    ],
};
