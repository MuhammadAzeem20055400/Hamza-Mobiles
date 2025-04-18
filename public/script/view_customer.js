
    
if (!localStorage.getItem('token')) {
  window.location.href = '/index.html'; 
}

let customers = [];
let sortDirection = [null, null, null, null];

async function loadCustomers() {
  try {
    
    const token = localStorage.getItem('token');

    
    if (!token) {
      window.location.href = '/index.html'; 
      return;
    }

    
    const response = await fetch('/customers', {
      headers: {
        'Authorization': `Bearer ${token}` // Added the token in the Authorization header
      }
    });

    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error loading customers:", errorData);
      return;
    }

    
    customers = await response.json();
    displayCustomers(customers); 
  } catch (error) {
    console.error("Error loading customers:", error);
  }
}

function displayCustomers(customersToDisplay) {
  const tbody = document.getElementById('customerTable').querySelector('tbody');
  tbody.innerHTML = '';
  customersToDisplay.forEach(customer => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${customer.id}</td>
      <td>${customer.name}</td>
      <td>${customer.email}</td>
      <td>${customer.phone}</td>
      <td>
        <button onclick="window.location.href='edit_customer.html?id=${customer.id}'">Edit</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  
  const notification = document.getElementById('notification');
  notification.style.backgroundColor = 'var(--success)';
  document.getElementById('notificationMessage').textContent = 'Customer list updated!';
  notification.classList.add('show');
  setTimeout(() => notification.classList.remove('show'), 3000);
}

function searchCustomers() {
  const searchQuery = document.getElementById('searchCustomer').value.toLowerCase();
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery) ||
    customer.email.toLowerCase().includes(searchQuery)
  );
  displayCustomers(filteredCustomers);
}

function sortCustomerTable(columnIndex) {
  sortDirection = sortDirection.map((dir, index) => index === columnIndex ? dir : null);
  sortDirection[columnIndex] = sortDirection[columnIndex] === false ? true : false;

  const sortedCustomers = [...customers].sort((a, b) => {
    let valA, valB;
    switch (columnIndex) {
      case 0: valA = a.id; valB = b.id; break;
      case 1: valA = a.name; valB = b.name; break;
      case 2: valA = a.email; valB = b.email; break;
      case 3: valA = a.phone; valB = b.phone; break;
      default: valA = a.id; valB = b.id;
    }

    if (typeof valA === "string") {
      return sortDirection[columnIndex] ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else {
      return sortDirection[columnIndex] ? valA - valB : valB - valA;
    }
  });

  updateSortingIcons(columnIndex);
  displayCustomers(sortedCustomers);
}

function updateSortingIcons(columnIndex) {
  const headers = document.querySelectorAll('th i');
  headers.forEach((icon, index) => {
    if (index === columnIndex) {
      icon.classList.remove('fa-sort', 'fa-sort-up', 'fa-sort-down');
      icon.classList.add(sortDirection[columnIndex] ? 'fa-sort-up' : 'fa-sort-down');
    } else {
      icon.classList.remove('fa-sort-up', 'fa-sort-down');
      icon.classList.add('fa-sort');
    }
  });
}

loadCustomers();
