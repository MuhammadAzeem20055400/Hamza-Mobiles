

 
 if (!localStorage.getItem('token')) {
    window.location.href = '/index.html'; 
  }

    let products = [];
    let sortDirection = [null, null, null, null, null];

   async function loadProducts() {
  try {
    const token = localStorage.getItem('token'); 

    if (!token) {
      window.location.href = '/index.html'; 
      return;
    }

    
    const response = await fetch('/products', {
      headers: {
        'Authorization': `Bearer ${token}` // Included the token in the Authorization header
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error loading products:", errorData);
      return;
    }

    const data = await response.json();
    console.log('Response from /products:', data); 

    if (!Array.isArray(data)) {
      console.error('Products are not an array:', data);
      return; 
    }

    products = data; 
    displayProducts(products); // Display products

  } catch (error) {
    console.error("Error loading products:", error);
  }
}


function displayProducts(productsToDisplay) {
  if (!Array.isArray(productsToDisplay)) {
    console.error('Products are not an array:', productsToDisplay);
    return;
  }

  const tbody = document.getElementById('productTable').querySelector('tbody');
  tbody.innerHTML = '';

  productsToDisplay.forEach(product => {
    const totalPrice = product.price * product.stock_quantity;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${product.price}</td>
      <td>${product.stock_quantity}</td>
      <td>${totalPrice}</td>
      <td>
        <button onclick="window.location.href='edit_product.html?id=${product.id}'">Edit</button>
        <button onclick="deleteProduct(${product.id})">Delete</button> <!-- New Delete Button -->
      </td>
    `;
    tbody.appendChild(tr);
  });

  const notification = document.getElementById('notification');
  notification.style.backgroundColor = 'var(--success)';
  document.getElementById('notificationMessage').textContent = 'Product list updated!';
  notification.classList.add('show');
  setTimeout(() => notification.classList.remove('show'), 3000);
}


async function deleteProduct(productId) {
  const confirmation = confirm("Are you sure you want to delete this product?");
  if (!confirmation) return;

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/index.html'; 
      return;
    }

    // Send DELETE request
    const response = await fetch(`/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      // Refresh the product list after deletion
      alert("Product deleted successfully!");
      loadProducts();
    } else {
      const errorData = await response.json();
      alert("Error deleting product: " + errorData.error);
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    alert("Error deleting product");
  }
}

    function searchProducts() {
      const searchQuery = document.getElementById('searchProduct').value.toLowerCase();
      const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery) ||
        product.category.toLowerCase().includes(searchQuery) ||
        product.price.toString().includes(searchQuery)
      );
      displayProducts(filteredProducts);
    }

    function sortProductTable(columnIndex) {
      sortDirection = sortDirection.map((dir, index) => index === columnIndex ? dir : null);
      sortDirection[columnIndex] = sortDirection[columnIndex] === false ? true : false;

      const sortedProducts = [...products].sort((a, b) => {
        let valA, valB;
        switch (columnIndex) {
          case 0: valA = a.id; valB = b.id; break;
          case 1: valA = a.name; valB = b.name; break;
          case 2: valA = a.category; valB = b.category; break;
          case 3: valA = a.price; valB = b.price; break;
          case 4: valA = a.stock_quantity; valB = b.stock_quantity; break;
          default: valA = a.id; valB = b.id;
        }

        if (typeof valA === "string") {
          return sortDirection[columnIndex] ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
          return sortDirection[columnIndex] ? valA - valB : valB - valA;
        }
      });

      updateSortingIcons(columnIndex);
      displayProducts(sortedProducts);
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

    loadProducts();
  