const path = require('path');


const COMPILE = (process.env.NODE_ENV === 'compile');

let config = {
    devtool: 'inline-source-map',
    context:path.join(__dirname),
    entry: {
        index: path.join(__dirname, 'test')
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js'
    },
    resolve:{
        modules:[path.resolve(__dirname),path.resolve(__dirname,'node_modules')]
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