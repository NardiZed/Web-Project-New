document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const username = document.getElementById('username');
  const password = document.getElementById('password');
  const toggle = document.getElementById('togglePassword');

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
    s.style.left = '0';
    s.style.bottom = '-18px';
    s.style.height = '18px';
    s.style.lineHeight = '18px';
    s.style.fontSize = '0.85rem';
    s.style.visibility = s.textContent.trim() ? 'visible' : 'hidden';
    s.style.display = 'block';
    s.style.position = 'absolute';
    s.style.left = '50%';                     // center horizontally
    s.style.transform = 'translateX(-50%)';  // center offset
    s.style.bottom = '-18px';
    s.style.width = '100%';                   // take full parent width
    s.style.maxWidth = '320px';               // limit width so it stays readable
    s.style.lineHeight = '18px';
    s.style.fontSize = '0.85rem';
    s.style.textAlign = 'center';             // center the text inside the element
    s.style.visibility = s.textContent.trim() ? 'visible' : 'hidden';
    s.style.display = 'block';
  });

  // Show / hide password
  toggle.addEventListener('click', () => {
    const isPassword = password.type === 'password';
    password.type = isPassword ? 'text' : 'password';
    // update icon (boxicons)
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
});