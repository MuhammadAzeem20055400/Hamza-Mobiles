
    
    function getQueryParam(param) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    }

    const productId = getQueryParam('id');
    if (!productId) {
      showNotification("No product ID provided in URL.", "error");
    }

    async function loadProduct() {
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const products = await response.json();
    
    
    if (!Array.isArray(products)) {
      throw new Error('Expected array of products but got:', products);
    }

    const product = products.find(p => p.id == productId);
    if (!product) {
      showNotification("Product not found.", "error");
      return;
    }
    
    document.getElementById('name').value = product.name;
    document.getElementById('category').value = product.category;
    document.getElementById('price').value = product.price;
    document.getElementById('stock_quantity').value = product.stock_quantity;
  } catch (error) {
    console.error("Error loading product:", error);
    showNotification("Error loading product: " + error.message, "error");
  }
}
    function showNotification(message, type = "success") {
      const notification = document.getElementById('notification');
      notification.textContent = message;
      
      if (type === "error") {
        notification.style.backgroundColor = "#ff3333";
      } else {
        notification.style.backgroundColor = "var(--success)";
      }
      
      notification.style.display = "block";
      setTimeout(() => {
        notification.style.display = "none";
      }, 3000);
    }

    document.getElementById('editProductForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/index.html';
    return;
  }

  const data = {
    name: document.getElementById('name').value,
    category: document.getElementById('category').value,
    price: parseFloat(document.getElementById('price').value),
    stock_quantity: parseInt(document.getElementById('stock_quantity').value)
  };

  try {
    const response = await fetch(`/products/${productId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update product');
    }
    
    const result = await response.json();
    console.log('Product updated:', result);
    showNotification('Product updated successfully!');
    
    setTimeout(() => {
      window.location.href = "view_product.html";
    }, 1500);
  } catch (error) {
    console.error("Error updating product:", error);
    showNotification("Error updating product: " + error.message, "error");
  }
});
    loadProduct();
    
  