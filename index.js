import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import cron from 'node-cron';
// import route
import userRouter from './src/routes/user.route.js';
import rekomendasiRouter from './src/routes/rekomendasi.route.js';
import inputData from './src/routes/inputData.route.js';
import storeData from './src/controllers/inputData.controller.js';

dotenv.config();
const init = () => {
  const server = express();
  server.use(bodyParser.json());
  server.use(cors());
  // Server routes
  server.use('/user', userRouter);
  server.use('/api', rekomendasiRouter);
  server.use('/test', inputData);
  //   Server initialization
  server.listen(process.env.PORT || 8000, () => {
    console.log(`Serving on port ${process.env.PORT}`);
  });
  server.get('/', (req, res) => {
    res.json({ message: 'Deployment berhasil 2023' });
  });
  cron.schedule('0 * * * *', async () => {
    storeData();
  });
};

init();
