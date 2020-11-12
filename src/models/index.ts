import Sequelize from 'sequelize';
import mysql2 from 'mysql2'; // Needed to fix sequelize issues with WebPack
import user from './user';
import post from './post';
import follower from './follower';

let sequelize = null
let db = null
async function loadSequelize() {
  const config = {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    dialectModule: mysql2, // Needed to fix sequelize issues with WebPack

    pool: {
      max: 10,
      min: 0,
      acquire: 2000,
      idle: 0,
      evict: 29000,
    },
  }
  const sequelize = new Sequelize(config.database, config.username, config.password, config);

  await sequelize.authenticate()

  return sequelize;
}





 async function myDB() {
  // re-use the sequelize instance across invocations to improve performance
  if (!sequelize) {
    sequelize = await loadSequelize();
    db = {
      User: user(sequelize, Sequelize),
      Post: post(sequelize, Sequelize),
      Follower: follower(sequelize, Sequelize),
    };
  
    Object.keys(db).forEach(modelName => {
      if (db[modelName].associate) {
        db[modelName].associate(db);
      }
    });
    db.sequelize = sequelize;
  } else {
    console.log('re-use the sequelize instance')
    
    // restart connection pool to ensure connections are not re-used across invocations
    sequelize.connectionManager.initPools();

    // restore `getConnection()` if it has been overwritten by `close()`
    if (sequelize.connectionManager.hasOwnProperty("getConnection")) {
      delete sequelize.connectionManager.getConnection;
    }
  }
 

 
   return db

};

export default myDB
