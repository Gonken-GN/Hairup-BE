import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import * as dotenv from 'dotenv';

dotenv.config();
const init = () => {
  const server = express();
  server.listen(process.env.PORT, () => {
    console.log(`Serving on port ${process.env.PORT}`);
  });
};

init();
