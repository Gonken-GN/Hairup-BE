import asyncHandler from 'express-async-handler';
import rekomendasi from '../models/rekomendasi.model.js';
import { errorResponse } from '../utils/response.js';
import { getCoordinates, getKabKot, getProvinsi } from '../utils/lokasi.js';

export const createRekomendasi = asyncHandler(
  async (
    /** @type import('express').Request */ req,
    /** @type import('express').Response */ res,
  ) => {
    try {
      const data = await getKabKot(11);
      await getCoordinates('KABUPATEN ACEH BARAT');
      res.status(200).json(data);
    } catch (error) {
      errorResponse(res, error.message, 500);
    }
  },
);

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
