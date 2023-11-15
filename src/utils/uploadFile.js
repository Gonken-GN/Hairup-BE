import { Storage } from "@google-cloud/storage";
import * as dotenv from "dotenv";

dotenv.config();
export default async function uploadFiles(file) {
  try {
    const storage = new Storage({
      projectId: process.env.PROJECT_ID,
      keyFilename: process.env.KEY_SERVICE_ACCOUNT,
    });
    const bucket = storage.bucket(process.env.BUCKET_NAME);
    const upload = await bucket.upload(file);

    return upload;
  } catch (error) {
    console.log(error);
    return null;
  }
}
