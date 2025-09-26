console.log("[v0] Frontend main.js loaded successfully")

document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] DOM loaded, initializing authentication")

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
