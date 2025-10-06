// PowerLink Authentication JavaScript
// Handles mobile OTP-based login and registration

// API Base URL - Change this to your actual server URL when deployed
const API_BASE_URL = 'http://localhost:5000/api';

// Check which page we're on
const isLoginPage = window.location.pathname.includes('login.html');
const isSignupPage = window.location.pathname.includes('signup.html');

// DOM Elements - Login (only initialize if on login page)
let loginStep, loginOtpStep, loginMobile, loginMobileDisplay, requestOtpBtn, 
    verifyLoginOtpBtn, resendLoginOtp, backToLogin, loginMobileError, 
    loginOtpError, loginOtpSuccess;

if (isLoginPage) {
  loginStep = document.getElementById('login-step');
  loginOtpStep = document.getElementById('login-otp-step');
  loginMobile = document.getElementById('login-mobile');
  loginMobileDisplay = document.getElementById('login-mobile-display');
  requestOtpBtn = document.getElementById('request-otp-btn');
  verifyLoginOtpBtn = document.getElementById('verify-login-otp-btn');
  resendLoginOtp = document.getElementById('resend-login-otp');
  backToLogin = document.getElementById('back-to-login');
  loginMobileError = document.getElementById('login-mobile-error');
  loginOtpError = document.getElementById('login-otp-error');
  loginOtpSuccess = document.getElementById('login-otp-success');
}

// DOM Elements - Registration (only initialize if on signup page)
let registerStep1, registerStep2, registerOtpStep, registerSuccess, 
    registerMobile, registerEmail, registerFirstname, registerLastname,
    registerState, registerCity, registerArea, registerLine, registerDoorno,
    registerMobileDisplay, registerNextBtn, registerSubmitBtn, 
    verifyRegisterOtpBtn, resendRegisterOtp, backToRegister1, goToLoginBtn;

if (isSignupPage) {
  registerStep1 = document.getElementById('register-step-1');
  registerStep2 = document.getElementById('register-step-2');
  registerOtpStep = document.getElementById('register-otp-step');
  registerSuccess = document.getElementById('register-success');
  registerMobile = document.getElementById('register-mobile');
  registerEmail = document.getElementById('register-email');
  registerFirstname = document.getElementById('register-firstname');
  registerLastname = document.getElementById('register-lastname');
  registerState = document.getElementById('register-state');
  registerCity = document.getElementById('register-city');
  registerArea = document.getElementById('register-area');
  registerLine = document.getElementById('register-line');
  registerDoorno = document.getElementById('register-doorno');
  registerMobileDisplay = document.getElementById('register-mobile-display');
  registerNextBtn = document.getElementById('register-next-btn');
  registerSubmitBtn = document.getElementById('register-submit-btn');
  verifyRegisterOtpBtn = document.getElementById('verify-register-otp-btn');
  resendRegisterOtp = document.getElementById('resend-register-otp');
  backToRegister1 = document.getElementById('back-to-register-1');
  goToLoginBtn = document.getElementById('go-to-login-btn');
}

// Store user data temporarily
let currentUserId = null;
let registrationData = {};

// Initialize OTP input functionality
function initOtpInputs() {
  if (isLoginPage) {
    // Login OTP inputs
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        if (e.target.value.length === 1) {
          if (index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
          }
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
          otpInputs[index - 1].focus();
        }
      });
    });
  }

  if (isSignupPage) {
    // Registration OTP inputs
    const regOtpInputs = document.querySelectorAll('.reg-otp-input');
    regOtpInputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        if (e.target.value.length === 1) {
          if (index < regOtpInputs.length - 1) {
            regOtpInputs[index + 1].focus();
          }
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
          regOtpInputs[index - 1].focus();
        }
      });
    });
  }
}

// Show a specific authentication step
function showAuthStep(stepId) {
  // Hide all steps
  document.querySelectorAll('.auth-steps').forEach(step => {
    step.classList.remove('active');
  });
  
  // Show the requested step
  document.getElementById(stepId).classList.add('active');
}

// Validate mobile number
function isValidMobile(mobile) {
  return /^[6-9]\d{9}$/.test(mobile);
}

// Validate email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Get OTP from inputs
function getOtpValue(isRegistration = false) {
  const selector = isRegistration ? '.reg-otp-input' : '.otp-input';
  const otpInputs = document.querySelectorAll(selector);
  let otp = '';
  
  otpInputs.forEach(input => {
    otp += input.value;
  });
  
  return otp;
}

// Clear OTP inputs
function clearOtpInputs(isRegistration = false) {
  const selector = isRegistration ? '.reg-otp-input' : '.otp-input';
  const otpInputs = document.querySelectorAll(selector);
  
  otpInputs.forEach(input => {
    input.value = '';
  });
  
  // Focus on first input
  if (otpInputs.length > 0) {
    otpInputs[0].focus();
  }
}

// Show error message
function showError(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = 'block';
  }
}

// Hide error message
function hideError(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = 'none';
  }
}

// Show success message
function showSuccess(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = 'block';
  }
}

