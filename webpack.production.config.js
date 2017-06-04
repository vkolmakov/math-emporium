const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const VENDOR_LIBS = [
    'axios',
    'moment',
    'react',
    'sanctuary',
    'react-datepicker',
    'react-dom',
    'react-modal',
    'react-redux',
    'react-router',
    'react-select',
    'redux-form',
    'redux-promise',
    'redux-thunk',
];

module.exports = {
    entry: {
        bundle: './client/index.js',
        vendor: VENDOR_LIBS,
    },
    output: {
        path: path.resolve(__dirname, 'dist/'),
        filename: '[name].[chunkhash].min.js',
        publicPath: '/',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'client/index.template.html',
            inject: 'body',
        }),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production'),
            },
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                screw_ie8: true,
            },
            output: {
                comments: false,
            },
        }),
        new ExtractTextPlugin({
            filename: 'style.[chunkhash].css',
            allChunks: true,
        }),
        new webpack.optimize.CommonsChunkPlugin({
            names: ['vendor', 'manifest'],
        }),
        new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /^\.\/(en-gb)$/),
        new CompressionPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: /\.(js|css)$/,
            minRatio: 0,
        }),
    ],
    module: {
        rules: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
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
                loader: ['css-loader'],
            }),
        }, {
            test: /\.(png|jpg|gif|svg|ico)$/,
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
            },
        }],
    },
};
