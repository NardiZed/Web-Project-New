console.log("[v0] Frontend main.js loaded successfully")

// Global variables for marketplace
let allProducts = []
let filteredProducts = []
let selectedCategories = []
let selectedPriceRanges = []

// Cart functionality
let cart = JSON.parse(localStorage.getItem("cart")) || []

// Update cart counter in navigation
function updateCartCounter() {
  const cartLinks = document.querySelectorAll('nav ul li a[href="cart.html"]')
  cartLinks.forEach((cartLink) => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

    // Remove existing counter if it exists
    const existingCounter = cartLink.querySelector(".cart-counter")
    if (existingCounter) {
      existingCounter.remove()
    }

    // Add counter if there are items
    if (totalItems > 0) {
      const counter = document.createElement("span")
      counter.className = "cart-counter"
      counter.textContent = totalItems
      cartLink.appendChild(counter)
    }
  })
}

// Add product to cart (updated implementation with auth check)
function addToCart(productId) {
  console.log("[v0] Adding product to cart:", productId)

  // Check if user is logged in
  const authToken = localStorage.getItem("authToken")
  const userData = localStorage.getItem("user")

  if (!authToken || !userData) {
    // User is not logged in, show login prompt
    const shouldRedirect = confirm(
      "You need to be logged in to add items to your cart. Would you like to go to the login page?",
    )
    if (shouldRedirect) {
      window.location.href = "Login.html"
    }
    return
  }

  // Find the product in allProducts array
  const product = allProducts.find((p) => p.id == productId)
  if (!product) {
    console.error("[v0] Product not found:", productId)
    return
  }

  // Check if product already exists in cart
  const existingItem = cart.find((item) => item.id == productId)

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      image_url: product.image_url,
      quantity: 1,
    })
  }

  // Save to localStorage
  localStorage.setItem("cart", JSON.stringify(cart))

  // Update cart counter
  updateCartCounter()

  console.log("[v0] Cart updated:", cart)
}

// Remove product from cart
function removeFromCart(productId) {
  console.log("[v0] Removing product from cart:", productId)

  cart = cart.filter((item) => item.id != productId)
  localStorage.setItem("cart", JSON.stringify(cart))

  // Update cart counter
  updateCartCounter()

  // Refresh cart display if on cart page
  if (document.body.classList.contains("Cart")) {
    displayCartItems()
  }
}

// Update quantity in cart
function updateCartQuantity(productId, newQuantity) {
  console.log("[v0] Updating cart quantity:", productId, newQuantity)

  if (newQuantity <= 0) {
    removeFromCart(productId)
    return
  }

  const item = cart.find((item) => item.id == productId)
  if (item) {
    item.quantity = newQuantity
    localStorage.setItem("cart", JSON.stringify(cart))
    updateCartCounter()

    // Refresh cart display if on cart page
    if (document.body.classList.contains("Cart")) {
      displayCartItems()
    }
  }
}

