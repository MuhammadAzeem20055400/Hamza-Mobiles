const mysql = require('mysql2');

// Creating a connection
const pool = mysql.createPool({
  host: 'localhost',        
  user: 'root',   
  password: '', 
  database: 'mobile_retail_store'
});


module.exports = pool.promise();
