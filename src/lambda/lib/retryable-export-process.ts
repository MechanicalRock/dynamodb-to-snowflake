import { DynamoDB } from 'aws-sdk';
import { ExportTable } from './export-table';
import { exporter } from './export-table-dynamodb';

export type RetryableExportInput = {
    originalTime: string;
    S3Bucket?: string;
    S3Prefix?: string;
    TableArn?: string;
};

export const tryExportDynamoDBToS3 = async (unvalidatedParams: RetryableExportInput, tableExporter: ExportTable = exporter) => {
    const ClientToken = unvalidatedParams.originalTime.slice(0,10);
    const BUCKET_NAME = unvalidatedParams.S3Bucket || "";
    const TABLE_ARN = unvalidatedParams.TableArn || "";
    const BUCKET_PREFIX = unvalidatedParams.S3Prefix;
    if ( BUCKET_NAME.length === 0) {
        throw new Error('Bucket name must be set');
    } else if ( TABLE_ARN.length === 0 ) {
        throw new Error('DynamoDB Table Arn must be set');
    }

    const params: DynamoDB.ExportTableToPointInTimeInput = {
        ClientToken,
        S3Bucket: BUCKET_NAME,
        S3Prefix: BUCKET_PREFIX,
        TableArn: TABLE_ARN,
        S3SseAlgorithm: "AES256",
        ExportFormat: "DYNAMODB_JSON"        
    };

    let tries = 3;
    while (tries > 0) {
        tries--;
        try {
            const result = await tableExporter.requestExportDynamoDbToS3(params);
            if ( result.succeeded ) {
                break;
            } else if ( ! result.retryable ) {
                tries = 0;
            }
            
        } catch (e) {
            console.log(`Failed trying to export dynamodb table ${TABLE_ARN} to S3. ${tries} tries remaining`);
            console.log(e);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
};