// Request login OTP
async function requestLoginOtp() {
  if (isLoginPage) {
    const mobileNumber = loginMobile.value.trim();
    
    if (!isValidMobile(mobileNumber)) {
      showError('login-mobile-error');
      return;
    }
    
    hideError('login-mobile-error');
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/request-login-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mobileNumber })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        currentUserId = data.userId;
        loginMobileDisplay.textContent = mobileNumber;
        showAuthStep('login-otp-step');
      } else {
        showError('login-mobile-error');
      }
    } catch (error) {
      console.error('Error requesting login OTP:', error);
      showError('login-mobile-error');
    }
  }
}

// Verify login OTP
async function verifyLoginOtp() {
  if (isLoginPage) {
    const otp = getOtpValue();
    
    if (otp.length !== 6) {
      showError('login-otp-error');
      return;
    }
    
    hideError('login-otp-error');
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login-with-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: currentUserId, otp })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Show success message
        showSuccess('login-otp-success');
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } else {
        showError('login-otp-error');
      }
    } catch (error) {
      console.error('Error verifying login OTP:', error);
      showError('login-otp-error');
    }
  }
}

// Handle registration step 1
function handleRegisterStep1() {
  if (isSignupPage) {
    const mobileNumber = registerMobile.value.trim();
    const email = registerEmail.value.trim();
    const firstName = registerFirstname.value.trim();
    const lastName = registerLastname.value.trim();
    
    if (!isValidMobile(mobileNumber)) {
      showError('register-mobile-error');
      return;
    }
    
    if (!isValidEmail(email)) {
      showError('register-email-error');
      return;
    }
    
    hideError('register-mobile-error');
    hideError('register-email-error');
    
    // Store data for later submission
    registrationData = {
      mobileNumber,
      email,
      firstName,
      lastName
    };
    
    showAuthStep('register-step-2');
  }
}

// Submit registration
async function submitRegistration() {
  if (isSignupPage) {
    const state = registerState.value.trim();
    const city = registerCity.value.trim();
    const area = registerArea.value.trim();
    const line = registerLine.value.trim();
    const doorNo = registerDoorno.value.trim();
    
    // Add address details to registration data
    registrationData.address = {
      state,
      city,
      area,
      line,
      doorNo
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        currentUserId = data.userId;
        registerMobileDisplay.textContent = registrationData.mobileNumber;
        showAuthStep('register-otp-step');
      } else {
        // Show error on step 1 and go back
        showError('register-mobile-error');
        showAuthStep('register-step-1');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      showError('register-mobile-error');
      showAuthStep('register-step-1');
    }
  }
}

// Verify registration OTP
async function verifyRegisterOtp() {
  if (isSignupPage) {
    const otp = getOtpValue(true);
    
    if (otp.length !== 6) {
      showError('register-otp-error');
      return;
    }
    
    hideError('register-otp-error');
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: currentUserId, otp })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Show success message
        showSuccess('register-otp-success');
        
        // Show success step
        setTimeout(() => {
          showAuthStep('register-success');
        }, 1500);
      } else {
        showError('register-otp-error');
      }
    } catch (error) {
      console.error('Error verifying registration OTP:', error);
      showError('register-otp-error');
    }
  }
}

// Resend OTP
async function resendOtp(isRegistration = false) {
  const endpoint = isRegistration ? `${API_BASE_URL}/auth/register` : `${API_BASE_URL}/auth/request-login-otp`;
  const errorId = isRegistration ? 'register-otp-error' : 'login-otp-error';
  
  try {
    const body = isRegistration ? registrationData : { mobileNumber: loginMobile.value.trim() };
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      showError(errorId);
    }
  } catch (error) {
    console.error('Error resending OTP:', error);
    showError(errorId);
  }
}

// Check if user is logged in
function checkAuth() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    // User is logged in, redirect to home page if on login or signup page
    if (isLoginPage || isSignupPage) {
      window.location.href = 'index.html';
    }
  }
}

// Initialize the page
function init() {
  // Check if user is already logged in
  checkAuth();
  
  // Initialize OTP inputs
  initOtpInputs();
  
  // Add event listeners for login page
  if (isLoginPage) {
    requestOtpBtn.addEventListener('click', requestLoginOtp);
    verifyLoginOtpBtn.addEventListener('click', verifyLoginOtp);
    resendLoginOtp.addEventListener('click', () => resendOtp(false));
    backToLogin.addEventListener('click', () => showAuthStep('login-step'));
  }
  
  // Add event listeners for signup page
  if (isSignupPage) {
    registerNextBtn.addEventListener('click', handleRegisterStep1);
    registerSubmitBtn.addEventListener('click', submitRegistration);
    verifyRegisterOtpBtn.addEventListener('click', verifyRegisterOtp);
    resendRegisterOtp.addEventListener('click', () => resendOtp(true));
    backToRegister1.addEventListener('click', () => showAuthStep('register-step-1'));
    goToLoginBtn.addEventListener('click', () => window.location.href = 'login.html');
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Helper function to get current user
function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Helper function to logout user
function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}