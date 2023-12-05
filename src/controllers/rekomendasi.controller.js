import asyncHandler from 'express-async-handler';
import axios from 'axios';
import * as dotenv from 'dotenv';

import rekomendasi from '../models/rekomendasi.model.js';
import { errorResponse } from '../utils/response.js';
import { getCoordinates, getKabKot, getProvinsi } from '../utils/lokasi.js';
import { getAQI, getWeather } from '../utils/getAPI.js';

// export const createRekomendasi = asyncHandler(
//   async (
//     /** @type import('express').Request */ req,
//     /** @type import('express').Response */ res,
//   ) => {
//     try {
//       // const data = await getKabKot(11);
//       const coordinates = await getCoordinates('KABUPATEN ACEH BARAT');
//       const aqi = await getAQI(coordinates.lng, coordinates.lat);
//       const weather = await getWeather(coordinates.lng, coordinates.lat);
//       res.status(200).json({ coordinates, weather: weather.data, aqi });
//     } catch (error) {
//       errorResponse(res, error.message, 500);
//     }
//   },
// );

// export const getAqi = asyncHandler(
//   async (
//     /** @type import('express').Request */ req,
//     /** @type import('express').Response */ res,
//   ) => {
//     try {
//     } catch (error) {
//       errorResponse(res, error.message, 500);
//     }
//   },
// );

export const getRekomendasi = asyncHandler(
  async (
    /** @type import('express').Request */ req,
    /** @type import('express').Response */ res,
  ) => {
    try {
      const response = await Rekomendasi.findAll();
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

export const getRekomendasiById = asyncHandler(
  async (
    /** @type import('express').Request */ req,
    /** @type import('express').Response */ res,
  ) => {
    try {
      const user = await Rekomendasi.findOne({
        where: {
          id: req.params.id,
        },
      });
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

// export const createRekomendasi2 = asyncHandler(
//   async (
//     /** @type import('express').Request */ req,
//     /** @type import('express').Response */ res,
//   ) => {
//     try {
//       if (req.body.files) {
//         const umur = await Umur.create('package.json');
//         const user = await User.create({ ...req.body, avatarUrl });
//         res.status(200).json({
//           success: true,
//           user,
//         });
//       }
//       const user = await User.create(req.body);
//       res.status(200).json({
//         success: true,
//         user,
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   },
// );

// export const createRekomendasi1 = asyncHandler(
//   async (
//     /** @type import('express').Request */ req,
//     /** @type import('express').Response */ res,
//   ) => {
//     try {
//       const age = await getUmur();
//     } catch (error) {
//       errorResponse(res, error.message, 500);
//     }
//   },
// );

export const createRekomendasi = asyncHandler(
  async (
    /** @type import('express').Request */ req,
    /** @type import('express').Response */ res,
  ) => {
    try {
      const { umur } = req.body;
      const { status, riwayatPenyakit } = req.body;
      if (status === 'pregnant' || status === 'athletes') {
        res.status(200).json(status);
      } else if (
        riwayatPenyakit === 'Heart Disease' || riwayatPenyakit === 'Lung Disease') {
        res.status(200).json(riwayatPenyakit);
      }
    } catch (error) {
      errorResponse(res, error.message, 500);
    }
  },
); 1;

export const deleteRekomendasi = asyncHandler(
  async (
    /** @type import('express').Request */ req,
    /** @type import('express').Response */ res,
  ) => {
    try {
      const user = await Rekomendasi.findOne({
        where: {
          id: req.params.id,
        },
      });
      await Rekomendasi.destroy({
        where: {
          id: req.params.id,
        },
      });
      res.status(200).json({ message: 'Rekomendasi Deleted' });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);