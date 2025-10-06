  // Navbar shrink effect
window.addEventListener("scroll", () => {
  const navbar = document.getElementById("navbar");
  if (window.scrollY > 50) {
    navbar.classList.add("shrink");
  } else {
    navbar.classList.remove("shrink");
  }
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({ behavior: "smooth" });
  });
});

// Book Technician button
document.getElementById("bookBtn").addEventListener("click", () => {
  alert("Booking feature coming soon in PowerLink App!");
});

const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const body = document.body;

menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");  // toggle sidebar
  body.classList.toggle("move-left");     // shrink page
});


// Login/Sign-in popup handling
document.addEventListener("DOMContentLoaded", function() {
  const popup = document.getElementById("login-popup");
  const loginBtn = document.getElementById("login-btn");
  const signinBtn = document.getElementById("signin-btn");
  const skipLink = document.getElementById("skip-link");

  // Login button → redirect to login page
  loginBtn.addEventListener("click", function() {
    window.location.href = "login.html";
  });

  // Sign-in button → redirect to sign-in page
  signinBtn.addEventListener("click", function() {
    window.location.href = "signin.html";
  });

  // Skip login → hide popup smoothly
  skipLink.addEventListener("click", function(e) {
    e.preventDefault();
    popup.style.transition = "opacity 0.4s ease";
    popup.style.opacity = 0;
    setTimeout(() => {
      popup.style.display = "none";
    }, 400);
  });
});