// Display cart items on cart page
function displayCartItems() {
  const productContainer = document.querySelector(".product-container")
  const checkoutButton = document.querySelector(".main-container button")

  if (!productContainer) return

  if (cart.length === 0) {
    productContainer.innerHTML = `
      <div class="empty-cart">
        <h2>Your cart is empty</h2>
        <p>Add some products to your cart to see them here.</p>
        <a href="Marketplace.html" class="continue-shopping-btn">Continue Shopping</a>
      </div>
    `
    if (checkoutButton) {
      checkoutButton.style.display = "none"
    }
    return
  }

  const cartTotal = cart.reduce((sum, item) => sum + Number.parseFloat(item.price) * item.quantity, 0)

  productContainer.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item" data-product-id="${item.id}">
      <img src="${item.image_url || "/placeholder.svg?height=100&width=100"}" alt="${item.name}">
      <div class="item-details">
        <h3>${item.name}</h3>
        <p class="category">${item.category}</p>
        <p class="price">$${Number.parseFloat(item.price).toFixed(2)}</p>
        <p class="description">${item.description || "No description available"}</p>
      </div>
      <div class="quantity-controls">
        <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
        <span class="quantity">${item.quantity}</span>
        <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
      </div>
      <div class="item-total">
        <p class="item-price">$${(Number.parseFloat(item.price) * item.quantity).toFixed(2)}</p>
        <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove from cart</button>
      </div>
    </div>
  `,
    )
    .join("")

  // Add cart summary
  const cartSummary = document.createElement("div")
  cartSummary.className = "cart-summary"
  cartSummary.innerHTML = `
    <div class="summary-row">
      <span>Total Items: ${cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
    </div>
    <div class="summary-row total">
      <span>Total: $${cartTotal.toFixed(2)}</span>
    </div>
  `
  productContainer.appendChild(cartSummary)

  if (checkoutButton) {
    checkoutButton.style.display = "block"
    checkoutButton.onclick = () => {
      console.log(`[v0] Proceeding to checkout with total: $${cartTotal.toFixed(2)}`)
      // Here you would typically redirect to a checkout page or process payment
    }
  }
}

// Initialize cart functionality
function initializeCart() {
  console.log("[v0] Initializing cart functionality")

  // Update cart counter on page load
  updateCartCounter()

  // If on cart page, display cart items
  if (document.body.classList.contains("Cart")) {
    displayCartItems()
  }
}

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

// Fetch products from the backend API
async function fetchProducts(filters = {}) {
  try {
    console.log("[v0] Fetching products with filters:", filters)

    const queryParams = new URLSearchParams()

    // Add category filters
    if (filters.categories && filters.categories.length > 0) {
      queryParams.append("categories", filters.categories.join(","))
    }

    // Add price range filters
    if (filters.minPrice) queryParams.append("minPrice", filters.minPrice)
    if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice)

    // Add search filter
    if (filters.search) queryParams.append("search", filters.search)

    const url = `http://localhost:5000/api/products${queryParams.toString() ? "?" + queryParams.toString() : ""}`
    console.log("[v0] Fetching from URL:", url)

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] Products fetched successfully:", data)

    return data.products || []
  } catch (error) {
    console.error("[v0] Error fetching products:", error)
    showError("Failed to load products. Please check if the backend server is running.")
    return []
  }
}

// Display products in the marketplace
function displayProducts(products) {
  const cardsContainer = document.querySelector(".cards")
  const productsCount = document.getElementById("productsCount")

  if (!cardsContainer) {
    console.error("[v0] Cards container not found")
    return
  }

  // Update products count
  if (productsCount) {
    productsCount.textContent = `${products.length} product${products.length !== 1 ? "s" : ""} found`
  }

  if (!products || products.length === 0) {
    cardsContainer.innerHTML = `
      <div class="no-products">
        <h3>No products found</h3>
        <p>Try adjusting your filters or check back later.</p>
      </div>
    `
    return
  }

  cardsContainer.innerHTML = products
    .map(
      (product) => `
    <div class="product-card" data-category="${product.category}" data-price="${product.price}">
      <img src="${product.image_url || "/placeholder.svg?height=200&width=200"}" alt="${product.name}" loading="lazy">
      <h3>${product.name}</h3>
      <p class="category">${product.category}</p>
      <p class="price">$${Number.parseFloat(product.price).toFixed(2)}</p>
      <p class="description">${product.description || "No description available"}</p>
      <button class="add-to-cart-btn" data-product-id="${product.id}">Add to cart</button>
    </div>
  `,
    )
    .join("")

  // Add event listeners to "Add to cart" buttons
  const addToCartButtons = cardsContainer.querySelectorAll(".add-to-cart-btn")
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const productId = e.target.getAttribute("data-product-id")
      addToCart(productId)
    })
  })
}

// Show error message
function showError(message) {
  const cardsContainer = document.querySelector(".cards")
  const productsCount = document.getElementById("productsCount")

  if (cardsContainer) {
    cardsContainer.innerHTML = `
      <div class="error-message">
        <h3>Error</h3>
        <p>${message}</p>
      </div>
    `
  }

  if (productsCount) {
    productsCount.textContent = "Error loading products"
  }
}

