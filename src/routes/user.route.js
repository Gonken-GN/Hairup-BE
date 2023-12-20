import express from 'express';
import multer from 'multer';
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from '../controllers/user.controller.js';

const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });
const router = express.Router();

router.post('/', upload.single('avatar'), createUser);
router.get('/:id', getUserById);
router.get('/', getUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
