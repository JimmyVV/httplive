const path = require('path');
const webpack = require('webpack');
const Uglifyjs = require('uglifyjs-webpack-plugin');


let config = {
    devtool: 'hidden-source-map',
    context: path.join(__dirname),
    entry: {
        index: path.join(__dirname, 'src/index'),
        "index-worker": path.join(__dirname, 'src/webpack-worker/index'),
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].min.js',
        libraryTarget:"umd",
        library:"httplive",
    },
    resolve: {
        modules: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'node_modules')]
    },
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            use: [{
                loader: 'babel-loader',
                query: {
                    presets: ['es2015'],
                    retainLines: true
                }
            }]
        }]
    },
    plugins: [
        new Uglifyjs({
            uglifyOptions: {
                compress: {
                    pure_funcs: ['console.log']
                },
                warnings: false
            }

        }),
    ]
}




module.exports = config;