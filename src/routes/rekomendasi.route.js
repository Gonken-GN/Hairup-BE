import express from 'express';
import {
  createRekomendasi,
  deleteRekomendasi,
  forecastAQIAPI,
  forecastWeatherAPI,
  getAqi,
  getRekomendasi,
} from '../controllers/rekomendasi.controller.js';

const router = express.Router();
router.get('/user/:id', getAqi);
router.get('/rekomendasi/:id', getRekomendasi);
router.post('/user/:id', createRekomendasi);
router.delete('/user/:id', deleteRekomendasi);
router.get('/forecastAQI', forecastAQIAPI);
router.get('/forecastWeather', forecastWeatherAPI);

export default router;
