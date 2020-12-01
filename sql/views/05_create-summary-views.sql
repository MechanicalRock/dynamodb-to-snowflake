create or replace view weather_stats as 
    SELECT 
        s.event_date,
        x.daily_global_solar_exposure_MJ_per_m2,
        r.rainfall_mm,
        r.rainfall_period_days,
        t.temp_max_c,
        s.sunshine_hrs,
        s.time_0900_wind_direction,
        s.time_0900_wind_speed_kmh
        FROM weather_summary s
        JOIN weather_rainfall r ON r.event_date=s.event_date
        JOIN weather_solar_exposure x ON x.event_date=s.event_date
        JOIN weather_tempmax t ON t.event_date=s.event_date
        ORDER BY s.event_date;

CREATE OR REPLACE VIEW longterm_weather_stats AS
    SELECT 
        r.event_date,
        x.daily_global_solar_exposure_MJ_per_m2,
        r.rainfall_mm,
        r.rainfall_period_days,
        t.temp_max_c   
        FROM weather_rainfall r
        JOIN weather_solar_exposure x ON x.event_date=r.event_date
        JOIN weather_tempmax t ON t.event_date=r.event_date
        ORDER BY r.event_date;