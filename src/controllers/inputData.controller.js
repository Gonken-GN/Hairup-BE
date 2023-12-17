import asyncHandler from 'express-async-handler';
import axios from 'axios';
import { callAQIAPI } from '../utils/getAPI.js';
import { getCoordinates } from '../utils/lokasi.js';

function extractPollutantData(data) {

  const pollutantObject = {};
  data.pollutants.forEach((pollutant) => {
    // Use the pollutant code as the key and its concentration as the value
    pollutantObject[pollutant.code.toLowerCase()] = pollutant.concentration.value;
  });

  return pollutantObject;
}

let hourlyData = [];
const coordinatesJkt = await getCoordinates('Jakarta');
const coordinatesBdg = await getCoordinates('Bandung');
const coordinatesSemarang = await getCoordinates('Semarang');

async function storeData() {
  const aqiJkt = await callAQIAPI(coordinatesJkt.lng, coordinatesJkt.lat);
  // const aqiBdg = await callAQIAPI(coordinatesBdg.long, coordinatesBdg.lat);
  // const aqiSemarang = await callAQIAPI(coordinatesSemarang.long, coordinatesSemarang.lat);
  const data = extractPollutantData(aqiJkt);
  hourlyData.push(data);
  if (hourlyData.length > 23) {
    // axios.post('http://localhost:8000/test', hourlyData);
    hourlyData = [];
  }
}

export default storeData;
