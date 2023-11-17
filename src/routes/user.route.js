import express from 'express';
import {
  createUser,
  deleteUser,
  getUserById,
  updateUser,
} from '../controllers/user.controller.js';

const router = express.Router();

router.post('/', createUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
