console.log("[v0] Frontend main.js loaded successfully")

function updateNavbarForAuthState() {
  const authToken = localStorage.getItem("authToken")
  const userData = localStorage.getItem("user")
  const loginLink = document.querySelector("nav ul li:last-child")

  if (authToken && userData) {
    try {
      const user = JSON.parse(userData)
      const userName = user.full_name || user.username || user.email || "User"
      const userEmail = user.email || ""

      const getInitials = (name) => {
        return name
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase())
          .slice(0, 2)
          .join("")
      }

      const userInitials = getInitials(userName)

      loginLink.innerHTML = `
        <div class="profile-dropdown">
          <button class="profile-btn" id="profileBtn" title="${userName}${userEmail ? "\n" + userEmail : ""}">
            <div class="profile-avatar">${userInitials}</div>
            <i class='bx bx-chevron-down'></i>
          </button>
          <div class="dropdown-menu" id="profileDropdown">
            <div class="dropdown-header">
              <div class="user-info">
                <div class="user-name">${userName}</div>
                ${userEmail ? `<div class="user-email">${userEmail}</div>` : ""}
              </div>
            </div>
            <hr class="dropdown-divider">
            <a href="#" class="dropdown-item sign-out-item" id="signOutBtn">
              <i class='bx bx-log-out'></i>
              Sign Out
            </a>
          </div>
        </div>
      `

      // Add event listeners for dropdown functionality
      const profileBtn = document.getElementById("profileBtn")
      const profileDropdown = document.getElementById("profileDropdown")
      const signOutBtn = document.getElementById("signOutBtn")

      // Toggle dropdown on profile button click
      profileBtn.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()
        profileDropdown.classList.toggle("show")
      })

      // Close dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
          profileDropdown.classList.remove("show")
        }
      })

      // Handle sign out
      signOutBtn.addEventListener("click", (e) => {
        e.preventDefault()
        handleSignOut()
      })
    } catch (error) {
      console.error("[v0] Error parsing user data:", error)
      // Fallback to login link if user data is corrupted
      showLoginLink()
    }
  } else {
    showLoginLink()
  }
}

function showLoginLink() {
  const loginLink = document.querySelector("nav ul li:last-child")
  loginLink.innerHTML = '<a href="Login.html">Login</a>'
}

