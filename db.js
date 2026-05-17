const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "erp_esquadrias",
  password: "302714",
  port: 5432,
});

module.exports = pool;