// Initialize marketplace page
async function initializeMarketplace() {
  console.log("[v0] Initializing marketplace")

  // Show loading state
  const cardsContainer = document.querySelector(".cards")
  const productsCount = document.getElementById("productsCount")

  if (cardsContainer) {
    cardsContainer.innerHTML = '<div class="loading-spinner"><p>Loading products...</p></div>'
  }

  if (productsCount) {
    productsCount.textContent = "Loading..."
  }

  // Fetch and display all products initially
  allProducts = await fetchProducts()
  filteredProducts = [...allProducts]
  displayProducts(filteredProducts)

  // Update the selected count
  updateSelectedCount()
}

// Update the selected filters count
function updateSelectedCount() {
  const countSpan = document.querySelector(".Categories span")
  if (countSpan) {
    const totalSelected = selectedCategories.length + selectedPriceRanges.length
    countSpan.innerHTML = `${totalSelected} selected <button onclick="selectAllFilters()">Select All</button> <button onclick="clearAllFilters()">Clear All</button>`
  }
}

// Select all filters
function selectAllFilters() {
  const categoryCheckboxes = document.querySelectorAll('.Categories .check-list input[type="checkbox"]')
  const priceCheckboxes = document.querySelectorAll('.Categories + div .check-list input[type="checkbox"]')

  console.log("[v0] Selecting all filters - categories:", categoryCheckboxes.length, "price:", priceCheckboxes.length)

  categoryCheckboxes.forEach((checkbox) => {
    checkbox.checked = true
    console.log("[v0] Selected category checkbox:", checkbox.id)
  })

  priceCheckboxes.forEach((checkbox) => {
    checkbox.checked = true
    console.log("[v0] Selected price checkbox:", checkbox.id)
  })

  applyFilters()
}

// Clear all filters
function clearAllFilters() {
  const categoryCheckboxes = document.querySelectorAll('.Categories .check-list input[type="checkbox"]')
  const priceCheckboxes = document.querySelectorAll('.Categories + div .check-list input[type="checkbox"]')

  console.log("[v0] Clearing all filters - categories:", categoryCheckboxes.length, "price:", priceCheckboxes.length)

  categoryCheckboxes.forEach((checkbox) => {
    checkbox.checked = false
    console.log("[v0] Cleared category checkbox:", checkbox.id)
  })

  priceCheckboxes.forEach((checkbox) => {
    checkbox.checked = false
    console.log("[v0] Cleared price checkbox:", checkbox.id)
  })

  selectedCategories = []
  selectedPriceRanges = []

  // Clear search input
  const searchInput = document.getElementById("searchInput")
  if (searchInput) {
    searchInput.value = ""
  }

  // Fetch all products without filters
  initializeMarketplace()
}

