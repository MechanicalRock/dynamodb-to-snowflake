import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';

import { BucketEncryption, BlockPublicAccess } from '@aws-cdk/aws-s3';
import { sanitizeBucketPrefix } from './helpers';
import { RemovalPolicy } from '@aws-cdk/core';

export type S3StackProps = {
  snowflakeAccountId: string;
  snowflakeExternalId: string;
  bucketPrefix: string;
  bucketName: string;
};
export class S3Stack extends cdk.Stack {
  bucket: s3.Bucket;

  constructor(scope: cdk.Construct, id: string, baseStackProps: S3StackProps, props?: cdk.StackProps) {
    super(scope, id, props);
  
    // 1. data bucket
    const bucketName = baseStackProps.bucketName;
    const bucket = new s3.Bucket(this, bucketName, {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      bucketName: bucketName,
      versioned: false,
      removalPolicy: RemovalPolicy.DESTROY
    });
    

    const bucketPrefix = sanitizeBucketPrefix(baseStackProps.bucketPrefix);
    
    // add a lifecycle rule to delete old exports
    bucket.addLifecycleRule( {
      enabled: true,
      expiration: cdk.Duration.days(3),
      prefix: bucketPrefix,
      id: 'delete-objects-after-3-days'
    });

    // 2. snowflake reader role
    let snowflakeRole: iam.Role|undefined = undefined;
    if ( baseStackProps.snowflakeAccountId.trim().length > 0 &&
          baseStackProps.snowflakeExternalId.trim().length > 0) {

        snowflakeRole = new iam.Role(this, 'snowflake-reader-role', {
          roleName: 'dynamo-snowflake-s3-access-role',
          assumedBy: new iam.AccountPrincipal(baseStackProps.snowflakeAccountId),
          externalIds: [
            baseStackProps.snowflakeExternalId
          ]
        });
        snowflakeRole.addToPolicy( new iam.PolicyStatement( {
          effect: iam.Effect.ALLOW,
          resources: [ `${bucket.bucketArn}/${bucketPrefix}*`],
          actions: [
            "s3:GetObject",
            "s3:GetObjectVersion",
            "s3:ListObjects"
          ]          
        }));
        
        bucket.addToResourcePolicy( new iam.PolicyStatement( {
          effect: iam.Effect.ALLOW,
          principals: [
            new iam.AnyPrincipal()
          ],
          resources: [
            `arn:aws:s3:::${bucketName}`,
            `arn:aws:s3:::${bucketName}/${bucketPrefix}*`
          ],          
          actions: [
            "s3:GetObject*",
            "s3:List*"
          ],
          conditions: {
            "Bool": {
              "aws:SecureTransport": "true"
            },
            "StringLike": {
              "aws:userid": `${snowflakeRole.roleId}:*`
            }
          }
        }))
    }
    
    this.bucket = bucket;
  }
}
