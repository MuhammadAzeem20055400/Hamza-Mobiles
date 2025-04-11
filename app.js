const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const path = require('path');
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key';

app.use(bodyParser.json());
app.use(express.static('public'));

// -------------------- PRODUCTS API --------------------

// GET /products
app.get('/products', async (req, res) => {
// Middleware to protect routes
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// -------------------- AUTH --------------------

// REGISTER
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    res.status(201).json({ message: 'User registered successfully', userID: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(400).json({ error: 'User not found' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- PRODUCTS --------------------

app.get('/products', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /products
app.post('/products', async (req, res) => {
app.post('/products', authenticateToken, async (req, res) => {
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
app.put('/products/:id', authenticateToken, async (req, res) => {
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
app.delete('/products/:id', authenticateToken, async (req, res) => {
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
// -------------------- CUSTOMERS --------------------

app.get('/customers', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customers');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /customers 
app.post('/customers', async (req, res) => {
app.post('/customers', authenticateToken, async (req, res) => {
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
app.put('/customers/:id', authenticateToken, async (req, res) => {
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
app.delete('/customers/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM customers WHERE id = ?', [id]);
    res.json({ deletedID: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- SALES API --------------------
// -------------------- SALES --------------------

// GET /sales
app.get('/sales', async (req, res) => {
app.get('/sales', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM sales');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /sales
app.post('/sales', async (req, res) => {
app.post('/sales', authenticateToken, async (req, res) => {
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
    if (productRows.length === 0) throw new Error("Product not found");

    const currentStock = productRows[0].stock_quantity;
    if (currentStock < saleQuantity) {
      throw new Error("Insufficient stock");
    }
    if (currentStock < saleQuantity) throw new Error("Insufficient stock");

    
    const [updateResult] = await connection.query(
      'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
      [saleQuantity, product_id]
    );
    console.log(`Update result:`, updateResult);
    if (updateResult.affectedRows === 0) {
      throw new Error("Failed to update product stock");
    }
    if (updateResult.affectedRows === 0) throw new Error("Failed to update stock");

    
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
app.put('/sales/:id', authenticateToken, async (req, res) => {
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
app.delete('/sales/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM sales WHERE id = ?', [id]);
    res.json({ deletedID: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Start server
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

module.exports = app;
