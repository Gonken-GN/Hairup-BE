import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
// import route
import userRouter from './src/routes/user.route.js';
import rekomendasiRouter from './src/routes/rekomendasi.route.js';

dotenv.config();
const init = () => {
  const server = express();
  server.use(bodyParser.json());
  server.use(cors());
  // Server routes
  server.use('/user', userRouter);
  server.use('/api', rekomendasiRouter);
  //   Server initialization
  server.listen(process.env.PORT || 8000, () => {
    console.log(`Serving on port ${process.env.PORT}`);
  });
  server.get('/', (req, res) => {
    res.json({ message: 'okas' });
  });
};

init();
