import axios from 'axios';
import * as dotenv from 'dotenv';
import { errorResponse } from './response.js';

dotenv.config();
let aqi = {};
let weather = {};

function getAQI() {
  return aqi;
}

function getWeather() {
  return weather;
}
async function callAQIAPI(
  long,
  lat,
  /** @type import('express').Response */ res,
) {
  const aqiOptions = {
    universalAqi: true,
    location: {
      latitude: lat,
      longitude: long,
    },
    extraComputations: [
      'HEALTH_RECOMMENDATIONS',
      'DOMINANT_POLLUTANT_CONCENTRATION',
      'POLLUTANT_CONCENTRATION',
      'LOCAL_AQI',
      'POLLUTANT_ADDITIONAL_INFO',
    ],
    languageCode: 'id',
  };
  await axios
    .post(
      `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${process.env.GOOGLE_API_KEY}`,
      aqiOptions,
    )
    .then((response) => {
      aqi = response.data;
    })
    .catch((err) => errorResponse(errorResponse(res, err.message, 500)));
  return getAQI();
}
async function callWeatherAPI(long, lat) {
  weather = await axios
    .get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${process.env.OPENWEATHER_API_KEY}`,
    )
    .catch((err) => console.log(err));
  return getWeather();
}

export {
  getAQI, getWeather, callAQIAPI, callWeatherAPI,
};
