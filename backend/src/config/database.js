require('dotenv').config();
const { Sequelize } = require('sequelize');

const config = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'greentech',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  define: {
    timestamps: false,
    underscored: true
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: false
  }
};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    define: config.define,
    logging: config.logging,
    pool: config.pool,
    dialectOptions: config.dialectOptions
  }
);

module.exports = sequelize; 