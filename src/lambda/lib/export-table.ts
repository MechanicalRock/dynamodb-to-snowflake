
import { DynamoDB } from 'aws-sdk';
export type ExportTableResult = {
    succeeded: boolean;
    retryable: boolean;
    description?: string;
    error?: string;
};
export interface ExportTable {
    requestExportDynamoDbToS3(params: DynamoDB.ExportTableToPointInTimeInput): Promise<ExportTableResult>;
};