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
import { getDataForecastBdg, getDataForecastJkt, getDataForecastSemarang } from '../utils/inputDataML.js';
import { extractForecastData, extractPastData } from '../utils/extractData.js';

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
            key.toLowerCase().includes(user.riwayatPenyakit?.toLowerCase().replace(/ /g, ''))
            || key.toLowerCase().includes(user.status?.toLowerCase().replace(/ /g, ''))
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
      const {
        waktuKeluar, lokasi, status,
      } = req.body;
      const { id } = req.params;
      const coordinates = await getCoordinates(lokasi);
      const aqi = getAQI();
      const weather = getWeather();
      const rekomendasi = await Rekomendasi.findOne({ where: { userId: id } });
      if (rekomendasi) {
        let dataForecast = {};
        if (lokasi === 'semarang') {
          dataForecast = getDataForecastSemarang();
        } else if (lokasi === 'jakarta') {
          dataForecast = getDataForecastJkt();
        } else if (lokasi === 'bandung') {
          dataForecast = getDataForecastBdg();
        }
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
      const coordinatesBandung = await getCoordinates('Semarang');
      const data = await getPreviousDaysAQI(
        coordinatesBandung.lng,
        coordinatesBandung.lat,
        3,
      );
      // Extracting indexes data
      const pastData = extractPastData(data);
      const foreCastData = extractForecastData(getDataForecastSemarang());
      const currentData = getAQI();
      const dataSemarang = {
        PastDataAQI: pastData,
        currentDataAQI: currentData.indexes[0],
        foreCastAQI: foreCastData,
      };
      res
        .status(200)
        .json({
          success: true,
          semarang: dataSemarang,
        });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);
