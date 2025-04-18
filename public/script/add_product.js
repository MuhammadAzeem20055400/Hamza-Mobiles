
    
if (!localStorage.getItem('token')) {
  window.location.href = '/index.html'; // Redirect to login page
}

document.getElementById('productForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  submitBtn.disabled = true;

  try {
    const data = {
      name: document.getElementById('name').value,
      category: document.getElementById('category').value,
      price: parseFloat(document.getElementById('price').value),
      stock_quantity: parseInt(document.getElementById('stock_quantity').value)
    };

    
    const token = localStorage.getItem('token');

    
    if (!token) {
      window.location.href = '/index.html'; 
      return;
    }

    
    const response = await fetch('/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Added the token to Authorization header
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Failed to add product');

    const result = await response.json();
    console.log('Product added:', result);
    
    
    const notification = document.getElementById('notification');
    notification.style.backgroundColor = 'var(--success)';
    document.getElementById('notificationMessage').textContent = 'Product added successfully!';
    notification.classList.add('show');
    
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
    
    
    e.target.reset();
  } catch (error) {
    console.error('Error adding product:', error);
    
    
    const notification = document.getElementById('notification');
    notification.style.backgroundColor = 'var(--danger)';
    document.getElementById('notificationMessage').textContent = 'Error adding product!';
    notification.classList.add('show');
    
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  } finally {
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
  }
});
