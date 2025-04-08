// test/sales.test.js
const request = require('supertest');
const app = require('../app');
const { expect } = require('chai');

describe('Sales API', function() {
  let createdSaleId = null;
  let productId = null;
  let customerId = null;

  before(async function() {
    // Create a product for the sale
    const productRes = await request(app)
      .post('/products')
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
      .send({
        name: 'Sale Test Customer',
        email: 'sale@example.com',
        phone: '1112223333'
      })
      .expect(200);
    customerId = customerRes.body.id;
  });

  
  after(async function() {
    await request(app).delete(`/products/${productId}`);
    await request(app).delete(`/customers/${customerId}`);
  });

  // Test for creating a new sale
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
      .send(sale)
      .expect(200);

    expect(res.body).to.have.property('id');
    createdSaleId = res.body.id;
  });

  // Test for retrieving sales list
  it('should retrieve the list of sales', async function() {
    const res = await request(app)
      .get('/sales')
      .expect(200);

    expect(res.body).to.be.an('array');
    const sale = res.body.find(s => s.id === createdSaleId);
    expect(sale).to.exist;
  });

  // Test for updating an existing sale
  it('should update an existing sale', async function() {
    const updatedSale = {
      product_id: productId,
      customer_id: customerId,
      quantity: 3,
      total_amount: 150,
      purchase_date: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    const res = await request(app)
      .put(`/sales/${createdSaleId}`)
      .send(updatedSale)
      .expect(200);

    expect(Number(res.body.updatedID)).to.equal(createdSaleId);
  });

  // Test for deleting a sale
  it('should delete a sale', async function() {
    const res = await request(app)
      .delete(`/sales/${createdSaleId}`)
      .expect(200);

    expect(Number(res.body.deletedID)).to.equal(createdSaleId);
  });
});
