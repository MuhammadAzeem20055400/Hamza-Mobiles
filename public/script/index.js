
const form = document.getElementById("loginForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  const response = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  document.getElementById("loginMessage").textContent = result.message || result.error;

  if (response.ok && result.token) {
    localStorage.setItem("token", result.token); 
    window.location.href = "/dashboard.html"; // Redirect to dashboard after successful login
  }
});
