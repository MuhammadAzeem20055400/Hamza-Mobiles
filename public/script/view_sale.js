
    
    if (!localStorage.getItem('token')) {
      window.location.href = '/index.html'; 
    }
  
    let productCache = {};
    let customerCache = {};
    let salesData = [];
    let currentSortColumn = null;
    let sortDirection = 1; 
  
    
    async function fetchWithAuth(url) {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/index.html';
        throw new Error('No authentication token');
      }
  
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      return response.json();
    }
  
    
    async function fetchProducts() {
      try {
        const products = await fetchWithAuth('/products');
        products.forEach(product => {
          productCache[product.id] = product.name;
        });
      } catch (error) {
        console.error("Error loading products:", error);
        showNotification("Error loading products", "error");
      }
    }
  
    
    async function fetchCustomers() {
      try {
        const customers = await fetchWithAuth('/customers');
        customers.forEach(customer => {
          customerCache[customer.id] = customer.name;
        });
      } catch (error) {
        console.error("Error loading customers:", error);
        showNotification("Error loading customers", "error");
      }
    }
  
    
    async function loadSales() {
      try {
        
        await Promise.all([fetchProducts(), fetchCustomers()]);
  
        const sales = await fetchWithAuth('/sales');
        salesData = sales; 
        displaySales(sales);
        
        showNotification("Sales data loaded successfully", "success");
      } catch (error) {
        console.error("Error loading sales:", error);
        showNotification("Error loading sales data", "error");
        const tbody = document.querySelector('#salesTable tbody');
        tbody.innerHTML = `<tr><td colspan="6">Failed to load sales data. Please try again.</td></tr>`;
      }
    }
  
    
    function displaySales(sales) {
      const tbody = document.querySelector('#salesTable tbody');
      tbody.innerHTML = '';
  
      sales.forEach(sale => {
        const date = new Date(sale.purchase_date);
        const formattedDate = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${sale.id}</td>
          <td>${productCache[sale.product_id] || 'Unknown Product'}</td>
          <td>${customerCache[sale.customer_id] || 'Unknown Customer'}</td>
          <td>${sale.quantity}</td>
          <td>$${parseFloat(sale.total_amount).toFixed(2)}</td>
          <td>${formattedDate}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  
    
    function sortSales(columnIndex) {
      const columns = ['id', 'product_id', 'customer_id', 'quantity', 'total_amount', 'purchase_date'];
      const columnKey = columns[columnIndex];
      
      
      if (currentSortColumn === columnIndex) {
        sortDirection *= -1;
      } else {
        currentSortColumn = columnIndex;
        sortDirection = 1;
      }
  
      salesData.sort((a, b) => {
        let valA, valB;
        
        
        if (columnKey === 'product_id') {
          valA = productCache[a.product_id] || '';
          valB = productCache[b.product_id] || '';
        } else if (columnKey === 'customer_id') {
          valA = customerCache[a.customer_id] || '';
          valB = customerCache[b.customer_id] || '';
        } else {
          valA = a[columnKey];
          valB = b[columnKey];
        }
  
        
        if (typeof valA === 'string') {
          return valA.localeCompare(valB) * sortDirection;
        } else if (columnKey === 'purchase_date') {
          return (new Date(valA) - new Date(valB)) * sortDirection;
        } else {
          return (valA - valB) * sortDirection;
        }
      });
  
      displaySales(salesData);
      updateSortIcons(columnIndex);
    }
  
    
    function updateSortIcons(columnIndex) {
      const headers = document.querySelectorAll('#salesTable th i');
      headers.forEach((icon, index) => {
        icon.className = 'fas fa-sort';
        if (index === columnIndex) {
          icon.className = sortDirection === 1 ? 'fas fa-sort-up' : 'fas fa-sort-down';
        }
      });
    }
  
    
    function showNotification(message, type = "success") {
      const notification = document.getElementById('notification');
      const icon = notification.querySelector('i');
      const messageSpan = document.getElementById('notificationMessage');
      
      messageSpan.textContent = message;
      notification.style.backgroundColor = type === "error" ? '#dc3545' : '#28a745';
      icon.className = type === "error" ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
      
      notification.classList.add('show');
      setTimeout(() => notification.classList.remove('show'), 3000);
    }
  
    
    function initSortableHeaders() {
      const headers = document.querySelectorAll('#salesTable th');
      headers.forEach((header, index) => {
        header.addEventListener('click', () => sortSales(index));
      });
    }
  
    
    document.addEventListener('DOMContentLoaded', () => {
      initSortableHeaders();
      loadSales();
    });
  