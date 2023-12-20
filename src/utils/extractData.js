import { formatDateAfter } from './getAPI.js';

function findMaxAqiForHour(perHours, hourKey) {
  let maxAqi = -Infinity;

  perHours.forEach((item) => {
    const aqiValue = item.data.aqi[hourKey];
    if (aqiValue > maxAqi) {
      maxAqi = aqiValue;
    }
  });

  return maxAqi;
}

function extractForecastData(foreCastData) {
  const extractedForecastData = [];

  // eslint-disable-next-line guard-for-in
  for (const key in foreCastData.predictions) {
    const { dominantPollutant, medianAQI } = foreCastData.predictions[key];
    extractedForecastData.push({
      dominantPollutant,
      medianAQI,
    });
  }
  return extractedForecastData;
}
function extractPastData(data) {
  const indexesData = [];
  let i = 1;
  // eslint-disable-next-line guard-for-in
  for (const key in data) {
    let date = formatDateAfter(i);
    data[key].hoursInfo.forEach((hourInfo) => {
      indexesData.push(...hourInfo.indexes);
    });
    // eslint-disable-next-line no-plusplus
    i--;
  }

  return indexesData;
}

function extractDataByUserInput(jsonData, userInput) {
  const key = `next_${userInput}`;
  const { predictions } = jsonData;

  if (predictions && predictions[key]) {
    return predictions[key];
  }
  return null; // Or handle the case where the key doesn't exist
}
export {
  extractForecastData, findMaxAqiForHour, extractPastData, extractDataByUserInput,
};
