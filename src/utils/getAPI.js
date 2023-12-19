import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();
let aqi = {};
let weather = {};

function setAQI(newAqi) {
  aqi = newAqi;
}
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
  let tempAqi = {};
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
      tempAqi = response.data;
    })
    .catch((err) => console.log(err.message));
  return tempAqi;
}
async function callWeatherAPI(long, lat) {
  weather = await axios
    .get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${process.env.OPENWEATHER_API_KEY}`,
    )
    .catch((err) => console.log(err));
  return getWeather();
}

async function formatDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

async function getAQIData(long, lat, dateTime) {
  const aqiOptions = {
    dateTime,
    location: {
      latitude: lat,
      longitude: long,
    },
    languageCode: 'id',
  };

  try {
    const response = await axios.post(
      `https://airquality.googleapis.com/v1/history:lookup?key=${process.env.GOOGLE_API_KEY}`,
      aqiOptions,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching AQI data:', error);
    return null;
  }
}

async function getPreviousDaysAQI(long, lat, days) {
  const aqiHistory = {};
  // eslint-disable-next-line no-plusplus
  for (let i = 1; i <= days; i++) {
    const date = await formatDate(i);
    aqiHistory[i] = await getAQIData(long, lat, date);
  }

  return aqiHistory;
}

export {
  getAQI,
  getWeather,
  callAQIAPI,
  callWeatherAPI,
  getPreviousDaysAQI,
  formatDate,
  getAQIData,
  setAQI,
};