function handleSignOut() {
  // Clear authentication data
  localStorage.removeItem("authToken")
  localStorage.removeItem("user")

  console.log("[v0] User signed out successfully")

  // Update navbar immediately
  showLoginLink()

  // Redirect to home page after a short delay
  setTimeout(() => {
    window.location.href = "index.html"
  }, 300)
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] DOM loaded, initializing authentication")

  // Update navbar based on auth state
  updateNavbarForAuthState()

  // --- LOGIN PAGE LOGIC ---
  const form = document.getElementById("loginForm")
  const username = document.getElementById("username")
  const password = document.getElementById("password")
  const toggle = document.getElementById("togglePassword")

  if (form && username && password && toggle) {
    console.log("[v0] Login form elements found")
    const usernameError = username.parentElement.querySelector("small.error")
    const passwordError = password.parentElement.querySelector("small.error")

    // Ensure parent containers are positioned so error messages don't push layout
    ;[username.parentElement, password.parentElement].forEach((p) => {
      if (getComputedStyle(p).position === "static") p.style.position = "relative"
    })

    // Style the small.error elements so they overlay instead of pushing content
    ;[usernameError, passwordError].forEach((s) => {
      if (!s) return
      s.style.position = "absolute"
      s.style.left = "50%"
      s.style.transform = "translateX(-50%)"
      s.style.bottom = "-18px"
      s.style.width = "100%"
      s.style.maxWidth = "320px"
      s.style.lineHeight = "18px"
      s.style.fontSize = "0.85rem"
      s.style.textAlign = "center"
      s.style.visibility = s.textContent.trim() ? "visible" : "hidden"
      s.style.display = "block"
    })

    // Show / hide password
    toggle.addEventListener("click", () => {
      const isPassword = password.type === "password"
      password.type = isPassword ? "text" : "password"
      toggle.className = isPassword ? "bx bx-show" : "bx bx-hide"
      toggle.title = isPassword ? "Hide password" : "Show password"
    })

    // Clear error on input
    ;[username, password].forEach((el) => {
      el.addEventListener("input", () => {
        const err = el.parentElement.querySelector("small.error")
        if (err) {
          err.textContent = ""
          err.style.visibility = "hidden"
        }
        el.removeAttribute("aria-invalid")
      })
    })

    // Basic validation on submit (only required checks - no length check)
    form.addEventListener("submit", async (e) => {
      e.preventDefault()
      console.log("[v0] Login form submitted")
      let valid = true

      // Clear previous errors (but keep reserved space)
      ;[usernameError, passwordError].forEach((s) => {
        if (!s) return
        s.textContent = ""
        s.style.visibility = "hidden"
      })

      if (!username.value.trim()) {
        usernameError.textContent = "Username or email is required."
        usernameError.style.visibility = "visible"
        username.setAttribute("aria-invalid", "true")
        valid = false
      }

      if (!password.value) {
        passwordError.textContent = "Password is required."
        passwordError.style.visibility = "visible"
        password.setAttribute("aria-invalid", "true")
        valid = false
      }

      if (!valid) {
        const firstVisibleErr = Array.from(document.querySelectorAll("small.error")).find((s) => s.textContent.trim())
        if (firstVisibleErr) {
          const inputToFocus = firstVisibleErr.parentElement.querySelector("input,textarea,select")
          if (inputToFocus) inputToFocus.focus()
        }
        return
      }

      // Call backend API for login
      try {
        console.log("[v0] Attempting login request to backend")
        const response = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: username.value.trim(),
            password: password.value,
          }),
        })

        console.log("[v0] Login response status:", response.status)

        if (!response.ok) {
          let errorMessage = "Login failed"
          try {
            const data = await response.json()
            errorMessage = data.error || errorMessage
          } catch (jsonError) {
            console.error("[v0] Failed to parse login error response:", jsonError)
            if (response.status === 0) {
              errorMessage = "Cannot connect to server. Please check if the backend is running."
            } else if (response.status === 401) {
              errorMessage = "Invalid username or password."
            } else if (response.status >= 500) {
              errorMessage = "Server error. Please try again later."
            }
          }

          passwordError.textContent = errorMessage
          passwordError.style.visibility = "visible"
          return
        }

        const data = await response.json()
        console.log("[v0] Login response data:", data)

        // Store token in localStorage
        localStorage.setItem("authToken", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))

        alert("Login successful! Redirecting...")
        setTimeout(() => {
          window.location.href = "index.html"
        }, 700)
      } catch (error) {
        console.error("[v0] Login error:", error)
        let errorMessage = "Network error. Please try again."

        if (error.name === "TypeError" && error.message.includes("fetch")) {
          errorMessage = "Cannot connect to server. Please ensure the backend server is running on port 5000."
        } else if (error.message.includes("CORS")) {
          errorMessage = "Server configuration error. Please check CORS settings."
        }

        passwordError.textContent = errorMessage
        passwordError.style.visibility = "visible"
      }
    })
  }

  // --- SIGNUP PAGE LOGIC ---
  const signupForm = document.querySelector(".signup-container form")
  if (signupForm) {
    console.log("[v0] Signup form found")

    const name = document.getElementById("signupName")
    const email = document.getElementById("signupEmail")
    const phone = document.getElementById("signupPhone")
    const password = document.getElementById("signupPassword")
    const confirm = document.getElementById("signupConfirmPassword")
    const togglePassword = document.getElementById("toggleSignupPassword")
    const toggleConfirm = document.getElementById("toggleSignupConfirmPassword")
    const fields = [name, email, phone, password, confirm]
    const errors = fields.map((f) => f?.parentElement.querySelector("small.error"))

    // Show/hide password
    if (togglePassword && password) {
      togglePassword.addEventListener("click", () => {
        const isPassword = password.type === "password"
        password.type = isPassword ? "text" : "password"
        togglePassword.className = isPassword ? "bx bx-show" : "bx bx-hide"
        togglePassword.title = isPassword ? "Hide password" : "Show password"
      })
    }
    if (toggleConfirm && confirm) {
      toggleConfirm.addEventListener("click", () => {
        const isPassword = confirm.type === "password"
        confirm.type = isPassword ? "text" : "password"
        toggleConfirm.className = isPassword ? "bx bx-show" : "bx bx-hide"
        toggleConfirm.title = isPassword ? "Hide password" : "Show password"
      })
    }

    // Style error messages
    errors.forEach((s) => {
      if (!s) return
      s.style.position = "absolute"
      s.style.left = "50%"
      s.style.transform = "translateX(-50%)"
      s.style.bottom = "-18px"
      s.style.width = "100%"
      s.style.maxWidth = "320px"
      s.style.lineHeight = "18px"
      s.style.fontSize = "0.85rem"
      s.style.textAlign = "center"
      s.style.visibility = "hidden"
      s.style.display = "block"
    })

    // Clear error on input
    fields.forEach((el, i) => {
      if (!el) return
      el.addEventListener("input", () => {
        const err = errors[i]
        if (err) {
          err.textContent = ""
          err.style.visibility = "hidden"
        }
        el.removeAttribute("aria-invalid")
      })
    })

    // Validation on submit
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault()
      console.log("[v0] Signup form submitted")
      let valid = true

      // Clear previous errors
      errors.forEach((s) => {
        if (s) {
          s.textContent = ""
          s.style.visibility = "hidden"
        }
      })

      if (!name.value.trim()) {
        errors[0].textContent = "Full name is required."
        errors[0].style.visibility = "visible"
        name.setAttribute("aria-invalid", "true")
        valid = false
      }
      if (!email.value.trim()) {
        errors[1].textContent = "Email address is required."
        errors[1].style.visibility = "visible"
        email.setAttribute("aria-invalid", "true")
        valid = false
      }
      if (!phone.value.trim()) {
        errors[2].textContent = "Phone number is required."
        errors[2].style.visibility = "visible"
        phone.setAttribute("aria-invalid", "true")
        valid = false
      }
      if (!password.value) {
        errors[3].textContent = "Password is required."
        errors[3].style.visibility = "visible"
        password.setAttribute("aria-invalid", "true")
        valid = false
      }
      if (!confirm.value) {
        errors[4].textContent = "Please confirm your password."
        errors[4].style.visibility = "visible"
        confirm.setAttribute("aria-invalid", "true")
        valid = false
      } else if (password.value && confirm.value && password.value !== confirm.value) {
        errors[4].textContent = "Passwords do not match."
        errors[4].style.visibility = "visible"
        confirm.setAttribute("aria-invalid", "true")
        valid = false
      }

      if (!valid) {
        const firstVisibleErr = errors.find((s) => s && s.textContent.trim())
        if (firstVisibleErr) {
          const inputToFocus = firstVisibleErr.parentElement.querySelector("input")
          if (inputToFocus) inputToFocus.focus()
        }
        return
      }

      console.log("[v0] Attempting registration with data:", {
        username: name.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
      })

      // Call backend API for registration
      try {
        console.log("[v0] Making registration request to backend")
        const response = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: name.value.trim(),
            email: email.value.trim(),
            phone: phone.value.trim(),
            password: password.value,
          }),
        })

        console.log("[v0] Registration response status:", response.status)

        if (!response.ok) {
          // Try to get error message from response, but handle cases where response.json() fails
          let errorMessage = "Registration failed"
          try {
            const data = await response.json()
            errorMessage = data.error || errorMessage
          } catch (jsonError) {
            console.error("[v0] Failed to parse error response:", jsonError)
            // Use status-based error messages when JSON parsing fails
            if (response.status === 0) {
              errorMessage = "Cannot connect to server. Please check if the backend is running."
            } else if (response.status >= 500) {
              errorMessage = "Server error. Please try again later."
            } else if (response.status === 409) {
              errorMessage = "Email already exists. Please use a different email."
            }
          }

          errors[1].textContent = errorMessage
          errors[1].style.visibility = "visible"
          return
        }

        const data = await response.json()
        console.log("[v0] Registration response data:", data)

        alert("Account created successfully! Redirecting to login...")
        setTimeout(() => {
          window.location.href = "Login.html"
        }, 700)
      } catch (error) {
        console.error("[v0] Registration error:", error)
        let errorMessage = "Network error. Please try again."

        if (error.name === "TypeError" && error.message.includes("fetch")) {
          errorMessage = "Cannot connect to server. Please ensure the backend server is running on port 5000."
        } else if (error.message.includes("CORS")) {
          errorMessage = "Server configuration error. Please check CORS settings."
        }

        errors[1].textContent = errorMessage
        errors[1].style.visibility = "visible"
      }
    })
  }
})
