import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
//import svginlineloader from "svg-inline-loader";
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

export default {
    entry: path.join(__dirname, 'src/index.js'),
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[hash].js'
    },
    module: {
        rules: [
            {
                test: /\.js/,
                exclude: /(node_modules|bower_components)/,
                use: [{
                    loader: 'babel-loader'
                }]
            },
          ]
    },
    plugins: [
        new CopyPlugin([
          ])
    ],
};