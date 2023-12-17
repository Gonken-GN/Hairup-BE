import express from 'express';
import { createRekomendasi, deleteRekomendasi, getAqi, getRekomendasi } from '../controllers/rekomendasi.controller.js';

const router = express.Router();
router.get('/:id', getAqi);
router.get('/:id', getRekomendasi);
router.post('/:id', createRekomendasi);
router.delete('/:id', deleteRekomendasi);

export default router;
