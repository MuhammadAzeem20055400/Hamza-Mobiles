
    
    if (!localStorage.getItem('token')) {
      window.location.href = '/index.html'; 
    }

    function getQueryParam(param) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    }

    const customerId = getQueryParam('id');
    if (!customerId) {
      alert("No customer ID provided in URL.");
    }

    async function loadCustomer() {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('/customers', {
          headers: {
            'Authorization': `Bearer ${token}` // Included token in the Authorization header
          }
        });
        
        if (!response.ok) {
          const result = await response.json();
          if (result.error === 'Unauthorized') {
            alert("You are not authorized to view this customer data. Please log in again.");
            window.location.href = '/index.html'; 
            return;
          }
          throw new Error('Failed to fetch customer data');
        }

        const customers = await response.json();
        const customer = customers.find(c => c.id == customerId);
        if (!customer) {
          alert("Customer not found.");
          return;
        }

        document.getElementById('cust_name').value = customer.name;
        document.getElementById('cust_email').value = customer.email;
        document.getElementById('cust_phone').value = customer.phone;
      } catch (error) {
        console.error("Error loading customer:", error);
        alert("Error loading customer. Please try again.");
      }
    }

    document.getElementById('editCustomerForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const data = {
        name: document.getElementById('cust_name').value,
        email: document.getElementById('cust_email').value,
        phone: document.getElementById('cust_phone').value
      };

      try {
        const token = localStorage.getItem('token');

        if (!token) {
          window.location.href = '/index.html'; 
          return;
        }

        const response = await fetch(`/customers/${customerId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('Failed to update customer');

        const result = await response.json();
        console.log('Customer updated:', result);

        
        const notification = document.getElementById('notification');
        notification.style.backgroundColor = 'var(--success)';
        document.getElementById('notificationMessage').textContent = 'Customer updated successfully!';
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), 3000);

        
        window.location.href = "view_customer.html";
      } catch (error) {
        console.error("Error updating customer:", error);

        
        const notification = document.getElementById('notification');
        notification.style.backgroundColor = 'var(--danger)';
        document.getElementById('notificationMessage').textContent = 'Error updating customer!';
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), 3000);
      }
    });

    loadCustomer();
  