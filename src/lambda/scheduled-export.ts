import { ScheduledEvent } from 'aws-lambda';
import { RetryableExportInput, tryExportDynamoDBToS3 } from './lib/retryable-export-process';

type Event = Pick<ScheduledEvent, 'time'>
export const handler = async (event: Event): Promise<void> => {

    const retriableExportParams: RetryableExportInput = {
        S3Bucket: process.env.BUCKET_NAME,
        S3Prefix: process.env.BUCKET_PREFIX,
        TableArn: process.env.TABLE_ARN,
        originalTime: event && event.time ? event.time : new Date().toISOString(),
    };
    await tryExportDynamoDBToS3(retriableExportParams);
};