
    
    if (!localStorage.getItem('token')) {
      window.location.href = '/index.html'; // Redirect to login page
    }

    
    function logout() {
      localStorage.removeItem('token'); 
      window.location.href = '/index.html'; 
    }

    async function loadRecentProducts() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/index.html';
          return;
        }

        const response = await fetch('/products', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        
        if (!response.ok) {
          
          const errorText = await response.text();
          console.error("Server responded with:", errorText);

          
          if (response.status === 401) {
            window.location.href = '/index.html';
            return;
          }

          throw new Error(`HTTP error! status: ${response.status}`);
        }

        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const responseData = await response.text();
          console.error("Received non-JSON response:", responseData);
          throw new Error("Server didn't return JSON");
        }

        const products = await response.json();

        products.sort((a, b) => b.id - a.id);
        const recent = products.slice(0, 5);
        const tbody = document.querySelector('#recentProductsTable tbody');
        tbody.innerHTML = '';
        recent.forEach(product => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${product.id}</td>
                      <td>${product.name}</td>
                      <td>${product.category}</td>
                      <td>${product.price}</td>
                      <td>${product.stock_quantity}</td>`;
          tbody.appendChild(tr);
        });
      } catch (error) {
        console.error("Error loading recent products:", error);
        const tbody = document.querySelector('#recentProductsTable tbody');
        tbody.innerHTML = `<tr><td colspan="5">Error loading products: ${error.message}</td></tr>`;
      }
    }
    async function loadRecentCustomers() {
      try {
        const response = await fetch('/customers', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const customers = await response.json();

        customers.sort((a, b) => b.id - a.id);
        const recent = customers.slice(0, 5);
        const tbody = document.querySelector('#recentCustomersTable tbody');
        tbody.innerHTML = '';
        recent.forEach(customer => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${customer.id}</td>
                          <td>${customer.name}</td>
                          <td>${customer.email}</td>
                          <td>${customer.phone || ''}</td>`;
          tbody.appendChild(tr);
        });
      } catch (error) {
        console.error("Error loading recent customers:", error);
        const tbody = document.querySelector('#recentCustomersTable tbody');
        tbody.innerHTML = `<tr><td colspan="4">Error loading customers</td></tr>`;
      }
    }

    
    loadRecentProducts();
    loadRecentCustomers();
  