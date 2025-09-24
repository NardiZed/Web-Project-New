document.addEventListener('DOMContentLoaded', () => {
  // --- LOGIN PAGE LOGIC ---
  const form = document.getElementById('loginForm');
  const username = document.getElementById('username');
  const password = document.getElementById('password');
  const toggle = document.getElementById('togglePassword');

  if (form && username && password && toggle) {
    const usernameError = username.parentElement.querySelector('small.error');
    const passwordError = password.parentElement.querySelector('small.error');

    // Ensure parent containers are positioned so error messages don't push layout
    [username.parentElement, password.parentElement].forEach((p) => {
      if (getComputedStyle(p).position === 'static') p.style.position = 'relative';
    });

    // Style the small.error elements so they overlay instead of pushing content
    [usernameError, passwordError].forEach((s) => {
      if (!s) return;
      s.style.position = 'absolute';
      s.style.left = '50%';
      s.style.transform = 'translateX(-50%)';
      s.style.bottom = '-18px';
      s.style.width = '100%';
      s.style.maxWidth = '320px';
      s.style.lineHeight = '18px';
      s.style.fontSize = '0.85rem';
      s.style.textAlign = 'center';
      s.style.visibility = s.textContent.trim() ? 'visible' : 'hidden';
      s.style.display = 'block';
    });

    // Show / hide password
    toggle.addEventListener('click', () => {
      const isPassword = password.type === 'password';
      password.type = isPassword ? 'text' : 'password';
      toggle.className = isPassword ? 'bx bx-show' : 'bx bx-hide';
      toggle.title = isPassword ? 'Hide password' : 'Show password';
    });

    // Clear error on input
    [username, password].forEach((el) => {
      el.addEventListener('input', () => {
        const err = el.parentElement.querySelector('small.error');
        if (err) {
          err.textContent = '';
          err.style.visibility = 'hidden';
        }
        el.removeAttribute('aria-invalid');
      });
    });

    // Basic validation on submit (only required checks - no length check)
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      // Clear previous errors (but keep reserved space)
      [usernameError, passwordError].forEach((s) => {
        if (!s) return;
        s.textContent = '';
        s.style.visibility = 'hidden';
      });

      if (!username.value.trim()) {
        usernameError.textContent = 'Username or email is required.';
        usernameError.style.visibility = 'visible';
        username.setAttribute('aria-invalid', 'true');
        valid = false;
      }

      if (!password.value) {
        passwordError.textContent = 'Password is required.';
        passwordError.style.visibility = 'visible';
        password.setAttribute('aria-invalid', 'true');
        valid = false;
      }

      if (!valid) {
        // focus first invalid input (find the small with visible text and then the input in same parent)
        const firstVisibleErr = Array.from(document.querySelectorAll('small.error'))
          .find(s => s.textContent.trim());
        if (firstVisibleErr) {
          const inputToFocus = firstVisibleErr.parentElement.querySelector('input,textarea,select');
          if (inputToFocus) inputToFocus.focus();
        }
        return;
      }

      // Demo success behaviour (replace with real auth)
      alert('Login successful (demo). Redirecting...');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 700);
    });
  }

  // --- SIGNUP PAGE LOGIC ---
  const signupForm = document.querySelector('.signup-container form');
  if (signupForm) {
    const name = document.getElementById('signupName');
    const email = document.getElementById('signupEmail');
    const phone = document.getElementById('signupPhone');
    const password = document.getElementById('signupPassword');
    const confirm = document.getElementById('signupConfirmPassword');
    const togglePassword = document.getElementById('toggleSignupPassword');
    const toggleConfirm = document.getElementById('toggleSignupConfirmPassword');
    const fields = [name, email, phone, password, confirm];
    const errors = fields.map(f => f?.parentElement.querySelector('small.error'));

    // Show/hide password
    if (togglePassword && password) {
      togglePassword.addEventListener('click', () => {
        const isPassword = password.type === 'password';
        password.type = isPassword ? 'text' : 'password';
        togglePassword.className = isPassword ? 'bx bx-show' : 'bx bx-hide';
        togglePassword.title = isPassword ? 'Hide password' : 'Show password';
      });
    }
    if (toggleConfirm && confirm) {
      toggleConfirm.addEventListener('click', () => {
        const isPassword = confirm.type === 'password';
        confirm.type = isPassword ? 'text' : 'password';
        toggleConfirm.className = isPassword ? 'bx bx-show' : 'bx bx-hide';
        toggleConfirm.title = isPassword ? 'Hide password' : 'Show password';
      });
    }

    // Style error messages
    errors.forEach(s => {
      if (!s) return;
      s.style.position = 'absolute';
      s.style.left = '50%';
      s.style.transform = 'translateX(-50%)';
      s.style.bottom = '-18px';
      s.style.width = '100%';
      s.style.maxWidth = '320px';
      s.style.lineHeight = '18px';
      s.style.fontSize = '0.85rem';
      s.style.textAlign = 'center';
      s.style.visibility = 'hidden';
      s.style.display = 'block';
    });

    // Clear error on input
    fields.forEach((el, i) => {
      if (!el) return;
      el.addEventListener('input', () => {
        const err = errors[i];
        if (err) {
          err.textContent = '';
          err.style.visibility = 'hidden';
        }
        el.removeAttribute('aria-invalid');
      });
    });

    // Validation on submit
    signupForm.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      // Clear previous errors
      errors.forEach(s => { if (s) { s.textContent = ''; s.style.visibility = 'hidden'; } });

      if (!name.value.trim()) {
        errors[0].textContent = 'Full name is required.';
        errors[0].style.visibility = 'visible';
        name.setAttribute('aria-invalid', 'true');
        valid = false;
      }
      if (!email.value.trim()) {
        errors[1].textContent = 'Email address is required.';
        errors[1].style.visibility = 'visible';
        email.setAttribute('aria-invalid', 'true');
        valid = false;
      }
      if (!phone.value.trim()) {
        errors[2].textContent = 'Phone number is required.';
        errors[2].style.visibility = 'visible';
        phone.setAttribute('aria-invalid', 'true');
        valid = false;
      }
      if (!password.value) {
        errors[3].textContent = 'Password is required.';
        errors[3].style.visibility = 'visible';
        password.setAttribute('aria-invalid', 'true');
        valid = false;
      }
      if (!confirm.value) {
        errors[4].textContent = 'Please confirm your password.';
        errors[4].style.visibility = 'visible';
        confirm.setAttribute('aria-invalid', 'true');
        valid = false;
      } else if (password.value && confirm.value && password.value !== confirm.value) {
        errors[4].textContent = 'Passwords do not match.';
        errors[4].style.visibility = 'visible';
        confirm.setAttribute('aria-invalid', 'true');
        valid = false;
      }

      if (!valid) {
        // Focus first invalid input
        const firstVisibleErr = errors.find(s => s && s.textContent.trim());
        if (firstVisibleErr) {
          const inputToFocus = firstVisibleErr.parentElement.querySelector('input');
          if (inputToFocus) inputToFocus.focus();
        }
        return;
      }

      // Demo success
      alert('Account created (demo). Redirecting...');
      setTimeout(() => {
        window.location.href = 'Login.html';
      }, 700);
    });
  }
});