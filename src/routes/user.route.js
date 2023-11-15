import express from 'express';
import { testingUpload } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/', testingUpload);

export default router;
