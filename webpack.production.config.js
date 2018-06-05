const path = require('path');

const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

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
    'react-router-dom',
    'react-select',
    'redux-form',
    'redux-promise',
    'redux-thunk',
];

module.exports = {
    mode: 'production',
    target: 'web',

    entry: {
        bundle: path.resolve('client', 'index.js'),
        vendor: VENDOR_LIBS,
    },

    output: {
        path: path.resolve('dist'),
        filename: '[name].[chunkhash].min.js',
        publicPath: '/',
    },

    resolve: {
        alias: {
            ['@client']: path.resolve('client'),
        },
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production'),
            },
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[hash].css',
            chunkFilename: '[id].[hash].css',
        }),
        new HtmlWebpackPlugin({
            template: path.resolve('client', 'index.template.html'),
            inject: 'body',
        }),
        new CompressionPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: /\.(js|css)$/,
            minRatio: 0.8,
            deleteOriginalAssets: true,
        }),
        new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /^\.\/(en-gb)$/),
    ],

    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    compress: { warnings: false },
                    output: { comments: false },
                },
            }),
        ],

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
                { loader: 'css-loader', options: { minimize: true }},
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
