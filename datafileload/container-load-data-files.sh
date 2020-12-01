#!/bin/sh

FILES=$(find $INPUTDATADIR -iname "*.csv")

for file in $FILES; do
    ./ddbimport -inputFile "${file}" -tableName ${DYNAMODB_TABLE_NAME} -tableRegion ${AWS_DEFAULT_REGION}
done


