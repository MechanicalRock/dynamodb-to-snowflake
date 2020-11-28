import { Runtime } from '@aws-cdk/aws-lambda';
import { BundlingOptions } from '@aws-cdk/core';


export const generateLambdaBuildOptions = (runtime: Runtime):BundlingOptions => {
    return {
        image: runtime.bundlingDockerImage,
        command: [
        'bash', '-c', [
            'cd /asset-input',
            'npm ci',
            'cp -r *.js node_modules/ /asset-output',
        ].join(' && ')
        ],
        user: 'root'
    };
};

export const sanitizeBucketPrefix = (bucketPrefix?: string): string => {
    if ( bucketPrefix === undefined || bucketPrefix.trim().length === 0 ) {
        return '';
    };

    let prefix = bucketPrefix.replace(/^(?:\/*)(.*?)(?:\/*)$/g,'$1');
    if ( prefix.length > 0 ) {
        // add final trailing slash for non empty prefixes
        prefix += '/';
    }
    return prefix;
}