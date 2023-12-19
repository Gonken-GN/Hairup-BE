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
  // eslint-disable-next-line guard-for-in
  for (const key in data) {
    data[key].hoursInfo.forEach((hourInfo) => {
      indexesData.push(...hourInfo.indexes);
    });
  }
  return indexesData;
}

export { extractForecastData, findMaxAqiForHour, extractPastData };
