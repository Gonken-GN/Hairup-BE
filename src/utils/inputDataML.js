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

let inputDataJkt = [];
let inputDataBdg = [];
let inputDataSemarang = [];

const dataWeatherJkt = {
  kota: 'jakarta',
  input_data: inputDataJkt,
};

const dataWeatherBdg = {
  kota: 'bandung',
  input_data: inputDataBdg,
};

const dataWeatherSemarang = {
  kota: 'semarang',
  input_data: inputDataSemarang,
};
// Call weather API
// Extract weather data from the API response
function exportWeatherData(data) {
  const weatherObject = {};
  weatherObject.Tx = data.main.temp_max;
  weatherObject.tn = data.main.temp_min;
  weatherObject.RH_avg = data.main.humidity;
  if (data.rain) {
    weatherObject.RR = data.rain['1h'];
  } else {
    weatherObject.RR = 0;
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
  // Extract pollutant data from the API response
  const dataJkt = exportWeatherData(weatherJkt.data);
  const dataBdg = exportWeatherData(weatherBdg.data);
  const dataSemarang = exportWeatherData(weatherSemarang.data);
  // Create a data object to be sent to the server
  inputDataJkt.push(dataJkt);
  inputDataBdg.push(dataBdg);
  inputDataSemarang.push(dataSemarang);
  if (inputDataBdg.length > 3) {
    await axios.post('https://capstone-ml-fx7t635cra-uc.a.run.app/predict_weather', dataWeatherBdg);
    inputDataBdg = [];
  }

  if (inputDataJkt.length > 3) {
    await axios.post('https://capstone-ml-fx7t635cra-uc.a.run.app/predict_weather', dataWeatherJkt);
    inputDataJkt = [];
  }

  if (inputDataSemarang.length > 3) {
    await axios.post('https://capstone-ml-fx7t635cra-uc.a.run.app/predict_weather', dataWeatherSemarang);
    inputDataSemarang = [];
  }
  axios.post('https://capstone-ml-fx7t635cra-uc.a.run.app/predict_weather', dataJkt);
  axios.post('https://capstone-ml-fx7t635cra-uc.a.run.app/predict_weather', dataBdg);
  axios.post('https://capstone-ml-fx7t635cra-uc.a.run.app/predict_weather', dataSemarang);
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
