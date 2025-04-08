// test/products.test.js
const request = require('supertest');
const app = require('../app');
const { expect } = require('chai');

describe('Products API', function() {
  let createdProductId = null;

  // Test for creating a new product
  it('should create a new product', async function() {
    const product = {
      name: 'Test Product',
      category: 'Test Category',
      price: 9.99,
      stock_quantity: 100
    };

    const res = await request(app)
      .post('/products')
      .send(product)
      .expect(200);

    expect(res.body).to.have.property('id');
    createdProductId = res.body.id;
  });

  // Test for retrieving products list
  it('should retrieve the list of products', async function() {
    const res = await request(app)
      .get('/products')
      .expect(200);

    expect(res.body).to.be.an('array');
    const product = res.body.find(p => p.id === createdProductId);
    expect(product).to.exist;
  });

  // Test for updating an existing product
  it('should update an existing product', async function() {
    const updatedData = {
      name: 'Updated Test Product',
      category: 'Updated Category',
      price: 19.99,
      stock_quantity: 80
    };

    const res = await request(app)
      .put(`/products/${createdProductId}`)
      .send(updatedData)
      .expect(200);

    // req.params.id is a string, so we compare as numbers
    expect(Number(res.body.updatedID)).to.equal(createdProductId);
  });

  // Test for deleting a product
  it('should delete a product', async function() {
    const res = await request(app)
      .delete(`/products/${createdProductId}`)
      .expect(200);

    expect(Number(res.body.deletedID)).to.equal(createdProductId);
  });
});
