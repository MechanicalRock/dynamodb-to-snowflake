CREATE OR REPLACE VIEW weather_solar_exposure AS
    SELECT
        datajson:Item.bom_station_number.S::STRING AS bom_station_number,
        datajson:Item.daily_global_solar_exposure_MJ_per_m2.S::NUMBER AS daily_global_solar_exposure_MJ_per_m2,
        datajson:Item.event_date.S::DATE AS event_date,
        datajson:Item.product_code.S::STRING AS product_code
        FROM weather_solar_exposure_raw;

CREATE OR REPLACE VIEW weather_rainfall AS
    SELECT datajson:Item.event_date.S::DATE AS event_date,
        datajson:Item.bom_station_number.S::STRING AS bom_station_number,
        datajson:Item.rainfall_mm.S::NUMBER AS rainfall_mm,
        datajson:Item.rainfall_period_days.S::NUMBER as rainfall_period_days
        FROM weather_rainfall_raw;

CREATE OR REPLACE VIEW weather_tempmax AS
    SELECT datajson:Item.event_date.S::DATE AS event_date,
        datajson:Item.bom_station_number.S::STRING AS bom_station_number,
        datajson:Item.temp_max_c.S::NUMBER AS temp_max_c
        FROM weather_tempmax_raw;

CREATE OR REPLACE VIEW weather_summary AS
  SELECT datajson:Item.event_date.S::DATE AS event_date,
  datajson:Item.rainfall_mm.S::NUMBER AS rainfall_mm,
  datajson:Item.sunshine_hrs.S::NUMBER AS sunshine_hrs,
  datajson:Item.time_0900_temp_c.S::NUMBER AS time_0900_temp_c,
  datajson:Item.time_0900_wind_direction.S::STRING AS time_0900_wind_direction,
  (CASE WHEN TRY_CAST(datajson:Item.time_0900_wind_speed_kmh.S::STRING AS NUMBER) IS NULL THEN 0 
   ELSE datajson:Item.time_0900_wind_speed_kmh.S::NUMBER END) AS time_0900_wind_speed_kmh
  FROM weather_summary_raw;