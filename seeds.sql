USE bamazon;

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Record Player", "Music", 200.00, 10),
  ("Football", "Sports", 10.00, 100);

SELECT * FROM products;
