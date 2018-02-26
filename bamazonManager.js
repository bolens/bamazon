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

let productTotal = 0;
let itemQuantity = 0;

connection.connect(function(err) {
  if (err) throw err;
  // console.log('Connected!');

  // Get total number of products
  getProductTotal();
  // Prompt user what to do
  managerPrompt();
});

function managerPrompt() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'What would you like to do today?',
      choices: [
        'View Products for Sale', 'View Low Inventory',
        'Add to Inventory', 'Add New Product', 'Exit'
      ]
    }
  ]).then(function(res) {
    switch (res.choice) {
      case 'View Products for Sale':
        displayProducts();
        break;
      case 'View Low Inventory':
        displayLowInventory();
        break;
      case 'Add to Inventory':
        updateInventory();
        break;
      case 'Add New Product':
        newProduct();
        break;
      case 'Exit':
        console.log('Thanks for stopping by today!\n');
        disconnect();
        break;
    }
  });
}

// Function to display all products in the database
function displayProducts() {
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
    console.log('Products:\n' + asTable (itemArr) + '\n');
    managerPrompt();
  });
}

// Function to display items with an inventory amount of 5 or less
function displayLowInventory() {
  connection.query("SELECT * FROM products WHERE stock_quantity <= 5", function(err, res) {
    if (err) throw err;
    let itemArr = [];
    res.forEach(function(curr, index) {
      itemArr.push(
        { id: curr.item_id, department: curr.department_name,
          product: curr.product_name, price: '$' + curr.price.toFixed(2),
          quantity: curr.stock_quantity }
      );
    });
    if (itemArr.length < 1) {
      console.log('There are no items with low inventory at this time.\n');
    } else {
      console.log('Products:\n' + asTable (itemArr) + '\n');
    }
    managerPrompt();
  });
}

// Function to add to product inventory
function updateInventory() {
  inquirer.prompt([
    {
      name: "id",
      type: "input",
      message: "Which item would you like to update?",
      validate: function(id) {
        if (isNumber(id) && validateId(parseInt(id))) {
          return true;
        } else {
          return false;
        }
      }
    },
    {
      name: "quant",
      type: "input",
      message: "How many would you like to add?",
      validate: function(quant) {
        if (isNumber(quant) && quant > 0) {
          return true;
        } else {
          return false;
        }
      }
    }
  ]).then(function(res) {
    console.log('Added ' + res.quant + ' items to product number ' + res.id + '!\n');
    updateItemQuantity(res.id, parseInt(res.quant));
    managerPrompt();
  });
}

// Function to add a new product
function newProduct() {
  inquirer.prompt([
    {
      name: "name",
      type: "input",
      message: "What is the name of the product you would like to add?",
    },
    {
      name: "dept",
      type: "input",
      message: "What department does the product belong to?",
    },
    {
      name: "price",
      type: "input",
      message: "What is price of the product?",
      validate: function(price) {
        if (isNumber(price) && price > 0) {
          return true;
        } else {
          return false;
        }
      }
    },
    {
      name: "quant",
      type: "input",
      message: "What is initial quantity of the product?",
      validate: function(quant) {
        if (isNumber(quant) && quant > 0) {
          return true;
        } else {
          return false;
        }
      }
    },
  ]).then(function(res) {
    console.log('Added ' + res.quant + ' ' + res.name + '(s) priced at $' + parseInt(res.price).toFixed(2) + '\n');
    addProduct(res.name, res.dept, res.price, res.quant);
    managerPrompt();
  });
}

// Function to get the number of products available
function getProductTotal() {
  connection.query("SELECT item_id FROM products", function(err, res) {
    if (err) throw err;
    productTotal =  res[res.length-1].item_id;
    // console.log(productTotal);
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

// Function to update the quantity of the selected item
function updateItemQuantity(id, quant) {
  connection.query("SELECT item_id, stock_quantity FROM products WHERE ?", {item_id: id}, function(err, res) {
    if (err) throw err;
    itemQuantity =  res[0].stock_quantity;
    itemQuantity += quant;
    // console.log(itemQuantity);
    connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity: itemQuantity}, {item_id: id}], function (err, result) {
      if (err) throw err;
      // console.log(result.affectedRows + " record(s) updated");
    });
  });
}

function addProduct(name, dept, price, quant) {
  connection.query("INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?)", [name, dept, price, quant], function (err, result) {
    if (err) throw err;
    // console.log(result.affectedRows + " record(s) updated");
  });
}

// Function to terminate MySQL connection
function disconnect() {
  connection.end();
}
