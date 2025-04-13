// test/customers.test.js
const request = require('supertest');
const app = require('../app');
const { expect } = require('chai');

describe('Customers API', function() {
  let createdCustomerId = null;
  let authToken = null;

  
  before(async function() {
    // First, register a test user if needed
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

  // Test for creating a new customer
  it('should create a new customer', async function() {
    const customer = {
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '1234567890'
    };

    const res = await request(app)
      .post('/customers')
      .set('Authorization', `Bearer ${authToken}`)
      .send(customer)
      .expect(200);

    expect(res.body).to.have.property('id');
    createdCustomerId = res.body.id;
  });

  // Test for retrieving customers list
  it('should retrieve the list of customers', async function() {
    const res = await request(app)
      .get('/customers')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body).to.be.an('array');
    const customer = res.body.find(c => c.id === createdCustomerId);
    expect(customer).to.exist;
  });

  // Test for updating an existing customer
  it('should update an existing customer', async function() {
    const updatedData = {
      name: 'Updated Test Customer',
      email: 'updated@example.com',
      phone: '0987654321'
    };

    const res = await request(app)
      .put(`/customers/${createdCustomerId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedData)
      .expect(200);

    expect(Number(res.body.updatedID)).to.equal(createdCustomerId);
  });

  // Test for deleting a customer
  it('should delete a customer', async function() {
    const res = await request(app)
      .delete(`/customers/${createdCustomerId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Number(res.body.deletedID)).to.equal(createdCustomerId);
  });
});