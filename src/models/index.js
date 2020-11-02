'use strict';

import fs  from 'fs';
import path, { dirname }  from 'path';
import Sequelize  from 'sequelize';
import mysql2 from 'mysql2'; // Needed to fix sequelize issues with WebPack


const config = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  dialectModule: mysql2, // Needed to fix sequelize issues with WebPack

  pool: {
    max: 2,
    min: 0,
    acquire: 2000, 
    idle: 300,
    evict: 15000
  },
};
  
  
let sequelize = new Sequelize(config.database, config.username, config.password, config);

import user from './user'
import post from './post'
import follower from './follower';
const db = {
  User: user(sequelize,Sequelize),
  Post: post(sequelize,Sequelize),
  Follower: follower(sequelize,Sequelize),
}

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
