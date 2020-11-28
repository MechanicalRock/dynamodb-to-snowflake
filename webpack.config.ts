import * as path from 'path';
import { Configuration } from 'webpack';

const config: Configuration = {
    target: 'node',
    mode: 'production',
    optimization: {
        minimize: false,
        sideEffects: false,
    },
    module: {
        rules: [
            {
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: /node_modules/,
            options: {
                transpileOnly: true,
            },
            },
        ],
    },    
    context: path.resolve(__dirname),
    entry: {
        'scheduled-export': './src/lambda/scheduled-export'
    },
    resolve: {
        extensions: ['.ts','.js']
    },
    // externals: ['aws-sdk', 'aws-lambda'], // provided by the AWS Lambda runtime, no need to bundle
    output: {
        libraryTarget: 'commonjs',
        filename: '[name].js',
        path: path.resolve(__dirname,'dist'),
    }
};

export default config;