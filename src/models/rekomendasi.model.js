import { DataTypes } from 'sequelize';
import db from '../config/db.config.js';
import user from './user.model.js';

const rekomendasi = db.define('rekomendasi', {
  id: {
    type: DataTypes.STRING,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: user,
      key: 'id',
    },
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, { freezeTableName: true });

// Define the relationship
user.hasMany(rekomendasi, { foreignKey: 'userId' });
rekomendasi.belongsTo(user, { foreignKey: 'userId' });

export default rekomendasi;
