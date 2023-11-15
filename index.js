import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import userRouter from './src/routes/user.route.js';

dotenv.config();
const init = () => {
  const server = express();
  server.use(bodyParser.json());
  server.use(cors());
  server.use('/user', userRouter);
  //   Server initialization
  server.listen(process.env.PORT, () => {
    console.log(`Serving on port ${process.env.PORT}`);
  });
};

init();
