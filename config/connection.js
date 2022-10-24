const mysql = require('mysql2');

require('dotenv').config();

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: "$3cret1!",
    database: 'company'
       
},
    console.log('Connected to the Employee Database. '));

module.exports = connection;