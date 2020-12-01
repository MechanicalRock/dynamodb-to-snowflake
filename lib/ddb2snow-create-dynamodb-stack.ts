import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as s3 from '@aws-cdk/aws-s3';
import { BillingMode, TableEncryption, AttributeType, Table } from '@aws-cdk/aws-dynamodb';
import { RemovalPolicy } from '@aws-cdk/core';

export class CreateDynamoDbStack extends cdk.Stack {
  table: Table;
  bucket: s3.Bucket;

  constructor(scope: cdk.Construct, id: string, tableName: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. dynamodb table and stream    
    const table = new dynamodb.Table(this, tableName , {
      billingMode: BillingMode.PAY_PER_REQUEST,
      encryption: TableEncryption.AWS_MANAGED,
      tableName,
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING        
      },
      sortKey: {
        name: 'event_date',
        type: AttributeType.STRING
      },
      pointInTimeRecovery: true,
      removalPolicy: RemovalPolicy.DESTROY
    });

    // index primary key lookup on event date
    table.addGlobalSecondaryIndex({
      indexName: 'reverse',
      partitionKey: {
        name: 'event_date',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'pk',
        type: AttributeType.STRING
      }
    });

    // index primary key lookup on data type
    table.addGlobalSecondaryIndex({
      indexName: 'data_type',
      partitionKey: {
        name: 'data_type',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'event_date',
        type: AttributeType.STRING
      }
    });
  

    this.table = table;
  }
}
