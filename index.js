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
  getDataForecastJkt,
  getDataForecastSemarang,
  getDataForecastWeatherBdg,
  setDataForecastBdg,
  setDataForecastJkt,
  setDataForecastSemarang,
  setDataForecastWeatherBdg,
  setDataForecastWeatherJkt,
  setDataForecastWeatherSemarang,
  storeDataAQI,
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
    const dataBdg = await fs.readFile('input_dict_dummy_bdg.json', 'utf-8');
    const dataJkt = await fs.readFile('input_dict_dummy_jkt.json', 'utf-8');
    const obj = JSON.parse(data);
    const objBdg = JSON.parse(dataBdg);
    const objJkt = JSON.parse(dataJkt);
    await axios
      .post('https://capstone-ml-fx7t635cra-uc.a.run.app/predict', obj)
      .then((response) => {
        setDataForecastSemarang(response.data);
      });
    await axios
      .post('https://capstone-ml-fx7t635cra-uc.a.run.app/predict', objBdg)
      .then((response) => {
        setDataForecastBdg(response.data);
      });
    await axios
      .post('https://capstone-ml-fx7t635cra-uc.a.run.app/predict', objJkt)
      .then((response) => {
        setDataForecastJkt(response.data);
      });
    res.status(200).json({ message: 'Success', data: getDataForecastJkt() });
  });

  server.get('/testWeather', async (req, res) => {
    const data = await fs.readFile('input_weather_smrg.json', 'utf-8');
    const dataBdg = await fs.readFile('input_weather_bdg.json', 'utf-8');
    const dataJkt = await fs.readFile('input_weather_jkt.json', 'utf-8');
    const obj = JSON.parse(data);
    const objBdg = JSON.parse(dataBdg);
    const objJkt = JSON.parse(dataJkt);
    await axios
      .post('https://capstone-ml-fx7t635cra-uc.a.run.app/predict_weather', obj)
      .then((response) => {
        setDataForecastWeatherSemarang(response.data);
      });
    await axios
      .post('https://capstone-ml-fx7t635cra-uc.a.run.app/predict_weather', objBdg)
      .then((response) => {
        setDataForecastWeatherBdg(response.data);
      });
    await axios
      .post('https://capstone-ml-fx7t635cra-uc.a.run.app/predict_weather', objJkt)
      .then((response) => {
        setDataForecastWeatherJkt(response.data);
      });
    res.status(200).json({ message: 'Success', data: getDataForecastWeatherBdg() });
  });
  cron.schedule('0 * * * *', async () => {
    await storeDataAQI();
  });
  cron.schedule('0 0 * * *', async () => {
    setTimeout(async () => {
      await storeDataWeather();
    }, 100000);
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
