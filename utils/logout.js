export function logout() {
  // Clear localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("role");

  // Redirect to login
  window.location.href = "/login"; // simple redirect
}
