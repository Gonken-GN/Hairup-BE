import asyncHandler from 'express-async-handler';
import { errorResponse } from '../utils/response.js';
import { getCoordinates } from '../utils/lokasi.js';
import {
  callAQIAPI,
  callWeatherAPI,
  getAQI,
  getPreviousDaysAQI,
  getWeather,
  setAQI,
} from '../utils/getAPI.js';
import Rekomendasi from '../models/rekomendasi.model.js';
import User from '../models/user.model.js';
import {
  getDataForecastBdg,
  getDataForecastJkt,
  getDataForecastSemarang,
} from '../utils/inputDataML.js';
import { extractForecastData, extractPastData, findMaxAqiForHour } from '../utils/extractData.js';

let statusCategory = null;
export const getAqi = asyncHandler(
  async (
    /** @type import('express').Request */ req,
    /** @type import('express').Response */ res,
  ) => {
    try {
      const user = await User.findOne({ where: { id: req.params.id } });
      const coordinates = await getCoordinates(user.lokasi);
      const aqi = await callAQIAPI(coordinates.lng, coordinates.lat);
      const weather = await callWeatherAPI(coordinates.lng, coordinates.lat);
      const recommendation = [];
      setAQI(aqi);
      let flag = false;
      if (aqi) {
        Object.entries(aqi.healthRecommendations).forEach(([key, value]) => {
          if (
            key
              .toLowerCase()
              .includes(
                user.riwayatPenyakit?.toLowerCase().replace(/ /g, ''),
              )
            || key
              .toLowerCase()
              .includes(user.status?.toLowerCase().replace(/ /g, ''))
          ) {
            flag = true;
            recommendation.push(value);
          }
        });
        if (!flag) {
          recommendation.push(aqi.healthRecommendations.generalPopulation);
        }
      }
      if (aqi.indexes[0].category !== statusCategory) {
        statusCategory = aqi.indexes[0].category;
        res.status(200).json({
          success: true,
          coordinates,
          weather: weather.data,
          aqi,
          rekomendasi: recommendation,
          notification: {
            success: true,
            message: statusCategory,
          },
        });
      } else {
        res.status(200).json({
          success: true,
          coordinates,
          weather: weather.data,
          aqi,
          rekomendasi: recommendation,
          notification: {
            success: false,
          },
        });
      }
    } catch (error) {
      errorResponse(res, error.message, 500);
    }
  },
);

export const getRekomendasi = asyncHandler(
  async (
    /** @type import('express').Request */ req,
    /** @type import('express').Response */ res,
  ) => {
    try {
      const response = await Rekomendasi.findOne({
        where: { userId: req.params.id },
      });
      res.status(200).json({
        success: true,
        response,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

export const createRekomendasi = asyncHandler(
  async (
    /** @type import('express').Request */ req,
    /** @type import('express').Response */ res,
  ) => {
    try {
      const { waktuKeluar, lokasi } = req.body;
      const { id } = req.params;
      const rekomendasi = await Rekomendasi.findOne({ where: { userId: id } });
      let dataForecast = {};
      if (lokasi === 'semarang') {
        dataForecast = getDataForecastSemarang();
      } else if (lokasi === 'jakarta') {
        dataForecast = getDataForecastJkt();
      } else if (lokasi === 'bandung') {
        dataForecast = getDataForecastBdg();
      }
      const test = findMaxAqiForHour(dataForecast.predictions.next_1.perHours, waktuKeluar);
      res.status(200).json({ success: true, test });  
      console.log(test);
      if (rekomendasi) {
        await Rekomendasi.update(
          {
            userId: id,
          },
          { where: { userId: id } },
        );
        res.status(200).json({ success: true, rekomendasi });
      } else {
        const response = await Rekomendasi.create({ userId: id });
        res.status(200).json({ success: true, response });
      }
    } catch (error) {
      errorResponse(res, error.message, 500);
    }
  },
);

export const deleteRekomendasi = asyncHandler(
  async (
    /** @type import('express').Request */ req,
    /** @type import('express').Response */ res,
  ) => {
    try {
      await Rekomendasi.destroy({
        where: {
          userId: req.params.id,
        },
      });
      res.status(200).json({ success: true, message: 'Rekomendasi Deleted' });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

export const forecastAPI = asyncHandler(
  async (
    /** @type import('express').Request */ req,
    /** @type import('express').Response */ res,
  ) => {
    try {
      // Get coordinates
      const coordinatesBandung = await getCoordinates('Semarang');
      const coordinatesJakarta = await getCoordinates('Jakarta');
      const coordinatesSemarang = await getCoordinates('Semarang');

      // Get AQI data
      const dataPrevBdg = await getPreviousDaysAQI(
        coordinatesBandung.lng,
        coordinatesBandung.lat,
        3,
      );
      const dataPrevJkt = await getPreviousDaysAQI(
        coordinatesJakarta.lng,
        coordinatesJakarta.lat,
        3,
      );
      const dataPrevSemarang = await getPreviousDaysAQI(
        coordinatesSemarang.lng,
        coordinatesSemarang.lat,
        3,
      );
      // Extracting indexes data
      const pastDataBdg = extractPastData(dataPrevBdg);
      const pastDataJkt = extractPastData(dataPrevJkt);
      const pastDataSemarang = extractPastData(dataPrevSemarang);
      // Get forecast data
      const foreCastDataBdg = extractForecastData(getDataForecastSemarang());
      const foreCastDataJkt = extractForecastData(getDataForecastJkt());
      const foreCastDataSemarang = extractForecastData(
        getDataForecastSemarang(),
      );

      const currentDataBdg = await callAQIAPI(
        coordinatesBandung.lng,
        coordinatesBandung.lat,
      );
      const currentDataJkt = await callAQIAPI(
        coordinatesJakarta.lng,
        coordinatesJakarta.lat,
      );
      const currentDataSemarang = await callAQIAPI(
        coordinatesSemarang.lng,
        coordinatesSemarang.lat,
      );
      const dataSemarang = {
        PastDataAQI: pastDataBdg,
        currentDataAQI: currentDataSemarang.indexes[0],
        foreCastAQI: foreCastDataSemarang,
      };
      const dataJkt = {
        PastDataAQI: pastDataJkt,
        currentDataAQI: currentDataJkt.indexes[0],
        foreCastAQI: foreCastDataJkt,
      };
      const dataBdg = {
        PastDataAQI: pastDataBdg,
        currentDataAQI: currentDataBdg.indexes[0],
        foreCastAQI: foreCastDataBdg,
      };
      res.status(200).json({
        success: true,
        semarang: dataSemarang,
        bandung: dataBdg,
        jakarta: dataJkt,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);
