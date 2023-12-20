import asyncHandler from 'express-async-handler';
import { errorResponse } from '../utils/response.js';
import { getCoordinates } from '../utils/lokasi.js';
import {
  callAQIAPI,
  callWeatherAPI,
  formatDate,
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
import {
  extractDataByUserInput,
  extractForecastData,
  extractPastData,
  findMaxAqiForHour,
} from '../utils/extractData.js';

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
      const { waktuKeluar, tanggal, lokasi } = req.body;
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

      const hari = extractDataByUserInput(dataForecast, tanggal);
      const test = findMaxAqiForHour(hari.perHours, waktuKeluar);
      let message = '';
      if (test < 50) {
        message = 'Udara hari ini sangat segar! Ideal untuk aktivitas luar. Nikmati alam dan jaga kesehatan dengan udara bersih.';
      } else if (test > 50 && test < 100) {
        message = 'Kualitas udara cukup baik. Cocok untuk kegiatan luar, tapi tetap waspada bagi yang sensitif.';
      } else if (test > 100 && test < 150) {
        message = 'Udara kurang bersahabat untuk sensitif. Batasi aktivitas luar dan jaga kesehatan, mari jaga udara bersih';
      } else if (test > 150 && test < 200) {
        message = 'Udara hari ini menantang. Batasi waktu di luar, gunakan masker, dan lakukan aktivitas ringan saja.';
      } else if (test > 200 && test < 300) {
        message = 'Udara sangat tidak sehat. Dianjurkan tetap di dalam, jaga sirkulasi udara, dan mari bersatu untuk udara bersih.  ';
      } else if (test > 300) {
        message = 'Darurat! Udara berbahaya. Hindari keluar rumah, jaga kualitas udara dalam ruangan. Ayo bertindak untuk lingkungan!';
      }
      if (rekomendasi) {
        await Rekomendasi.update(
          {
            userId: id,
            lokasi,
            pesan: message,
          },
          { where: { userId: id } },
        );
        const response = await Rekomendasi.findOne({
          where: { userId: req.params.id },
        });
        res.status(200).json({ success: true, response });
      } else {
        const response = await Rekomendasi.create({
          userId: id,
          lokasi,
          pesan: message,
        });
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
      const date = new Date();
      date.setDate(date.getDate());

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
      // Get current data AQI
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
      // Create data object for AQI
      const dataSemarang = {
        PastDataAQI: pastDataSemarang,
        currentDataAQI: (currentDataSemarang.indexes[0], date),
        foreCastAQI: foreCastDataSemarang,
      };
      const dataJkt = {
        PastDataAQI: pastDataJkt,
        currentDataAQI: (currentDataJkt.indexes[0], date),
        foreCastAQI: foreCastDataJkt,
      };
      const dataBdg = {
        PastDataAQI: pastDataBdg,
        currentDataAQI: (currentDataBdg.indexes[0], date),
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
