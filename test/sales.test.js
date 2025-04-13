// test/sales.test.js
const request = require('supertest');
const app = require('../app');
const { expect } = require('chai');

describe('Sales API', function() {
  let createdSaleId = null;
  let productId = null;
  let customerId = null;
  let authToken = null;

  before(async function() {
    // Register and login to get auth token
    await request(app)
      .post('/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpassword'
      });

    const loginRes = await request(app)
      .post('/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword'
      });

    authToken = loginRes.body.token;

    // Create a product for the sale
    const productRes = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Sale Test Product',
        category: 'Test Category',
        price: 50,
        stock_quantity: 10
      })
      .expect(200);
    productId = productRes.body.id;

    // Create a customer for the sale
    const customerRes = await request(app)
      .post('/customers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Sale Test Customer',
        email: 'sale@example.com',
        phone: '1112223333'
      })
      .expect(200);
    customerId = customerRes.body.id;
  });

  after(async function() {
    // Clean up test data
    if (createdSaleId) {
      await request(app)
        .delete(`/sales/${createdSaleId}`)
        .set('Authorization', `Bearer ${authToken}`);
    }
    await request(app)
      .delete(`/products/${productId}`)
      .set('Authorization', `Bearer ${authToken}`);
    await request(app)
      .delete(`/customers/${customerId}`)
      .set('Authorization', `Bearer ${authToken}`);
  });

  describe('Sale Creation', function() {
    it('should create a new sale', async function() {
      const sale = {
        product_id: productId,
        customer_id: customerId,
        quantity: 2,
        total_amount: 100,
        purchase_date: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };

      const res = await request(app)
        .post('/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sale)
        .expect(200);

      expect(res.body).to.have.property('id');
      createdSaleId = res.body.id;

      // Verify product stock was reduced
      const productRes = await request(app)
        .get(`/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(productRes.body.stock_quantity).to.equal(8); // 10 initial - 2 sold
    });

    it('should fail with insufficient stock', async function() {
      const sale = {
        product_id: productId,
        customer_id: customerId,
        quantity: 20, // More than available stock
        total_amount: 1000,
        purchase_date: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };

      const res = await request(app)
        .post('/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sale)
        .expect(500);

      expect(res.body.error).to.include('Insufficient stock');
    });
  });

  describe('Sale Retrieval', function() {
    it('should retrieve the list of sales', async function() {
      const res = await request(app)
        .get('/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).to.be.an('array');
      const sale = res.body.find(s => s.id === createdSaleId);
      expect(sale).to.exist;
      expect(sale.product_id).to.equal(productId);
      expect(sale.customer_id).to.equal(customerId);
      expect(sale.quantity).to.equal(2);
    });

    it('should retrieve a single sale', async function() {
      const res = await request(app)
        .get(`/sales/${createdSaleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.id).to.equal(createdSaleId);
      expect(res.body.product_id).to.equal(productId);
    });
  });

  describe('Sale Update', function() {
    it('should update an existing sale', async function() {
      const updatedSale = {
        product_id: productId,
        customer_id: customerId,
        quantity: 3, // Updated from 2 to 3
        total_amount: 150,
        purchase_date: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };

      const res = await request(app)
        .put(`/sales/${createdSaleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedSale)
        .expect(200);

      expect(Number(res.body.updatedID)).to.equal(createdSaleId);

      // Verify the update
      const getRes = await request(app)
        .get(`/sales/${createdSaleId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(getRes.body.quantity).to.equal(3);
    });
  });

  describe('Sale Deletion', function() {
    it('should delete a sale', async function() {
      const res = await request(app)
        .delete(`/sales/${createdSaleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Number(res.body.deletedID)).to.equal(createdSaleId);

      // Verify the sale is deleted
      await request(app)
        .get(`/sales/${createdSaleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});