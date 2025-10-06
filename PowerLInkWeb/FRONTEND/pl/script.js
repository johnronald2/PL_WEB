window.addEventListener("scroll", () => {
  const navbar = document.getElementById("navbar");
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});


// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth"
    });
  });
});

// Authentication Functions
const AUTH_KEY = 'powerlink_auth';

/**
 * Register a new user
 * @param {string} username - User's username
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Object} - Result object with success status and message
 */
function registerUser(username, email, password) {
  try {
    // Check if user already exists
    const users = getUsersFromStorage();
    if (users.find(user => user.email === email)) {
      return { success: false, message: 'Email already registered' };
    }
    
    // Create new user object
    const newUser = {
      id: generateUserId(),
      username,
      email,
      password: hashPassword(password), // In a real app, use proper hashing
      createdAt: new Date().toISOString()
    };
    
    // Add to users array
    users.push(newUser);
    localStorage.setItem('powerlink_users', JSON.stringify(users));
    
    return { success: true, message: 'Registration successful', user: { ...newUser, password: undefined } };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Registration failed' };
  }
}

/**
 * Login a user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Object} - Result object with success status and user data
 */
function loginUser(email, password) {
  try {
    const users = getUsersFromStorage();
    const user = users.find(user => user.email === email);
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    // Check password (in a real app, use proper password verification)
    if (user.password !== hashPassword(password)) {
      return { success: false, message: 'Invalid password' };
    }
    
    // Create session
    const session = {
      userId: user.id,
      username: user.username,
      email: user.email,
      loggedInAt: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    
    return { 
      success: true, 
      message: 'Login successful', 
      user: { ...user, password: undefined } 
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Login failed' };
  }
}

/**
 * Check if user is logged in
 * @returns {Object|null} - User session if logged in, null otherwise
 */
function getCurrentUser() {
  try {
    const sessionData = localStorage.getItem(AUTH_KEY);
    if (!sessionData) return null;
    
    return JSON.parse(sessionData);
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Logout current user
 */
function logoutUser() {
  localStorage.removeItem(AUTH_KEY);
  return { success: true, message: 'Logout successful' };
}

/**
 * Get users from localStorage
 * @returns {Array} - Array of users
 */
function getUsersFromStorage() {
  const users = localStorage.getItem('powerlink_users');
  return users ? JSON.parse(users) : [];
}

/**
 * Generate a unique user ID
 * @returns {string} - Unique ID
 */
function generateUserId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Simple password hashing (for demo purposes only)
 * In a real application, use a proper hashing library
 * @param {string} password - Password to hash
 * @returns {string} - Hashed password
 */
function hashPassword(password) {
  // This is NOT secure - in a real app use bcrypt or similar
  // This is just for demonstration purposes
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

 scrolling
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



function scrollGallery(id, direction) {
  const gallery = document.getElementById(id);
  const scrollAmount = 400; // adjust per click // our best serveces
  gallery.scrollBy({
    left: direction * scrollAmount,
    behavior: "smooth"
  });
}



firebase.auth().signInWithEmailAndPassword(email, password)
  .then((userCredential) => {
    // Signed in
    var user = userCredential.user;
    // ...
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
  });


  import { getAuth, signInWithCustomToken } from "firebase/auth";

const auth = getAuth();
signInWithCustomToken(auth, token)
  .then((userCredential) => {
    // Signed in
    const user = userCredential.user;
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ...
  });









  
  (function () {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return; // safety

    // Throttle using requestAnimationFrame
    let lastScrollY = window.scrollY;
    let ticking = false;
    const THRESHOLD = 50; // px scrolled before shrinking

    function update() {
      const scrolled = window.scrollY > THRESHOLD;
      // Toggle both class names so it works with either CSS (.scrolled or .shrink)
      navbar.classList.toggle('scrolled', scrolled);
      navbar.classList.toggle('shrink', scrolled);
      ticking = false;
    }

    function onScroll() {
      lastScrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    // Prevent content jump: keep body padding equal to navbar height
    function adjustBodyPadding() {
      document.body.style.paddingTop = navbar.offsetHeight + 'px';
    }

    // Init
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', adjustBodyPadding);
    document.addEventListener('DOMContentLoaded', () => {
      adjustBodyPadding();
      update(); // apply correct state if already scrolled on load
    });

    // Also run immediately in case script is added after load
    adjustBodyPadding();
    update();
  })();






  


  