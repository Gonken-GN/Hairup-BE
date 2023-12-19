import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import cron from 'node-cron';
import { Op } from 'sequelize';
import moment from 'moment';
import axios from 'axios';
import fs from 'fs/promises';
import Rekomendasi from './src/models/rekomendasi.model.js';
// import route
import userRouter from './src/routes/user.route.js';
import rekomendasiRouter from './src/routes/rekomendasi.route.js';
import inputData from './src/routes/inputData.route.js';
import {
  getDataForecastSemarang,
  setDataForecastSemarang,
  storeDataAQI,
  storeDataAQITest,
  storeDataWeather,
} from './src/utils/inputDataML.js';

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

  server.get('/test', async (req, res) => {
    const data = await fs.readFile('input_dict_dummy.json', 'utf-8');
    const obj = JSON.parse(data);
    await axios
      .post('https://capstone-ml-fx7t635cra-uc.a.run.app/predict', obj)
      .then((response) => {
        setDataForecastSemarang(response.data);
        console.log(getDataForecastSemarang());
        res.status(200).json({ message: 'Success', data: response.data });
      });
  });
  cron.schedule('0 * * * *', async () => {
    await storeDataAQI();
  });
  cron.schedule('0 0 * * *', async () => {
    await storeDataWeather();
    try {
      const today = moment().startOf('day'); // start of current day

      await Rekomendasi.destroy({
        where: {
          createdAt: {
            [Op.lt]: today.toDate(), // lt means "less than"
          },
        },
      });
      console.log('Old records deleted successfully');
    } catch (error) {
      console.error('Error deleting old records:', error);
    }
  });
};

init();
