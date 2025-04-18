
    // Check for authentication token
    if (!localStorage.getItem('token')) {
      window.location.href = '/index.html'; 
    }
  
    
    async function loadProducts() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/products', {
          headers: {
            'Authorization': `Bearer ${token}`, 
          }
        });
  
        const products = await response.json();
  
        if (Array.isArray(products)) {
          const productSelect = document.getElementById('productSelect');
          productSelect.innerHTML = `<option value="">Select a product</option>`;
          products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            productSelect.appendChild(option);
          });
        } else {
          console.error('Expected an array of products, but got:', products);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      }
    }
  
    
    async function loadCustomers() {
      try {
        const token = localStorage.getItem('token'); 
        const response = await fetch('/customers', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
  
        const customers = await response.json();
  
        if (Array.isArray(customers)) {
          const customerSelect = document.getElementById('customerSelect');
          customerSelect.innerHTML = `<option value="">Select a customer</option>`;
          customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = customer.name;
            customerSelect.appendChild(option);
          });
        } else {
          console.error('Expected an array of customers, but got:', customers);
        }
      } catch (error) {
        console.error("Error loading customers:", error);
      }
    }
  
    
    async function submitSale(event) {
      event.preventDefault(); 
  
      
      const productId = document.getElementById('productSelect').value;
      const customerId = document.getElementById('customerSelect').value;
      const quantity = document.getElementById('quantity').value;
      const totalAmount = document.getElementById('total_amount').value;
      const purchaseDate = document.getElementById('purchase_date').value;
  
      if (!productId || !customerId || !quantity || !totalAmount || !purchaseDate) {
        alert('Please fill all fields');
        return;
      }
  
      const saleData = {
        product_id: productId,
        customer_id: customerId,
        quantity: quantity,
        total_amount: totalAmount,
        purchase_date: purchaseDate,
      };
  
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/sales', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(saleData),
        });
  
        if (response.ok) {
          
          const notification = document.getElementById('notification');
          notification.style.backgroundColor = 'var(--success)';
          document.getElementById('notificationMessage').textContent = 'Sale added successfully!';
          notification.classList.add('show');
          setTimeout(() => notification.classList.remove('show'), 3000);
  
          
          document.getElementById('salesForm').reset();
        } else {
          
          const error = await response.json();
          console.error(error.message);
        }
      } catch (error) {
        console.error('Error adding sale:', error);
      }
    }
  
    
    document.getElementById('salesForm').addEventListener('submit', submitSale);
  
    
    loadProducts();
    loadCustomers();
  