const inquirer = require('inquirer');
const mysql = require('mysql');
const asTable = require ('as-table').configure ({ delimiter: ' | ' });

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'bamazon'
});

let productTotal = 0;
let itemQuantity = 0;

connection.connect(function(err) {
  if (err) throw err;
  // console.log('Connected!');

  // Display the products to the customer
  displayProducts();
});

// Function to return the number of products
function updateProductTotal() {
  connection.query("SELECT item_id FROM products", function(err, res) {
    if (err) throw err;
    productTotal =  res[res.length-1].item_id;
    // console.log(productTotal);
  });
}

function updateItemQuantity(id) {
  connection.query("SELECT item_id, stock_quantity FROM products WHERE ?", {item_id: id}, function(err, res) {
    if (err) throw err;
    itemQuantity =  res[0].stock_quantity;
    // console.log(itemQuantity);
  });
}

// Function to return if an input ID is in the valid range of ID's
function validateId(id) {
  let isValid = false;
  if (id > 0 && id <= productTotal) {
    isValid = true;
  }
  // console.log(isValid);
  return isValid;
}

// Function to return if an input ID is in the valid range of ID's
function validateQuant(quant) {
  let isValid = false;
  if (quant > 0 && quant <= itemQuantity) {
    isValid = true;
  }
  if (!isValid && quant > itemQuantity) {
    console.log('\nInsufficient quantity!');
  }
  // console.log(isValid);
  return isValid;
}

// Function to prompt the customer for the ID of a product
function promptId() {
  inquirer.prompt([
    {
      name: "id",
      type: "input",
      message: "Which item would you like to select?",
      validate: function(id) {
        if (validateId(parseInt(id))) {
          return true;
        } else {
          return false;
        }
      }
    },
  ]).then(function(res) {
    // Get stock of item
    updateItemQuantity(res.id);
    // Prompt user for quantity of item
    promptQuantity(res.id);
  });
}

// Function to prompt the customer for the quantity they would like to buy
function promptQuantity(id) {
  inquirer.prompt([
    {
      name: "quantity",
      type: "input",
      message: "How many would you like to purchase?",
      validate: function(quant) {
        if (validateQuant(parseInt(quant))) {
          return true;
        } else {
          return false;
        }
      }
    },
  ]).then(function(res) {
    console.log('product id:', id, '\nquantity to buy:', res.quantity);
    disconnect();
  });
}

// Function to log a table of available products to the customer
function displayProducts() {
  updateProductTotal();

  console.log('Products:\n');
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    let itemArr = [];
    res.forEach(function(curr, index) {
      itemArr.push(
        { id: curr.item_id, department: curr.department_name,
          product: curr.product_name, price: '$' + curr.price.toFixed(2),
          quantity: curr.stock_quantity }
      );
    });
    console.log(asTable (itemArr) + '\n');

    // Prompt user for an item ID
    promptId();
  });
}

// Function to terminate MySQL connection
function disconnect() {
  connection.end();
}
