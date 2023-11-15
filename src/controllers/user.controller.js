import uploadFiles from '../utils/uploadFile.js';

export const testingUpload = async (
  /** @type import('express').Request */ req,
  /** @type import('express').Response */ res,
) => {
  try {
    const resUpload = await uploadFiles('package.json');
    return res.status(200).json({
      resUpload,
    });
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const testing = async () => {};
