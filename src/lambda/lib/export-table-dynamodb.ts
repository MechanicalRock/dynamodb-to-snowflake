import { ExportTable, ExportTableResult } from './export-table';
import * as AWSXray from 'aws-xray-sdk-core';
import { DynamoDB } from 'aws-sdk';

export const requestExportDynamoDbToS3 = async (params: DynamoDB.ExportTableToPointInTimeInput, dynamodbClient?: DynamoDB): Promise<ExportTableResult> =>  {
    if ( dynamodbClient === undefined ) {
        dynamodbClient = AWSXray.captureAWSClient( new DynamoDB() );
    }
    let result: ExportTableResult = {
        succeeded: false,
        retryable: false
    };
    
    try {
        const dynamoResult = await dynamodbClient.exportTableToPointInTime(params).promise();
        if ( dynamoResult.$response.httpResponse.statusCode >= 400 ) {
            if ( dynamoResult.$response.httpResponse.statusCode >= 500 ) {
                result.retryable = true;
            }
            if ( dynamoResult.$response.error !== undefined ) {
                result.error = dynamoResult.$response.httpResponse.statusMessage;
            }
            return result;
        } else if ( dynamoResult.$response.httpResponse.statusCode < 300 ) {    
            result.succeeded = true;
            if ( dynamoResult.ExportDescription !== undefined ) {
                result.description = `Export status: ${JSON.stringify(dynamoResult.ExportDescription)}`;
            }
        }
    } catch (e) {
        console.log(e);
        result.description = e.message ? e.message : 'Unknown error';
        result.retryable = true;
    }
    return result;
}

export const exporter: ExportTable = {
    requestExportDynamoDbToS3
}