// Apply filters based on selected checkboxes
async function applyFilters() {
  console.log("[v0] Applying filters")

  // Show loading state
  const cardsContainer = document.querySelector(".cards")
  const productsCount = document.getElementById("productsCount")

  if (cardsContainer) {
    cardsContainer.innerHTML = '<div class="loading-spinner"><p>Filtering products...</p></div>'
  }

  if (productsCount) {
    productsCount.textContent = "Filtering..."
  }

  // Get selected categories using more specific selectors
  const categoryCheckboxes = document.querySelectorAll('.Categories .check-list input[type="checkbox"]:checked')
  selectedCategories = []

  categoryCheckboxes.forEach((checkbox) => {
    const label = checkbox.nextElementSibling
    if (label && label.tagName === "LABEL") {
      selectedCategories.push(label.textContent.trim())
    }
  })

  // Get selected price ranges using more specific selectors
  const priceCheckboxes = document.querySelectorAll('.Categories + div .check-list input[type="checkbox"]:checked')
  selectedPriceRanges = []

  priceCheckboxes.forEach((checkbox) => {
    const label = checkbox.nextElementSibling
    if (label && label.tagName === "LABEL") {
      selectedPriceRanges.push(label.textContent.trim())
    }
  })

  console.log("[v0] Selected categories:", selectedCategories)
  console.log("[v0] Selected price ranges:", selectedPriceRanges)

  // Build filters object
  const filters = {}

  // Add category filters
  if (selectedCategories.length > 0) {
    filters.categories = selectedCategories
  }

  // Add price range filters
  if (selectedPriceRanges.length > 0) {
    // Convert price range labels to min/max values
    let minPrice = null
    let maxPrice = null

    selectedPriceRanges.forEach((range) => {
      switch (range) {
        case ">500ETB":
          if (!minPrice || minPrice < 500) minPrice = 500
          break
        case "500-1500":
          if (!minPrice || minPrice < 500) minPrice = 500
          if (!maxPrice || maxPrice > 1500) maxPrice = 1500
          break
        case "1500-2500":
          if (!minPrice || minPrice < 1500) minPrice = 1500
          if (!maxPrice || maxPrice > 2500) maxPrice = 2500
          break
        case "2500-5000":
          if (!minPrice || minPrice < 2500) minPrice = 2500
          if (!maxPrice || maxPrice > 5000) maxPrice = 5000
          break
        case "5000-10000":
          if (!minPrice || minPrice < 5000) minPrice = 5000
          if (!maxPrice || maxPrice > 10000) maxPrice = 10000
          break
        case ">10000":
          if (!minPrice || minPrice < 10000) minPrice = 10000
          break
      }
    })

    if (minPrice !== null) filters.minPrice = minPrice
    if (maxPrice !== null) filters.maxPrice = maxPrice
  }

  // Add search filter
  const searchInput = document.getElementById("searchInput")
  if (searchInput && searchInput.value.trim()) {
    filters.search = searchInput.value.trim()
  }

  console.log("[v0] Final filters object:", filters)

  // Fetch filtered products
  filteredProducts = await fetchProducts(filters)
  displayProducts(filteredProducts)
  updateSelectedCount()
}

function performSearch() {
  applyFilters()
}

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] DOM loaded, initializing authentication")

  // Update navbar based on auth state
  updateNavbarForAuthState()

  initializeCart()

  if (document.body.classList.contains("Marketplace")) {
    console.log("[v0] Marketplace page detected, initializing...")
    initializeMarketplace()

    // Add event listeners to filter checkboxes with more specific selectors
    const categoryCheckboxes = document.querySelectorAll('.Categories .check-list input[type="checkbox"]')
    const priceCheckboxes = document.querySelectorAll('.Categories + div .check-list input[type="checkbox"]')

    console.log("[v0] Found category checkboxes:", categoryCheckboxes.length)
    console.log("[v0] Found price checkboxes:", priceCheckboxes.length)

    // Add event listeners to category checkboxes
    categoryCheckboxes.forEach((checkbox, index) => {
      console.log("[v0] Adding listener to category checkbox:", checkbox.id)
      checkbox.addEventListener("change", (e) => {
        console.log("[v0] Category checkbox changed:", e.target.id, e.target.checked)
        applyFilters()
      })
    })

    // Add event listeners to price range checkboxes
    priceCheckboxes.forEach((checkbox, index) => {
      console.log("[v0] Adding listener to price checkbox:", checkbox.id)
      checkbox.addEventListener("change", (e) => {
        console.log("[v0] Price checkbox changed:", e.target.id, e.target.checked)
        applyFilters()
      })
    })

    const searchInput = document.getElementById("searchInput")
    if (searchInput) {
      const debouncedSearch = debounce(applyFilters, 500)
      searchInput.addEventListener("input", debouncedSearch)

      // Also trigger search on Enter key
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          applyFilters()
        }
      })
    }
  }

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

        // Redirect immediately
        window.location.href = "index.html"
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

        // Redirect immediately
        window.location.href = "Login.html"
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
