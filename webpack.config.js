const path = require('path');


const COMPILE = (process.env.NODE_ENV === 'compile');

let config = {
    devtool: 'inline-source-map',
    entry: {
        index: path.join(__dirname, 'src/index')
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js'
    },
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            use: [{
                loader: 'babel-loader',
                query: {
                    presets: ['es2015'],
                    compact: true
                }
            }]
        }]
    }

}


module.exports = config;