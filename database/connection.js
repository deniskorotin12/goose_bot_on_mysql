const mysql = require('mysql');
const connection_data = require('./connection_data');
module.exports = mysql.createConnection({
    host: connection_data.host,
    user: connection_data.user,
    password: connection_data.password,
    database: connection_data.database
});