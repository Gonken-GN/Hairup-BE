import { DataTypes } from 'sequelize';
import db from '../config/db.config.js';

const user = db.define('users', {
  id: {
    type: DataTypes.STRING,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  nama: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 100],
    },
  },
  umur: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notEmpty: true,
      isInt: true,
    },
  },
  lokasi: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  skin_sensivity: {
    type: DataTypes.STRING,
  },
  sensivity: {
    type: DataTypes.ARRAY,
  },
}, { freezeTableName: true });

export default user;
