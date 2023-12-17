import asyncHandler from 'express-async-handler';
import cron from 'node-cron';
import moment from 'moment';
import { Op } from 'sequelize';
import { errorResponse } from '../utils/response.js';
import { getCoordinates, getKabKot, getProvinsi } from '../utils/lokasi.js';
import {
  callAQIAPI,
  callWeatherAPI,
  getAQI,
  getWeather,
} from '../utils/getAPI.js';
import Rekomendasi from '../models/rekomendasi.model.js';

let statusCategory = null;
export const getAqi = asyncHandler(
  async (
    /** @type import('express').Request */ req,
    /** @type import('express').Response */ res,
  ) => {
    try {
      const coordinates = await getCoordinates('KABUPATEN ACEH BARAT');
      const aqi = await callAQIAPI(coordinates.lng, coordinates.lat);
      const weather = await callWeatherAPI(coordinates.lng, coordinates.lat);
      const user = await Rekomendasi.findOne({ where: { userId: req.params.id } });
      const riwayatPenyakit = 'heartDiseasePopulation';
      const status = 'pregnant';
      const recommendation = [];

      let flag = false;
      if (aqi) {
        Object.entries(aqi.healthRecommendations).forEach(([key, value]) => {
          if (
            key.toLowerCase().includes(user.riwayatPenyakit.toLowerCase())
            || key.toLowerCase().includes(user.status.toLowerCase())
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
          coordinates,
          weather: weather.data,
          aqi,
          rekomendasi: recommendation,
          notification: statusCategory,
        });
      } else {
        res.status(200).json({
          success: true,
          coordinates,
          weather: weather.data,
          aqi,
          rekomendasi: recommendation,
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
        waktuKeluar, durasi, lokasi, status,
      } = req.body;
      const { id } = req.params;
      const coordinates = await getCoordinates(lokasi);
      const aqi = getAQI();
      const weather = getWeather();
      const rekomendasi = await Rekomendasi.findOne({ where: { userId: id } });
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

cron.schedule('0 0 * * *', async () => {
  try {
    const today = moment().startOf('day'); // start of current day

    await Rekomendasi.destroy({
      where: {
        createdAt: {
          [Op.lt]: today.toDate(), // lt means "less than"
        },
      },
    });
    console.log('Old records deleted successfully');
  } catch (error) {
    console.error('Error deleting old records:', error);
  }
});
