import { Storage } from '@google-cloud/storage';
import * as dotenv from 'dotenv';

dotenv.config();
const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  keyFilename: process.env.KEY_SERVICE_ACCOUNT,
});
const bucket = storage.bucket(process.env.BUCKET_NAME);
export async function uploadFiles(file) {
  try {
    const upload = await bucket.upload(file);

    return upload;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export function generatePublicUrl(objectName) {
  return `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${objectName}`;
}

export async function deleteFiles(fileName) {
  const file = bucket.file(fileName);
  await file.delete();
}
