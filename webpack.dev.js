const path = require('path');
const webpack = require('webpack');
const Uglifyjs = require('uglifyjs-webpack-plugin');


let config = {
    devtool: 'cheap-module-eval-source-map',
    context: path.join(__dirname),
    entry: {
        index: path.join(__dirname, 'test')
    },
    output: {
        path: path.join(__dirname, 'public'),
        filename: '[name].js'
    },
    resolve: {
        modules: [path.resolve(__dirname,'src'), path.resolve(__dirname, 'node_modules')]
    },
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            use: [{
                loader: 'babel-loader',
                query: {
                    presets: ['es2015'],
                    retainLines:true
                }
            }]
        }]
    },
    plugins: []
}



module.exports = config;