const inquirer = require('inquirer');
const mysql = require('mysql');
const asTable = require ('as-table').configure ({ delimiter: ' | ' });
const isNumber = require('is-number');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'bamazon'
});
