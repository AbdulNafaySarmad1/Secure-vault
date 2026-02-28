const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const File = sequelize.define('File', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  originalName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  storedName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  path: {
    type: DataTypes.STRING(500),
    allowNull: false
  }
}, {
  tableName: 'files',
  timestamps: true
});

module.exports = File;
