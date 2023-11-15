import asyncHandler from 'express-async-handler';

import { generatePublicUrl, uploadFiles } from '../utils/uploadFile.js';

export const testingUpload = asyncHandler(async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
) => {
  try {
    const resUpload = await uploadFiles('package.json');
    const imageUrl = generatePublicUrl(resUpload[0].metadata.name);
    return res.status(200).json({
      success: true,
      message: `Image ${imageUrl} successfully uploaded`,
    });
  } catch (error) {
    console.log(error);
    return null;
  }
});

export const updateImage = asyncHandler(async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
) => {  
});
