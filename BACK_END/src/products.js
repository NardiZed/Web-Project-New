const pool = require("./database")

// Get all products with optional filtering
const getProducts = async (req, res) => {
  try {
    const { categories, minPrice, maxPrice, search } = req.query

    let query = "SELECT * FROM products WHERE is_active = true"
    const queryParams = []
    let paramCount = 0

    // Filter by categories
    if (categories && categories.length > 0) {
      const categoryArray = Array.isArray(categories) ? categories : categories.split(",")
      const categoryPlaceholders = categoryArray.map(() => `$${++paramCount}`).join(",")
      query += ` AND category IN (${categoryPlaceholders})`
      queryParams.push(...categoryArray)
    }

    // Filter by price range
    if (minPrice) {
      query += ` AND price >= $${++paramCount}`
      queryParams.push(Number.parseFloat(minPrice))
    }
    if (maxPrice) {
      query += ` AND price <= $${++paramCount}`
      queryParams.push(Number.parseFloat(maxPrice))
    }

    // Search by name or description
    if (search) {
      query += ` AND (name ILIKE $${++paramCount} OR description ILIKE $${++paramCount})`
      queryParams.push(`%${search}%`, `%${search}%`)
    }

    query += " ORDER BY created_at DESC"

    console.log("[PRODUCTS] Executing query:", query)
    console.log("[PRODUCTS] Query params:", queryParams)

    const result = await pool.query(query, queryParams)

    res.json({
      success: true,
      products: result.rows,
      count: result.rows.length,
    })
  } catch (error) {
    console.error("[PRODUCTS] Error fetching products:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch products",
      message: error.message,
    })
  }
}

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query("SELECT * FROM products WHERE id = $1 AND is_active = true", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      })
    }

    res.json({
      success: true,
      product: result.rows[0],
    })
  } catch (error) {
    console.error("[PRODUCTS] Error fetching product:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch product",
      message: error.message,
    })
  }
}

// Get all unique categories
const getCategories = async (req, res) => {
  try {
    const result = await pool.query("SELECT DISTINCT category FROM products WHERE is_active = true ORDER BY category")

    res.json({
      success: true,
      categories: result.rows.map((row) => row.category),
    })
  } catch (error) {
    console.error("[PRODUCTS] Error fetching categories:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch categories",
      message: error.message,
    })
  }
}

const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, image_url, stock_quantity } = req.body
    const seller_id = req.user ? req.user.userId : 1 // Default to user 1 if no auth

    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        error: "Name, price, and category are required",
      })
    }

    const result = await pool.query(
      "INSERT INTO products (seller_id, name, description, price, category, image_url, stock_quantity) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [seller_id, name, description, Number.parseFloat(price), category, image_url, stock_quantity || 1],
    )

    res.status(201).json({
      success: true,
      product: result.rows[0],
      message: "Product added successfully",
    })
  } catch (error) {
    console.error("[PRODUCTS] Error adding product:", error)
    res.status(500).json({
      success: false,
      error: "Failed to add product",
      message: error.message,
    })
  }
}

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  addProduct,
}
