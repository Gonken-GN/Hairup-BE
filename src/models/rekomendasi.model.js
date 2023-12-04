import { DataTypes } from 'sequelize';
import db from '../config/db.config.js';
import User from './user.model.js';

const Rekomendasi = db.define('Rekomendasi', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
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
  umur: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  riwayatPenyakit: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, { freezeTableName: true });

// Define the relationship
Rekomendasi.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
// Defining the relationship
User.hasMany(Rekomendasi, { foreignKey: 'userId', onDelete: 'CASCADE' });
export default Rekomendasi;
