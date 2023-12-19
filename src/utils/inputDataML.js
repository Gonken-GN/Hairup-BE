import asyncHandler from 'express-async-handler';
import axios from 'axios';
import { callAQIAPI, callWeatherAPI } from './getAPI.js';
import { getCoordinates } from './lokasi.js';

// call Coordinates API
const coordinatesJkt = await getCoordinates('Jakarta');
const coordinatesBdg = await getCoordinates('Bandung');
const coordinatesSemarang = await getCoordinates('Semarang');

let dataForecastJkt = {};
let dataForecastBdg = {};
let dataForecastSemarang = {};

function setDataForecastJkt(data) {
  dataForecastJkt = data;
}
function setDataForecastBdg(data) {
  dataForecastBdg = data;
}
function setDataForecastSemarang(data) {
  dataForecastSemarang = data;
}

function getDataForecastJkt() {
  return dataForecastJkt;
}
function getDataForecastBdg() {
  return dataForecastBdg;
}
function getDataForecastSemarang() {
  return dataForecastSemarang;
}
// Extract pollutant data from the API response
function extractPollutantData(data) {
  const pollutantObject = {};
  data.pollutants.forEach((pollutant) => {
    // Use the pollutant code as the key and its concentration as the value
    pollutantObject[pollutant.code.toLowerCase()] = pollutant.concentration.value;
  });

  return pollutantObject;
}

// Create a data object to be sent to the server
let hourlyDataJkt = [];
const datatoSendJkt = {
  lokasi: 'jakarta',
  input_data: hourlyDataJkt,
};

let hourlyDataBdg = [];
const datatoSendBdg = {
  lokasi: 'bandung',
  input_data: hourlyDataBdg,
};

let hourlyDataSemarang = [];
const datatoSendSemarang = {
  lokasi: 'semarang',
  input_data: hourlyDataSemarang,
};

// Call AQI API
async function storeDataAQI() {
  // Call AQI API each cities
  const aqiJkt = await callAQIAPI(coordinatesJkt.lng, coordinatesJkt.lat);
  const aqiBdg = await callAQIAPI(coordinatesBdg.lng, coordinatesBdg.lat);
  const aqiSemarang = await callAQIAPI(
    coordinatesSemarang.lng,
    coordinatesSemarang.lat,
  );

  // Extract pollutant data from the API response
  const dataJkt = extractPollutantData(aqiJkt);
  const dataBdg = extractPollutantData(aqiBdg);
  const dataSemarang = extractPollutantData(aqiSemarang);

  // Create a data object to be sent to the server
  hourlyDataJkt.push(dataJkt);
  hourlyDataBdg.push(dataBdg);
  hourlyDataSemarang.push(dataSemarang);

  // check if the data length is more than 23 and send it to the server
  if (hourlyDataJkt.length > 23) {
    await axios.post('http://localhost:8000/test', datatoSendJkt).then((response) => {
      setDataForecastJkt(response.data);
    });
    hourlyDataJkt = [];
  }
  if (hourlyDataBdg.length > 23) {
    await axios.post('http://localhost:8000/test', datatoSendBdg).then((response) => {
      setDataForecastBdg(response.data);
    });
    hourlyDataBdg = [];
  }
  if (hourlyDataSemarang.length > 23) {
    await axios.post('http://localhost:8000/test', datatoSendSemarang).then((response) => {
      setDataForecastSemarang(response.data);
    });
    hourlyDataSemarang = [];
  }
}

// Call weather API
// Extract weather data from the API response
function exportWeatherData(data) {
  const weatherObject = {};
  weatherObject.temp_max = data.main.temp_max;
  weatherObject.temp_min = data.main.temp_min;
  weatherObject.humidity = data.main.humidity;
  if (data.rain) {
    weatherObject.rain = data.rain['1h'];
  } else {
    weatherObject.rain = 0;
  }
  return weatherObject;
}

async function storeDataWeather() {
  const weatherJkt = await callWeatherAPI(
    coordinatesJkt.lng,
    coordinatesJkt.lat,
  );
  const weatherBdg = await callWeatherAPI(
    coordinatesBdg.long,
    coordinatesBdg.lat,
  );
  const weatherSemarang = await callWeatherAPI(
    coordinatesSemarang.long,
    coordinatesSemarang.lat,
  );

  const dataJkt = exportWeatherData(weatherJkt.data);
  const dataBdg = exportWeatherData(weatherBdg.data);
  const dataSemarang = exportWeatherData(weatherSemarang.data);
  // axios.post('http://localhost:8000/test', dataJkt);
  // axios.post('http://localhost:8000/test', dataBdg);
  // axios.post('http://localhost:8000/test', dataSemarang);
}

async function storeDataAQITest() {
  // Call AQI API each cities
  const aqiJkt = await callAQIAPI(coordinatesJkt.lng, coordinatesJkt.lat);
  const aqiBdg = await callAQIAPI(coordinatesBdg.lng, coordinatesBdg.lat);
  const aqiSemarang = await callAQIAPI(
    coordinatesSemarang.lng,
    coordinatesSemarang.lat,
  );

  // Extract pollutant data from the API response
  const dataJkt = extractPollutantData(aqiJkt);
  const dataBdg = extractPollutantData(aqiBdg);
  const dataSemarang = extractPollutantData(aqiSemarang);

  // Create a data object to be sent to the server
  hourlyDataJkt.push(dataJkt);
  hourlyDataBdg.push(dataBdg);
  hourlyDataSemarang.push(dataSemarang);

  // check if the data length is more than 23 and send it to the server
  if (hourlyDataJkt.length > 1) {
    // await axios.post('http://localhost:8000/test', datatoSendJkt).then((response) => {
    //   setDataForecastJkt(response.data);
    // });
    hourlyDataJkt = [];
  }
  if (hourlyDataBdg.length > 1) {
    // await axios.post('http://localhost:8000/test', datatoSendBdg).then((response) => {
    //   setDataForecastBdg(response.data);
    // });
    console.log(datatoSendBdg);
    hourlyDataBdg = [];
  }
  if (hourlyDataSemarang.length > 1) {
    // await axios.post('http://localhost:8000/test', datatoSendSemarang).then((response) => {
    //   setDataForecastSemarang(response.data);
    // });
    console.log(datatoSendSemarang);
    hourlyDataSemarang = [];
  }
}
export {
  storeDataAQI,
  storeDataWeather,
  setDataForecastJkt,
  setDataForecastBdg,
  setDataForecastSemarang,
  getDataForecastJkt,
  getDataForecastBdg,
  getDataForecastSemarang,
  storeDataAQITest,
};
