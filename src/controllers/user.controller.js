import asyncHandler from 'express-async-handler';
import {
  deleteObjectByLink,
  geneteratePublicUrl,
  uploadFiles,
} from '../utils/uploadFile.js';
import User from '../models/user.model.js';
import { errorResponse } from '../utils/response.js';

export const getUsers = asyncHandler(
  async (
    /** @type import('express').Request */ req,
    /** @type import('express').Response */ res,
  ) => {
    try {
      const response = await User.findAll();
      res.status(200).json({ success: true, response });
    } catch (error) {
      errorResponse(res, error.message, 500);
    }
  },
);

export const getUserById = asyncHandler(
  async (
    /** @type import('express').Request */ req,
    /** @type import('express').Response */ res,
  ) => {
    try {
      const user = await User.findOne({
        where: {
          id: req.params.id,
        },
      });
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      errorResponse(res, error.message, 500);
    }
  },
);

export const createUser = asyncHandler(
  async (
    /** @type import('express').Request */ req,
    /** @type import('express').Response */ res,
  ) => {
    try {
      if (req.body.files) {
        await uploadFiles(req.body.files);
        const avatarUrl = geneteratePublicUrl('package.json');
        const user = await User.create({ ...req.body, avatarUrl });
        res.status(200).json({
          success: true,
          user,
        });
      }
      const user = await User.create(req.body);
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      errorResponse(res, error.message, 500);
    }
  },
);

export const updateUser = asyncHandler(
  async (
    /** @type import('express').Request */ req,
    /** @type import('express').Response */ res,
  ) => {
    try {
      if (req.body.files) {
        const user = await User.findOne({
          where: {
            id: req.params.id,
          },
        });
        console.log(user.avatarUrl);
        deleteObjectByLink(user.avatarUrl);
        await uploadFiles(req.body.files);
        const avatarUrl = geneteratePublicUrl(req.body.files);
        await user.update({ ...req.body, avatarUrl });
        res.status(200).json({ success: true, user });
      } else {
        await User.update(req.body, {
          where: {
            id: req.params.id,
          },
        });
      }

      res.status(200).json({ msg: 'User Updated' });
    } catch (error) {
      errorResponse(res, error.message, 500);
    }
  },
);

export const deleteUser = asyncHandler(
  async (
    /** @type import('express').Request */ req,
    /** @type import('express').Response */ res,
  ) => {
    try {
      const user = await User.findOne({
        where: {
          id: req.params.id,
        },
      });
      if (user.avatarUrl) {
        deleteObjectByLink(user.avatarUrl);
      }
      await User.destroy({
        where: {
          id: req.params.id,
        },
      });
      res.status(200).json({ success: true, message: 'User Deleted' });
    } catch (error) {
      errorResponse(res, error.message, 500);
    }
  },
);
