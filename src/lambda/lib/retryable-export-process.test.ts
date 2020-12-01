import { ExportTable, ExportTableResult } from './export-table';
import { RetryableExportInput, tryExportDynamoDBToS3 } from './retryable-export-process';
describe('it should try export a number of times and validate export input', () => {
    it('should fail when there is no bucket name', async () => {
        const params: RetryableExportInput = {
            originalTime: new Date().toISOString()
        };
        try {
            await tryExportDynamoDBToS3(params, mockExporter());
            fail();
        } catch (e) {
            expect(e.message).toBe('Bucket name must be set');
        }
    });

    it('should fail when there is no table arn', async () => {
        const params: RetryableExportInput = {
            originalTime: new Date().toISOString(),
            S3Bucket: 'buckety bucket bucket'
        };
        try {
            await tryExportDynamoDBToS3(params, mockExporter());
            fail();
        } catch (e) {
            expect(e.message).toBe('DynamoDB Table Arn must be set');
        }
    });

    it('should only try once if the first attempt to export was successful', async() => {
        const params: RetryableExportInput = {
            originalTime: new Date().toISOString(),
            S3Bucket: 'buckety bucket bucket',
            TableArn: 'arny:table:arn'
        };
        const mockResult = jest.fn();
        mockResult.mockImplementation( () => {
            return {
                succeeded: true
            } as ExportTableResult;
        });
        await tryExportDynamoDBToS3(params, mockExporter(mockResult));
        expect(mockResult).toBeCalledTimes(1)
    });


    it('should try 3 times if all attempts to export fail but are retryable', async() => {
        const params: RetryableExportInput = {
            originalTime: new Date().toISOString(),
            S3Bucket: 'buckety bucket bucket',
            TableArn: 'arny:table:arn'
        };
        const mockResult = jest.fn();
        const cb = () => {
            return {
                succeeded: false,
                retryable: true
            } as ExportTableResult;
        };
        mockResult.mockImplementation(cb);
        
        await tryExportDynamoDBToS3(params, mockExporter(mockResult));
        expect(mockResult).toBeCalledTimes(3)
    });

    it('should try twice if first attempt fails retryable but second fails non retryable', async() => {
        const params: RetryableExportInput = {
            originalTime: new Date().toISOString(),
            S3Bucket: 'buckety bucket bucket',
            TableArn: 'arny:table:arn'
        };
        const mockResult = jest.fn();
        mockResult.mockImplementationOnce(() => {
            return {
                succeeded: false,
                retryable: true
            };
        });
        mockResult.mockImplementationOnce(() => {
            return {
                succeeded: false,
                retryable: false
            };
        });
        
        await tryExportDynamoDBToS3(params, mockExporter(mockResult));
        expect(mockResult).toBeCalledTimes(2)
    });

    it('retries 3 times when exporter throws exceptions each time', async() => {
        const params: RetryableExportInput = {
            originalTime: new Date().toISOString(),
            S3Bucket: 'buckety bucket bucket',
            TableArn: 'arny:table:arn'
        };
        const mockResult = jest.fn();
        mockResult.mockImplementation(() => {
            throw new Error('expected failure');
        });
        
        await tryExportDynamoDBToS3(params, mockExporter(mockResult));
        expect(mockResult).toBeCalledTimes(3)
    });
});

const mockExporter = (mock?: jest.Mock): ExportTable => {
    if ( mock === undefined ) {
        mock = jest.fn();
        mock.mockImplementation( () => {
            return {
                    
            } as ExportTableResult;
        });
    }
    return {
        requestExportDynamoDbToS3: mock
    }
};

