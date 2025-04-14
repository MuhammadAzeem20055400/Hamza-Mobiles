# Mobile Retail Store Information System
This project is a proof-of-concept Information System developed for the **Hamza Mobile**.  It is designed for a small mobile retail store (Hamza Mobile, Vivo official store) and demonstrates core CRUD functionality along with an API-driven architecture.

## Overview

The system manages:
- **Products:** Manage inventory details such as product name, category, price, and stock quantity.
- **Customers:** Manage customer details including name, email, and phone number.
- **Sales Transactions:** Record sales with product, customer, quantity, total amount, and purchase date.

The application uses a Node.js/Express backend connected to a MySQL database and a simple HTML/JavaScript frontend that communicates via RESTful API endpoints.

## Features

- **CRUD Operations:**  
  - **Products:** Create, read, update, and delete product records.
  - **Customers:** Create, read, update, and delete customer records.
  - **Sales:** Create, read, update, and delete sales transactions.
- **Dashboard:**  
  - Displays the five most recent products and customers.
- **Separate Pages:**  
  - Dedicated pages for adding, viewing, and editing products and customers.
- **API-Driven Architecture:**  
  - The frontend interacts with the backend exclusively via API calls (using the Fetch API).
- **Testing:**  
  - Unit and integration tests can be run using Mocha, Chai, and Supertest (optional).

## Technologies Used

- **Backend:** Node.js, Express, MySQL, mysql2
- **Frontend:** HTML, CSS, JavaScript (Fetch API)
- **Testing:** Mocha, Chai, Supertest (optional)

## Prerequisites

Before you begin, ensure that the following installed on the machine:

1. **Node.js and npm:**  
   If you don't have Node.js and npm installed, follow these steps:
   - **Download and Install:**  
     Visit the [Node.js official website](https://nodejs.org/) and download .
   - **Verify Installation:**  
     After installing, open terminal or command prompt and run:
     ```bash
     node -v
     npm -v
     ```
     You should see version numbers for both Node.js and npm.
  
2. **MySQL Server:**  
   
   - Ensure your MySQL server is running.


## Setup Instructions

### 1. Database Setup

Log in to MySQL client and run the following SQL commands:

```sql
CREATE DATABASE mobile_retail_store;
and import the mobile_retail_store.sql

3. Install Dependencies

npm install

Open the file db.js and update it with your MySQL credentials

Start the Server

node app.js

npx mocha test/customers.test.js
for tests
