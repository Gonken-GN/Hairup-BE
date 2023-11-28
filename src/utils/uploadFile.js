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

export function geneteratePublicUrl(fileName) {
  return (`https://storage.googleapis.com/${process.env.BUCKET_NAME}/${fileName}`);
}

export async function deleteObjectByLink(link) {
  // Extract the object name from the link (assuming the link follows the "https://storage.googleapis.com/bucket-name/object-name" format)
  const urlParts = new URL(link);
  const objectName = decodeURIComponent(urlParts.pathname.substring(1)); // Remove the leading slash
  // Split the objectName to extract the file name
  const parts = objectName.split('/');
  // Extract the last part, which is the file name
  const fileName = parts[parts.length - 1];
  console.log(fileName);
  console.log(objectName);
  try {
    // Delete the object
    await bucket.file(fileName).delete();
    console.log(`Object "${objectName}" deleted successfully.`);
  } catch (err) {
    console.error(`Error deleting object "${objectName}":`, err);
  }
}
