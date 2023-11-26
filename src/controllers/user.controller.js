import asyncHandler from 'express-async-handler';
import { deleteObjectByLink, geneteratePublicUrl, uploadFiles } from '../utils/uploadFile.js';
import User from '../models/user.model.js';

export const getUsers = asyncHandler(
  async (
    /** @type import('express').Request */ req,
    /** @type import('express').Response */ res,
  ) => {
    try {
      const response = await User.findAll();
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
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
      res.status(500).json({
        success: false,
        message: error.message,
      });
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
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('en-GB', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
        });

        await uploadFiles(req.body.files);
        const avatarUrl = geneteratePublicUrl(formattedDate, req.body.files);
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
      res.status(500).json({
        success: false,
        message: error.message,
      });
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
        deleteObjectByLink(user.avatarUrl);
        await user.update(req.body);
        res.status(200).json({ success: true, user });
      }
      await User.update(req.body, {
        where: {
          id: req.params.id,
        },
      });
      res.status(200).json({ msg: 'User Updated' });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
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
      res.status(200).json({ message: 'User Deleted' });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);
