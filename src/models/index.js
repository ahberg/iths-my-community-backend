'use strict';

import fs  from 'fs';
import path, { dirname }  from 'path';
import Sequelize  from 'sequelize';
import mysql2 from 'mysql2'; // Needed to fix sequelize issues with WebPack


const basename = path.basename(__filename);

const config = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  dialectModule: mysql2, // Needed to fix sequelize issues with WebPack
  dialectOptions: {
    connectTimeout: 60000
  },
  pool: {
    max: 2,
    min: 0,
    acquire: 120000, // This needs to be fairly high to account for a serverless db spinup
    idle: 120000,
    evict: 120000
  },
};

//const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}


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
