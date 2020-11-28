import { AWSError, DynamoDB } from 'aws-sdk';
import { ExportDescription, ExportTableToPointInTimeInput, ExportTableToPointInTimeOutput } from 'aws-sdk/clients/dynamodb';
import { PromiseResult } from 'aws-sdk/lib/request';
import { requestExportDynamoDbToS3 } from './export-table-dynamodb';

describe('export failure generates appropriate responses',  () => {
    it('should not be retriable when a 4XX error is returned', async () => {
         const result = await requestExportDynamoDbToS3(params, mockDynamoDb( withResponse400() ));
         expect(result.succeeded).toBe(false);
         expect(result.retryable).toBe(false);
    });

    it('should be retriable when a 5XX error occurs', async () => {
        const result = await requestExportDynamoDbToS3(params, mockDynamoDb( withResponse500() ));
        expect(result.succeeded).toBe(false);
        expect(result.retryable).toBe(true);
    });

    it('should return the description if it is set', async () => {
        const result = await requestExportDynamoDbToS3(params, mockDynamoDb( withResponse200( { ItemCount: 5}) ));
        expect(result.succeeded).toBe(true);
        expect(result.retryable).toBe(false);
        expect(result.description).toBeDefined();
    });

    it('will have undefined description if nothing returned from dynamodb client', async () => {
        const result = await requestExportDynamoDbToS3(params, mockDynamoDb( withResponse200( ) ));
        expect(result.succeeded).toBe(true);
        expect(result.retryable).toBe(false);
        expect(result.description).toBeUndefined();
    });

    it('should be retriable if an unknown exception was thrown', async() => {
        const result = await requestExportDynamoDbToS3(params, mockDynamoDb( withResponse200( ), 'Simulated Failure'));
        expect(result.succeeded).toBe(false);
        expect(result.retryable).toBe(true);
        expect(result.description).toBe('Simulated Failure')
    });
});

const params: ExportTableToPointInTimeInput = {
    TableArn: 'arny:arn:arn',
    S3Bucket: 's3bucket',
    S3Prefix: 'path/to/exports',
    ClientToken: 'clientToken'
};

const mockDynamoDb = (response?: ExportTableToPointInTimeOutput, throwErrorMessage?: string): DynamoDB => {
    const mock = jest.fn();
    const exportTableToPointInTime = mock.mockImplementation( () => {
        return {
            promise: () => {
                if ( throwErrorMessage !== undefined) {
                    throw new Error(throwErrorMessage);
                }
                return response? response: {} as ExportTableToPointInTimeOutput;
            }
        };
    });

    return {
        exportTableToPointInTime
    } as unknown as DynamoDB;
}
const withResponse = (statusCode: number): PromiseResult<ExportTableToPointInTimeOutput, AWSError> => {
    return {
        $response: {
            httpResponse: {
                statusCode
            }
        }
    } as PromiseResult<ExportTableToPointInTimeOutput, AWSError>;
}
const withResponse400 = () => withResponse(400);
const withResponse500 = () => withResponse(500);
const withResponse200 = (ExportDescription?: ExportDescription) => {
    return {
        ...withResponse(200), ExportDescription
    };
}
