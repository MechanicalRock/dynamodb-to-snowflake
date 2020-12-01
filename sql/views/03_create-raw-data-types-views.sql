CREATE OR REPLACE VIEW weather_solar_exposure_raw AS
  SELECT * FROM weather_data_raw_latest WHERE datajson:Item.data_type.S = 'weather_solar_exposure';

CREATE OR REPLACE VIEW weather_rainfall_raw AS
  SELECT * FROM weather_data_raw_latest WHERE datajson:Item.data_type.S = 'weather_rainfall';

CREATE OR REPLACE VIEW weather_tempmax_raw AS
  SELECT * FROM weather_data_raw_latest WHERE datajson:Item.data_type.S = 'weather_tempmax';

CREATE OR REPLACE VIEW weather_summary_raw AS
  SELECT * FROM weather_data_raw_latest WHERE datajson:Item.data_type.S = 'weather_summary';