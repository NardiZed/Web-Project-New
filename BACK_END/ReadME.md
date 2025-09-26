# Backend Setup Instructions

## Database Setup

1. **Install PostgreSQL** if not already installed
2. **Create the database**:
   \`\`\`sql
   CREATE DATABAE Universal_Market;
   \`\`\`

3. **Run the database setup script**:
   \`\`\`bash
   psql -U postgres -d universal_market -f database-setup.sql
   \`\`\`

4. **Create a .env file** in the BACK_END folder with your database credentials:
   \`\`\`
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=universal_market
   DB_PASSWORD=your_password_here
   DB_PORT=5432
   JWT_SECRET=your-secret-key-change-in-production
   \`\`\`

## Running the Server

\`\`\`bash
cd BACK_END
node index.js
\`\`\`

The server will start on port 5000.

## API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires authentication)


CREATE DATABASE Universal_Market //be cli kalsera be gui create adrgesh the rest be cli mesrat nw

CREATE TABLE users (id SERIAL PRIMARY KEY, full_name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, phone VARCHAR(20) NOT NULL, password_hash VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE products (id SERIAL PRIMARY KEY,seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,name VARCHAR(255) NOT NULL, description TEXT, price DECIMAL(10,2) NOT NULL, category VARCHAR(100) NOT NULL, image_url VARCHAR(500), is_active BOOLEAN DEFAULT true, stock_quantity int, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE cart_items (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, product_id INTEGER REFERENCES products(id) ON DELETE CASCADE, quantity INTEGER DEFAULT 1, added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UNIQUE(user_id, product_id));


————————————————————

install these in ur side too

# Core dependencies
npm install express cors helmet morgan dotenv
npm install pg bcryptjs jsonwebtoken
npm install multer cloudinary express-validator
npm install express-rate-limit
npm install pg

# Development dependencies
npm install -D nodemon concurrently


INSERT INTO products (name, description, price, category, image_url, stock_quantity) VALUES('iPhone 14 Pro', 'Latest Apple smartphone with advanced camera system', 999.99, 'Electronics', '/placeholder.svg?height=300&width=300', 15),('Samsung Galaxy S23', 'Flagship Android smartphone with excellent display', 849.99, 'Electronics', '/placeholder.svg?height=300&width=300', 20),('MacBook Air M2', 'Lightweight laptop with Apple M2 chip', 1199.99, 'Electronics', '/placeholder.svg?height=300&width=300', 8),('Nike Air Max 270', 'Comfortable running shoes with air cushioning', 150.00, 'Clothing', '/placeholder.svg?height=300&width=300', 50),('Levi''s 501 Jeans', 'Classic straight-fit denim jeans', 89.99, 'Clothing', '/placeholder.svg?height=300&width=300', 30),('Toyota Camry 2023', 'Reliable mid-size sedan with excellent fuel economy', 25000.00, 'Vehicles', '/placeholder.svg?height=300&width=300', 5),('Honda Civic 2023', 'Compact car with modern features and efficiency', 23000.00, 'Vehicles', '/placeholder.svg?height=300&width=300', 7),('3-Bedroom House', 'Beautiful family home in quiet neighborhood', 350000.00, 'Real Estate', '/placeholder.svg?height=300&width=300', 1),('Downtown Apartment', 'Modern 2-bedroom apartment in city center', 280000.00, 'Real Estate', '/placeholder.svg?height=300&width=300', 2),('IKEA Sofa Set', 'Comfortable 3-piece living room furniture set', 899.99, 'Home Goods', '/placeholder.svg?height=300&width=300', 12),('KitchenAid Mixer', 'Professional stand mixer for baking enthusiasts', 379.99, 'Home Goods', '/placeholder.svg?height=300&width=300', 18),('Chanel Perfume', 'Luxury fragrance with elegant floral notes', 120.00, 'Cosmetics', '/placeholder.svg?height=300&width=300', 25), ('MAC Lipstick Set', 'Collection of premium lipsticks in various shades', 85.00, 'Cosmetics', '/placeholder.svg?height=300&width=300', 40);