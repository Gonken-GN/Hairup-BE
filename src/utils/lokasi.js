import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();
async function getProvinsi() {
  const response = await axios.get(`${process.env.LOKASI_INDONESIA_URL}/provinces.json`);
  return response.data;
}
async function getKabKot(provId) {
  const response = await axios.get(
    `${process.env.LOKASI_INDONESIA_URL}/regencies/${provId}.json`,
  );
  return response.data;
}
async function getKec(regencyId) {
  const response = await axios.get(
    `${process.env.LOKASI_INDONESIA_URL}/districts/${regencyId}.json`,
  );
  return response.data;
}
async function getKel(villagesId) {
  const response = await axios.get(
    `${process.env.LOKASI_INDONESIA_URL}/villages/${villagesId}.json`,
  );
  return response.data;
}

async function getCoordinates(address) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_API_KEY}`;

  try {
    const response = await axios.get(url);
    const { data } = response;

    if (data.status === 'OK') {
      const { location } = data.results[0].geometry;
      return location; // { lat: ..., lng: ... }
    }
    throw new Error(data.status);
  } catch (error) {
    console.error('Error during geocoding:', error);
    return null;
  }
}

export {
  getProvinsi, getKabKot, getKec, getKel, getCoordinates,
};
