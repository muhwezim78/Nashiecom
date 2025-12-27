# Nashiecom Technologies - Backend API

A robust, production-ready backend API for the Nashiecom Technologies e-commerce platform built with **Node.js**, **Express.js**, **PostgreSQL**, and **Prisma ORM**.

## 🚀 Features

### Core Features
- **Authentication & Authorization** - JWT-based with role-based access control (Customer, Admin, Super Admin)
- **Product Management** - Full CRUD with categories, images, specs, search, and filtering
- **Order Management** - Complete order lifecycle with status tracking and history
- **Cart & Wishlist** - Persistent cart syncing between frontend and backend
- **Review System** - Customer reviews with admin moderation
- **Coupon System** - Flexible discount codes with validation
- **Contact/Support** - Message management with priority and assignment
- **Admin Dashboard** - Comprehensive analytics and statistics

### Technical Features
- 🔐 **Security** - Helmet, CORS, rate limiting, input validation
- 📝 **Logging** - Winston logger with file and console transports
- ⚡ **Performance** - Efficient Prisma queries with pagination
- 🗄️ **Database** - PostgreSQL with Prisma ORM
- 📁 **File Upload** - Multer for image uploads
- 🔄 **API Documentation** - Self-documenting endpoints

## 📋 Prerequisites

- **Node.js** >= 18.x
- **PostgreSQL** >= 14.x
- **npm** or **yarn**

## 🛠️ Installation

### 1. Navigate to backend folder
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
Copy `.env.example` to `.env` and update with your settings:
```bash
cp .env.example .env
```

**Important settings to configure:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - Change to a secure random string
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` - Admin credentials

### 4. Create uploads directory
```bash
mkdir uploads
```

### 5. Setup database
```bash
# Generate Prisma client
npm run db:generate

# Run migrations (creates tables)
npm run db:migrate

# Or push schema directly (for development)
npm run db:push

# Seed the database with initial data
npm run db:seed
```

### 6. Start the server
```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

## 📚 API Endpoints

### Health Check
```
GET /api/health - Check API and database status
GET /api - API documentation
```

### Authentication
```
POST /api/auth/register - Register new user
POST /api/auth/login - Login user
POST /api/auth/logout - Logout user
GET /api/auth/me - Get current user
POST /api/auth/refresh - Refresh token
PATCH /api/auth/update-password - Update password
PATCH /api/auth/update-me - Update profile
```

### Products
```
GET /api/products - List products (with filters, search, pagination)
GET /api/products/featured - Get featured products
GET /api/products/search?q=query - Search products
GET /api/products/:id - Get product details
GET /api/products/slug/:slug - Get product by slug
POST /api/products - Create product (Admin)
PUT /api/products/:id - Update product (Admin)
DELETE /api/products/:id - Delete product (Admin)
```

### Categories
```
GET /api/categories - List all categories
GET /api/categories/tree - Get hierarchical tree
GET /api/categories/:id/products - Get category products
POST /api/categories - Create category (Admin)
PUT /api/categories/:id - Update category (Admin)
DELETE /api/categories/:id - Delete category (Admin)
```

### Orders
```
GET /api/orders/my-orders - Get customer's orders
GET /api/orders/:id - Get order details
POST /api/orders - Create order
POST /api/orders/:id/cancel - Cancel order
GET /api/orders - List all orders (Admin)
PATCH /api/orders/:id/status - Update status (Admin)
```

### Cart
```
GET /api/cart - Get cart
POST /api/cart - Add to cart
PUT /api/cart/:productId - Update quantity
DELETE /api/cart/:productId - Remove item
DELETE /api/cart - Clear cart
POST /api/cart/sync - Sync from frontend
```

### Reviews
```
GET /api/reviews/product/:productId - Get product reviews
POST /api/reviews - Create review
PATCH /api/reviews/:id/approve - Approve review (Admin)
```

### Coupons
```
POST /api/coupons/validate - Validate coupon code
GET /api/coupons - List coupons (Admin)
POST /api/coupons - Create coupon (Admin)
```

### Dashboard (Admin)
```
GET /api/dashboard/stats - Overview statistics
GET /api/dashboard/revenue - Revenue chart data
GET /api/dashboard/orders - Order statistics
GET /api/dashboard/products/top - Top selling products
GET /api/dashboard/products/low-stock - Low stock alerts
GET /api/dashboard/customers - Customer statistics
GET /api/dashboard/recent-orders - Recent orders
GET /api/dashboard/activity - Activity feed
```

### Contact/Support
```
POST /api/contact - Submit contact message
GET /api/contact - List messages (Admin)
PATCH /api/contact/:id/status - Update status (Admin)
POST /api/contact/:id/respond - Respond (Admin)
```

### Settings
```
GET /api/settings/public - Public store settings
GET /api/settings - All settings (Admin)
PUT /api/settings/:key - Update setting (Super Admin)
```

## 🗄️ Database Schema

### Main Entities
- **User** - Customers and administrators
- **Product** - Products with images and specifications
- **Category** - Hierarchical categories
- **Order** - Orders with items and status history
- **Review** - Product reviews with moderation
- **CartItem** - Shopping cart items
- **Coupon** - Discount codes
- **ContactMessage** - Support messages
- **Setting** - Store configuration

## 🔐 Authentication

The API uses JWT tokens for authentication:

1. **Register/Login** - Returns access token
2. **Include token in requests**:
   ```
   Authorization: Bearer <token>
   ```
3. **Token stored in HTTP-only cookie** (automatic)

### Roles
- **CUSTOMER** - Regular users
- **ADMIN** - Store administrators
- **SUPER_ADMIN** - Full access including settings

## 📦 Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server
npm run db:generate # Generate Prisma client
npm run db:migrate  # Run migrations
npm run db:push     # Push schema to database
npm run db:seed     # Seed database
npm run db:studio   # Open Prisma Studio
npm run db:reset    # Reset and reseed database
```

## 🌐 CORS Configuration

The API is configured to accept requests from `http://localhost:5173` by default.
Update `FRONTEND_URL` in `.env` for production.

## 📝 Admin Credentials

After seeding, login with:
- **Email**: admin@nashiecom.tech
- **Password**: Admin@123456

⚠️ **Change these immediately in production!**

## 🔒 Security Features

- **Helmet** - Security headers
- **Rate Limiting** - 100 requests/15 minutes
- **CORS** - Configured for frontend origin
- **Input Validation** - express-validator
- **Password Hashing** - bcryptjs with salt
- **SQL Injection Prevention** - Prisma parameterized queries

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.js          # Database seeding
├── src/
│   ├── config/
│   │   ├── database.js  # Prisma client
│   │   └── logger.js    # Winston logger
│   ├── controllers/     # Route handlers
│   ├── middleware/
│   │   ├── auth.js      # JWT authentication
│   │   ├── errorHandler.js
│   │   ├── notFound.js
│   │   └── validate.js
│   ├── routes/          # API routes
│   └── server.js        # Express app
├── uploads/             # Uploaded files
├── .env                 # Environment variables
├── .env.example         # Example config
└── package.json
```

## 🚀 Deployment

1. Set `NODE_ENV=production`
2. Update `DATABASE_URL` to production database
3. Set strong `JWT_SECRET`
4. Configure `FRONTEND_URL` for CORS
5. Run migrations: `npm run db:migrate`
6. Start: `npm start`

## 📄 License

MIT License - Nashiecom Technologies
