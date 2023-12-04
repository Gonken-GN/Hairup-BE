import express from 'express';
import { sseController } from '../controllers/notifikasi.controller.js';

const router = express.Router();
router.get('/events', sseController.connect);

export default router;
