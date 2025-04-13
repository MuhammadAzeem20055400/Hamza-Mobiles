const request = require('supertest');
const app = require('../app');
const { expect } = require('chai');

describe('Products API', function() {
  let createdProductId = null;
  let authToken = null;

  before(async function() {
    // First, register a test user
    await request(app)
      .post('/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpassword'
      });

    // Then log in to get a token
    const loginRes = await request(app)
      .post('/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword'
      });

    authToken = loginRes.body.token;
  });

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
      .set('Authorization', `Bearer ${authToken}`)
      .send(product)
      .expect(200);

    expect(res.body).to.have.property('id');
    createdProductId = res.body.id;
  });

  // Test for retrieving products list
  it('should retrieve the list of products', async function() {
    const res = await request(app)
      .get('/products')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body).to.be.an('array');
    const product = res.body.find(p => p.id === createdProductId);
    expect(product).to.exist;
    expect(product.name).to.equal('Test Product');
    expect(product.category).to.equal('Test Category');
    expect(parseFloat(product.price)).to.equal(9.99);
    expect(product.stock_quantity).to.equal(100);
  });

  
  // Test for deleting a product
  it('should delete a product', async function() {
    const res = await request(app)
      .delete(`/products/${createdProductId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Number(res.body.deletedID)).to.equal(createdProductId);

    // Verify the product is deleted
    await request(app)
      .get(`/products/${createdProductId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);  // Expecting 404 because the product is deleted
  });

  // Clean up test data after tests (if necessary)
  after(async function() {
    // You can optionally add code here to clean up test data in the database, 
    // if your application does not automatically handle this.
  });
});
