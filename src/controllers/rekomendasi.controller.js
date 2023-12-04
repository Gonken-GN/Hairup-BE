import asyncHandler from 'express-async-handler';
import axios from 'axios';
import * as dotenv from 'dotenv';

import rekomendasi from '../models/rekomendasi.model.js';
import { errorResponse } from '../utils/response.js';
import { getCoordinates, getKabKot, getProvinsi } from '../utils/lokasi.js';
import { getAQI, getWeather } from '../utils/getAPI.js';


export const createRekomendasi = asyncHandler(
  async (
    /** @type import('express').Request */ req,
    /** @type import('express').Response */ res,
  ) => {
    try {
      const data = await getKabKot(11);
      const coordinates = await getCoordinates('KABUPATEN ACEH BARAT');
      const aqi = await getAQI(coordinates.lng, coordinates.lat);
      const weather = await getWeather(coordinates.lng, coordinates.lat);
      res.status(200).json({ coordinates, weather: weather.data, aqi });
    } catch (error) {
      errorResponse(res, error.message, 500);
    }
  },
);

export const getAqi = asyncHandler(
  async (
    /** @type import('express').Request */ req,
    /** @type import('express').Response */ res,
  ) => {
    try {
    } catch (error) {
      errorResponse(res, error.message, 500);
    }
  },
);

export const createRekomendasi1 = asyncHandler(
  async (
    /** @type import('express').Request */ req,
    /** @type import('express').Response */ res,
  ) =>{
    try {
      const age = await getUmur();
    } catch (error) {
      errorResponse(res, error.message, 500);
    }
  }
);

export const createRekomendasi2 = asyncHandler(
  async (
    /** @type import('express').Request */ req,
    /** @type import('express').Response */ res,
  ) =>{
    try {
      const {status, riwayatPenyakit} = req.body
      if (statusAnswer === 'pregnant' || statusAnswer === 'athletes'){
        res.status(200).json(status);
      }else if (
        (riwayatPenyakitAnswer === 'Heart Disease' || riwayatPenyakitAnswer === 'Lung Disease'){
          res.status(200).json(riwayatPenyakit);
        });
      
    } catch (error) {
      errorResponse(res, error.message, 500);
    }
  }
);1