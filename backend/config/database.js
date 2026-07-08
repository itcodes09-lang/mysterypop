const { Sequelize } = require('sequelize');
const path = require('node:path');

// Load environment variables with override: true so that local .env overrides default container environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), override: true });

let sequelize;

if (process.env.USE_SQLITE === 'true' || process.env.DB_DIALECT === 'sqlite') {
  console.log('Using SQLite database...');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.resolve(__dirname, 'database.sqlite'),
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  });
} else {
  console.log(`Using MySQL database at ${process.env.DB_HOST || '127.0.0.1'}...`);
  sequelize = new Sequelize(
    process.env.DB_NAME || 'mysterypop',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      define: {
        timestamps: true,
        underscored: true
      }
    }
  );
}

module.exports = { sequelize };


