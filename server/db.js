const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.SQLUSER,
  password: process.env.SQLPASS,
  server: process.env.SERVER,
  database: process.env.DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Initialiser poolPromise for bedre håndtering av tilkoblingen
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    return pool;
  })
  .catch(err => {
    console.error("Databaseforbindelse feilet:", err);
    process.exit(1);
  });

async function dcnDB() {
  try {
    await sql.close();
  } catch (error) {
    console.error("Feil ved lukking av database:", error);
  }
}

module.exports = { sql, poolPromise, dcnDB };


