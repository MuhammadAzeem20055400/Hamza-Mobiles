
    
if (!localStorage.getItem('token')) {
  window.location.href = '/index.html'; 
}


let productCache = {};
let customerCache = {};

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
    return true;
  } catch (error) {
    console.error("Error loading products:", error);
    showError("Failed to load products");
    return false;
  }
}

async function fetchCustomers() {
  try {
    const customers = await fetchWithAuth('/customers');
    customers.forEach(customer => {
      customerCache[customer.id] = customer.name;
    });
    return true;
  } catch (error) {
    console.error("Error loading customers:", error);
    showError("Failed to load customers");
    return false;
  }
}

function showError(message) {
  const tbody = document.querySelector('#recentSalesTable tbody');
  tbody.innerHTML = `<tr><td colspan="6" class="error-message">${message}</td></tr>`;
}

let salesData = []; 

async function loadRecentSales() {
try {
// Wait for both products and customers to load first
const [productsLoaded, customersLoaded] = await Promise.all([
  fetchProducts(),
  fetchCustomers()
]);

if (!productsLoaded || !customersLoaded) {
  return;
}


salesData = await fetchWithAuth('/sales');
salesData.sort((a, b) => b.id - a.id);
const recent = salesData.slice(0, 10);
const tbody = document.querySelector('#recentSalesTable tbody');
tbody.innerHTML = '';

recent.forEach(sale => {
  const tr = document.createElement('tr');
  const formattedDate = new Date(sale.purchase_date).toLocaleDateString();
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
} catch (error) {
console.error("Error loading recent sales:", error);
showError("Failed to load sales data");
}
}

// Export to PDF function
function exportToPDF() {
const { jsPDF } = window.jspdf;
const doc = new jsPDF();

doc.text("Sales Report", 20, 10);

const headers = [['ID', 'Product', 'Customer', 'Quantity', 'Total Amount', 'Purchase Date']];
const rows = salesData.map(sale => [
sale.id,
productCache[sale.product_id] || 'Unknown Product',
customerCache[sale.customer_id] || 'Unknown Customer',
sale.quantity,
`$${parseFloat(sale.total_amount).toFixed(2)}`,
new Date(sale.purchase_date).toLocaleDateString()
]);


doc.autoTable({
head: headers,
body: rows,
startY: 20
});

doc.save('sales_report.pdf');
}

// Export to Excel function
function exportToExcel() {
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet([
['ID', 'Product', 'Customer', 'Quantity', 'Total Amount', 'Purchase Date'],
...salesData.map(sale => [
  sale.id,
  productCache[sale.product_id] || 'Unknown Product',
  customerCache[sale.customer_id] || 'Unknown Customer',
  sale.quantity,
  `$${parseFloat(sale.total_amount).toFixed(2)}`,
  new Date(sale.purchase_date).toLocaleDateString()
])
]);

XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');
XLSX.writeFile(wb, 'sales_report.xlsx');
}


// Filter by Date function
function filterByDate() {
const startDate = document.getElementById('startDate').value;
const endDate = document.getElementById('endDate').value;

if (!startDate || !endDate) {
alert("Please select both start and end dates.");
return;
}


const start = new Date(startDate);
const end = new Date(endDate);


end.setHours(23, 59, 59, 999);

const filteredSales = salesData.filter(sale => {
const saleDate = new Date(sale.purchase_date);
return saleDate >= start && saleDate <= end;
});

if (filteredSales.length === 0) {
alert("No sales found for the selected date range.");
return;
}

displaySales(filteredSales);
}

function resetFilters() {
document.getElementById('startDate').value = '';
document.getElementById('endDate').value = '';
displaySales(salesData.slice(0, 10)); 
}

function displaySales(filteredSales) {
const tbody = document.querySelector('#recentSalesTable tbody');
tbody.innerHTML = '';

filteredSales.forEach(sale => {
const tr = document.createElement('tr');
const formattedDate = new Date(sale.purchase_date).toLocaleDateString();
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

loadRecentSales();
