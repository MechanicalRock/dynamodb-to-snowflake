#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { S3StackProps, S3Stack } from '../lib/ddb2snow-s3-stack';
import { ExportDynamoDBStack } from '../lib/ddb2snow-export-dynamodb-stack';
import { CreateDynamoDbStack } from '../lib/ddb2snow-create-dynamodb-stack';

const app = new cdk.App();

const mySandbox: cdk.Environment = {
    region: process.env.AWS_DEFAULT_REGION || "",
    account: process.env.AWS_ACCOUNT_ID || ""
}

const baseStackProps: S3StackProps = {
    snowflakeAccountId: process.env.SNOWFLAKE_ACCOUNT_ID || "",
    snowflakeExternalId: process.env.SNOWFLAKE_EXTERNAL_ID || "",
    bucketPrefix: 'dynamodb/export',
    bucketName: `dynamodb-export-${mySandbox.account}-${mySandbox.region}`
}

const handler = () => {
    const standardStackProps = { env: mySandbox };
    const { bucketPrefix: exportPrefix} = baseStackProps;
    const tableName = process.env.DYNAMODB_TABLE_NAME || "";

    // create stack to make dynamodb table
    const dynamoStack = new CreateDynamoDbStack(app,'ddb2snowflake-DynamoStack', tableName);
    const { table:{tableArn}, table} = dynamoStack;

    // create stack to accomodate dynamodb changes
    const baseStack = new S3Stack(app, 'ddb2snowflake-BaseStack', baseStackProps, standardStackProps);
    const {bucket}= baseStack;

    // create stack to backfill snowflake with existing dynamodb data
    const bucketName = bucket.bucketName;
    new ExportDynamoDBStack(app, 'ddb2snowflake-DumpStack',{
        bucketName,
        tableArn,
        bucketPrefix: exportPrefix
    },standardStackProps);
}

try {
    handler();
} catch (e) {
    console.log(e);
}