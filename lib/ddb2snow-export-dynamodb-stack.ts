import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import { Rule, Schedule} from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import { generateLambdaBuildOptions } from './helpers';
import { Effect, ServicePrincipal, ManagedPolicy, Role, PolicyStatement } from '@aws-cdk/aws-iam';

export type DumpStackOptions = {
  tableArn: string;
  bucketName: string;
  bucketPrefix: string;
}
const MANAGED_POLICY_LAMBDA_BASIC = 'service-role/AWSLambdaBasicExecutionRole';

export class ExportDynamoDBStack extends cdk.Stack {
  snsTopicArn: string;
  constructor(scope: cdk.Construct, id: string, dumpStackOptions: DumpStackOptions, props?: cdk.StackProps) {
    super(scope, id, props);
    // deconstruct input parameters
    const {bucketName: BUCKET_NAME, tableArn: TABLE_ARN, bucketPrefix: BUCKET_PREFIX} = dumpStackOptions;

    // create lambda role that allows export
    const role = new Role(this,'export-lambda-role', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [ ManagedPolicy.fromAwsManagedPolicyName( MANAGED_POLICY_LAMBDA_BASIC )]
    });
    role.addToPolicy( new PolicyStatement({
      actions: [ 'dynamodb:ExportTableToPointInTime' ],
      effect: Effect.ALLOW,
      resources: [ TABLE_ARN ]
    }));
    role.addToPolicy( new PolicyStatement({
      actions: ['s3:PutObject*'],
      effect: Effect.ALLOW,
      resources: [ `arn:aws:s3:::${BUCKET_NAME}/${BUCKET_PREFIX}/*`]
    }))

    // create a lambda to export dynamodb to S3
    const runtime = lambda.Runtime.NODEJS_12_X;
    const dumpFunction = new lambda.Function(this,'dump-function', {
      runtime,
      code: lambda.Code.fromAsset('dist'),
      handler: 'scheduled-export.handler',      
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        BUCKET_NAME,
        TABLE_ARN,
        BUCKET_PREFIX
      },
      role
    });

    // set a rule to trigger the lambda once a day
    const ruleName = 'dump-dynamodb-rule';
    const cloudwatchRule = new Rule(this,ruleName, {
      description: 'Triggers the lambda to request dynamodb to dump itself to S3',
      ruleName,
      schedule: Schedule.cron({
        day: "*",
        year: "*",
        month:"*",
        hour: "1",
        minute: "0"        
      })
    });

    cloudwatchRule.addTarget( new LambdaFunction(dumpFunction) );
  }
}
