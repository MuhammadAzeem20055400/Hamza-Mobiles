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

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

module.exports = app;
