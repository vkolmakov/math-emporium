const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
    mode: 'production',
    entry: {
        bundle: './client/index.js',
        vendor: VENDOR_LIBS,
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].[hash].css',
            chunkFilename: '[id].[hash].css',
        }),
    ],

    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'all'
                }
            }
        }
    },

    module: {
        rules: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            options: {
                presets: ['react', 'es2015'],
            },
        }, {
            test: /\.s?[ac]ss$/,
            use: [
                MiniCssExtractPlugin.loader,
                'css-loader',
                'postcss-loader',
                'sass-loader',
            ],
        }, {
            test: /\.(png|jpg|gif|svg|ico)$/,
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
            },
        }],
    },
};
