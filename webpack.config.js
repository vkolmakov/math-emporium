'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    devtool: 'eval-source-map',
    entry: [
        'webpack-hot-middleware/client?reload=true',
        path.join(__dirname, 'client/index.js'),
    ],
    output: {
        path: path.join(__dirname, '/dist/'),
        publicPath: '/',
        filename: 'bundle.js',
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel',
            query: {
                presets: ['react', 'es2015'],
            },
        }, {
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract('!css!sass'),
        }],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'client/index.template.html',
            inject: 'body',
            filename: 'index.html',
        }),
        new ExtractTextPlugin('public/style.css', {
            allChunks: true,
        }),

        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
    ],
};
