CREATE OR REPLACE VIEW weather_data_raw_latest AS
WITH themanifest AS (
  SELECT
    metadata$filename AS filename,
    SPLIT_PART(filename,'manifest-summary.json',1) AS filepath,
    $1:exportTime::TIMESTAMP_NTZ AS exported,
    SPLIT_PART($1:manifestFilesS3Key,'manifest-files.json',1) AS dumpPath
  FROM @DYNAMODB_SNOWFLAKE_BLOG/export/AWSDynamoDB (PATTERN=> ".*manifest-summary*.json", FILE_FORMAT=>PLAINJSON)
  ORDER BY exported DESC LIMIT 1
),
realdata AS (
    SELECT metadata$filename AS datafile,$1 AS datajson FROM @DYNAMODB_SNOWFLAKE_BLOG/export/AWSDynamoDB (PATTERN=> ".*json.gz")
)
SELECT r.datafile,r.datajson FROM realdata r
JOIN themanifest t ON STARTSWITH(r.datafile,t.filepath);