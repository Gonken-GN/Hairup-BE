import express from 'express';
import { createRekomendasi } from '../controllers/rekomendasi.controller.js';

const router = express.Router();
router.get('/', createRekomendasi);

export default router;
