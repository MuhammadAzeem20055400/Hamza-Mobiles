const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// -------------------- PRODUCTS API --------------------

// GET /products
app.get('/products', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /products
app.post('/products', async (req, res) => {
  const { name, category, price, stock_quantity } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO products (name, category, price, stock_quantity) VALUES (?, ?, ?, ?)',
      [name, category, price, stock_quantity]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /products/:id
app.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category, price, stock_quantity } = req.body;
  try {
    await db.query(
      'UPDATE products SET name = ?, category = ?, price = ?, stock_quantity = ? WHERE id = ?',
      [name, category, price, stock_quantity, id]
    );
    res.json({ updatedID: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /products/:id
app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ deletedID: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- CUSTOMERS API --------------------

// GET /customers
app.get('/customers', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customers');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /customers 
app.post('/customers', async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)',
      [name, email, phone]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /customers/:id 
app.put('/customers/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  try {
    await db.query(
      'UPDATE customers SET name = ?, email = ?, phone = ? WHERE id = ?',
      [name, email, phone, id]
    );
    res.json({ updatedID: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /customers/:id
app.delete('/customers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM customers WHERE id = ?', [id]);
    res.json({ deletedID: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- SALES API --------------------

// GET /sales
app.get('/sales', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM sales');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /sales
app.post('/sales', async (req, res) => {
  const { product_id, customer_id, quantity, total_amount, purchase_date } = req.body;
  let connection;
  try {
    
    const saleQuantity = parseInt(quantity, 10);

    
    connection = await db.getConnection();
    await connection.beginTransaction();

    
    const [productRows] = await connection.query(
      'SELECT stock_quantity FROM products WHERE id = ?',
      [product_id]
    );
    if (productRows.length === 0) {
      throw new Error("Product not found");
    }
    const currentStock = productRows[0].stock_quantity;
    if (currentStock < saleQuantity) {
      throw new Error("Insufficient stock");
    }

    
    const [updateResult] = await connection.query(
      'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
      [saleQuantity, product_id]
    );
    console.log(`Update result:`, updateResult);
    if (updateResult.affectedRows === 0) {
      throw new Error("Failed to update product stock");
    }

    
    const [result] = await connection.query(
      'INSERT INTO sales (product_id, customer_id, quantity, total_amount, purchase_date) VALUES (?, ?, ?, ?, ?)',
      [product_id, customer_id, saleQuantity, total_amount, purchase_date]
    );

    
    await connection.commit();

    console.log(`Sale added. Updated stock for product ${product_id} should be ${currentStock - saleQuantity}`);
    res.json({ id: result.insertId });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// PUT /sales/:id
app.put('/sales/:id', async (req, res) => {
  const { id } = req.params;
  const { product_id, customer_id, quantity, total_amount, purchase_date } = req.body;
  try {
    await db.query(
      'UPDATE sales SET product_id = ?, customer_id = ?, quantity = ?, total_amount = ?, purchase_date = ? WHERE id = ?',
      [product_id, customer_id, quantity, total_amount, purchase_date, id]
    );
    res.json({ updatedID: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /sales/:id
app.delete('/sales/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM sales WHERE id = ?', [id]);
    res.json({ deletedID: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

module.exports = app;
