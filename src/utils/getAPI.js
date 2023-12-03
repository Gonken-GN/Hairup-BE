import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();
async function getAQI(long, lat) {
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
  const aqi = await axios
    .post(
      `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${process.env.GOOGLE_API_KEY}`,
      aqiOptions,
    )
    .then((response) => response.data);
  return aqi;
}

async function getWeather(long, lat) {
  const weatherData = await axios
    .get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${process.env.OPENWEATHER_API_KEY}`,
    )
    .catch((err) => console.log(err));
  return weatherData;
}

export { getAQI, getWeather };
