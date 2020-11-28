CREATE OR REPLACE VIEW weather_data_raw_latest AS
WITH themanifest AS (
  SELECT
    metadata$filename as filename,
    SPLIT_PART(filename,'manifest-summary.json',1) as filepath,
    $1:exportTime::TIMESTAMP_NTZ as exported,
    SPLIT_PART($1:manifestFilesS3Key,'manifest-files.json',1) as dumpPath
  FROM @DYNAMODB_SNOWFLAKE_BLOG/export/AWSDynamoDB (PATTERN=> ".*manifest-summary*.json", FILE_FORMAT=>PLAINJSON)
  ORDER BY exported DESC LIMIT 1
),
realdata AS (
    SELECT metadata$filename AS datafile,$1 AS datajson FROM @DYNAMODB_SNOWFLAKE_BLOG/export/AWSDynamoDB (PATTERN=> ".*json.gz")
)
select r.datafile,r.datajson from realdata r
join themanifest t on startswith(r.datafile,t.filepath);