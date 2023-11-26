import asyncHandler from 'express-async-handler';
import rekomendasi from '../models/rekomendasi.model.js';
import { errorResponse } from '../utils/response.js';

export const createRekomendasi = asyncHandler(
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
