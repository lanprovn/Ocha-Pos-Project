# 🍵 OCHA POS System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

**A modern, full-stack Point of Sale (POS) system designed for Vietnamese cafes and restaurants**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [API Documentation](#-api-documentation) • [Deployment](#-deployment)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## 🎯 Overview

**OCHA POS System** is a comprehensive Point of Sale solution built with modern web technologies. It provides a complete solution for managing orders, inventory, customers, and reporting for cafes and restaurants in Vietnam.

### Key Highlights

- ✅ **Real-time Updates** - Live order status synchronization using Socket.io
- ✅ **Inventory Management** - Automatic stock deduction with recipe-based system
- ✅ **Comprehensive Reporting** - Detailed analytics with Excel export
- ✅ **Customer Loyalty** - Points system with membership tiers
- ✅ **Multi-payment Support** - Cash, Card, and QR code payments
- ✅ **Modern UI/UX** - Responsive design with Tailwind CSS

---

## ✨ Features

### 🛒 Order Management
- Create and manage orders with real-time status updates
- Support for product sizes and toppings
- Order hold/resume functionality
- Order status tracking: CREATING → PENDING → CONFIRMED → PREPARING → READY → COMPLETED
- Customer information and table management

### 📦 Inventory Management
- Product and ingredient stock tracking
- Automatic stock deduction on order creation
- Recipe-based inventory (BOM - Bill of Materials)
- Low stock and out-of-stock alerts
- Stock transaction history
- Manual stock adjustments

### 📊 Reporting & Analytics
- Revenue reports (daily/weekly/monthly/custom)
- Best-selling products analysis
- Peak hours analysis
- Payment method statistics
- Excel export with 9 detailed sheets
- Real-time dashboard statistics

### 👥 Customer Management
- Customer database with profiles
- Loyalty points system
- Membership levels: Bronze → Silver → Gold → Platinum
- Customer order history
- Customer tags and notes

### 💳 Payment Processing
- Cash payments
- Card payments
- QR code payments (VNPay, MoMo, ZaloPay)
- Payment status tracking

### 📺 Order Display
- Real-time order display screen
- Automatic updates via Socket.io
- Color-coded order status
- Perfect for kitchen/bar displays

### 🔐 Security & Authentication
- JWT-based authentication
- Role-based access control (ADMIN, STAFF, CUSTOMER)
- Password hashing with bcrypt
- Input validation with Zod
- Rate limiting
- CORS protection

---

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js (>=20.0.0)
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma 5.0
- **Database:** PostgreSQL
- **Real-time:** Socket.io
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Zod
- **File Upload:** Multer + Cloudinary
- **Excel Export:** ExcelJS
- **API Docs:** Swagger/OpenAPI
- **Logging:** Winston

### Frontend
- **Framework:** React 19
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS 4
- **UI Components:** Headless UI, Flowbite React
- **Icons:** Heroicons, Lucide React
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Real-time:** Socket.io Client
- **Routing:** React Router v7
- **Notifications:** React Hot Toast

### DevOps & Tools
- **Package Manager:** npm workspaces
- **Version Control:** Git
- **Deployment:** Railway.app
- **Database Migrations:** Prisma Migrate
- **Testing:** Jest (Backend), Vitest (Frontend)

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.0.0 ([Download](https://nodejs.org/))
- **npm** >= 10.0.0 (comes with Node.js)
- **PostgreSQL** >= 14.0 ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))

### Optional (for production)
- **Cloudinary account** (for image storage)
- **Railway account** (for deployment)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ocha-pos-project.git
cd ocha-pos-project
```

### 2. Install Dependencies

```bash
# Install all dependencies (backend, frontend, shared-types)
npm install

# Or install individually
npm install --workspace=backend
npm install --workspace=frontend
```

### 3. Set Up Database

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ocha_pos;

# Exit psql
\q
```

#### Run Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with sample data (optional)
npm run prisma:seed
```

### 4. Configure Environment Variables

#### Backend Configuration

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env  # If .env.example exists
```

Edit `.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=8080

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ocha_pos?schema=public"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"
JWT_EXPIRES_IN="7d"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:8080"

# Logging
LOG_LEVEL="info"

# Cloudinary (Optional - for image storage)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Bank QR Code (Optional)
BANK_CODE="970422"
BANK_ACCOUNT_NUMBER="1234567890"
BANK_ACCOUNT_NAME="Your Name"
QR_TEMPLATE="print"
```

#### Frontend Configuration

Create a `.env` file in the `frontend/` directory:

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## ⚙️ Configuration

### Database Configuration

The database schema is defined in `backend/prisma/schema.prisma`. Key models include:

- **Users** - System users (ADMIN, STAFF, CUSTOMER)
- **Products** - Menu items with sizes and toppings
- **Categories** - Product categories
- **Orders** - Order management
- **OrderItems** - Order line items
- **Stock** - Product inventory
- **Ingredients** - Recipe ingredients
- **ProductRecipes** - Bill of Materials (BOM)
- **Customers** - Customer database
- **LoyaltyTransactions** - Points history

### Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Open Prisma Studio (Database GUI)
npm run prisma:studio

# Seed database
npm run prisma:seed
```

---

## 💻 Usage

### Development Mode

#### Start Both Backend and Frontend

```bash
# Start both servers concurrently
npm run dev
```

#### Start Individually

```bash
# Backend only (runs on http://localhost:8080)
npm run dev:backend

# Frontend only (runs on http://localhost:5173)
npm run dev:frontend
```

### Production Build

```bash
# Build both backend and frontend
npm run build

# Build individually
npm run build:backend
npm run build:frontend
```

### Start Production Server

```bash
# Start backend server
npm run start:backend

# Preview frontend (after build)
npm run preview
```

### Available Scripts

```bash
# Development
npm run dev              # Start both backend and frontend
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only

# Building
npm run build            # Build all workspaces
npm run build:backend    # Build backend only
npm run build:frontend   # Build frontend only

# Production
npm run start            # Start backend server
npm run start:backend    # Start backend server
npm run preview          # Preview frontend build

# Testing
npm run test             # Run all tests
npm run test:backend     # Run backend tests
npm run test:frontend    # Run frontend tests

# Database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database

# Utilities
npm run lint             # Lint all workspaces
npm run clean            # Clean node_modules
```

---

## 📚 API Documentation

### Base URL

- **Development:** `http://localhost:8080/api`
- **Production:** `https://your-domain.com/api`

### Interactive API Documentation

Once the backend server is running, visit:
- **Swagger UI:** `http://localhost:8080/api-docs`

### Main API Endpoints

#### Authentication
```
POST   /api/users/register     # Register new user
POST   /api/users/login         # Login
GET    /api/users/me            # Get current user
```

#### Products
```
GET    /api/products            # Get all products
GET    /api/products/:id       # Get product by ID
POST   /api/products           # Create product (ADMIN/STAFF)
PUT    /api/products/:id       # Update product (ADMIN/STAFF)
DELETE /api/products/:id       # Delete product (ADMIN)
```

#### Categories
```
GET    /api/categories         # Get all categories
GET    /api/categories/:id     # Get category by ID
POST   /api/categories         # Create category (ADMIN/STAFF)
PUT    /api/categories/:id     # Update category (ADMIN/STAFF)
DELETE /api/categories/:id     # Delete category (ADMIN)
```

#### Orders
```
POST   /api/orders/draft       # Create/update draft order
POST   /api/orders             # Create new order
GET    /api/orders             # Get all orders (with filters)
GET    /api/orders/:id         # Get order by ID
PATCH  /api/orders/:id/status  # Update order status
GET    /api/orders/today       # Get today's orders
GET    /api/orders/date/:date  # Get orders by date
```

#### Stock Management
```
GET    /api/stock/products           # Get product stock
GET    /api/stock/products/:id       # Get product stock by ID
PUT    /api/stock/products/:id       # Update product stock
GET    /api/stock/ingredients        # Get ingredient stock
GET    /api/stock/transactions       # Get stock transactions
GET    /api/stock/alerts             # Get stock alerts
POST   /api/stock/adjust             # Manual stock adjustment
```

#### Reporting
```
GET    /api/reporting                # Get report data
GET    /api/reporting/export         # Export report to Excel
```

Query Parameters:
- `startDate` (required): YYYY-MM-DD
- `endDate` (required): YYYY-MM-DD
- `reportType` (optional): daily|weekly|monthly|custom

#### Dashboard
```
GET    /api/dashboard/stats          # Get dashboard statistics
GET    /api/dashboard/daily-sales   # Get daily sales data
```

#### Payment
```
POST   /api/payment                 # Create payment
GET    /api/payment/callback        # Payment callback
```

### Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### Example API Request

```bash
# Get all products
curl http://localhost:8080/api/products

# Create an order (with authentication)
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [
      {
        "productId": "product-id",
        "quantity": 2,
        "selectedSize": "M",
        "selectedToppings": ["topping-id"]
      }
    ],
    "customerName": "John Doe",
    "customerPhone": "0123456789",
    "paymentMethod": "CASH"
  }'
```

---

## 🧪 Testing

### Backend Tests

```bash
# Run all backend tests
npm run test:backend

# Run tests in watch mode
npm run test:backend -- --watch

# Run tests with coverage
npm run test:backend -- --coverage
```

### Frontend Tests

```bash
# Run all frontend tests
npm run test:frontend

# Run tests in UI mode
npm run test:frontend -- --ui

# Run tests with coverage
npm run test:frontend -- --coverage
```

### Test Structure

```
backend/tests/
├── unit/              # Unit tests
│   ├── services/     # Service layer tests
│   └── utils/        # Utility function tests
└── integration/      # Integration tests

frontend/src/
└── [Component].test.tsx  # Component tests
```

---

## 🚢 Deployment

### Railway Deployment

This project is configured for Railway.app deployment.

#### Backend Deployment

1. Create a new Railway project
2. Connect your GitHub repository
3. Set the root directory to `backend`
4. Add environment variables (see Configuration section)
5. Railway will automatically detect and deploy

#### Frontend Deployment

1. Create a new Railway service for frontend
2. Set root directory to `frontend`
3. Set build command: `npm run build`
4. Set start command: `npm run preview`
5. Add environment variables:
   - `VITE_API_BASE_URL`: Your backend API URL

### Environment Variables for Production

Ensure these are set in your deployment platform:

**Backend:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT (min 32 characters)
- `FRONTEND_URL` - Frontend URL for CORS
- `NODE_ENV=production`

**Frontend:**
- `VITE_API_BASE_URL` - Backend API URL

### Database Migration in Production

```bash
# Run migrations in production
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate
```

---

## 📁 Project Structure

```
ocha-pos-project/
├── backend/                    # Backend application
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Express middleware
│   │   ├── config/           # Configuration files
│   │   ├── socket/           # Socket.io setup
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Utility functions
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── migrations/       # Database migrations
│   ├── tests/                 # Test files
│   └── package.json
│
├── frontend/                  # Frontend application
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React Context
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── router/          # Routing
│   │   └── types/           # TypeScript types
│   └── package.json
│
├── shared-types/              # Shared TypeScript types
│   └── src/
│
├── package.json              # Root package.json (workspaces)
└── README.md                 # This file
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request**

### Code Style

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Write tests for new features
- Follow the existing code structure

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💬 Support

For support, email lanprovn@gmail.com or open an issue in the GitHub repository.

### Useful Links

- **API Documentation:** `http://localhost:8080/api-docs` (when running locally)
- **Prisma Studio:** Run `npm run prisma:studio` to open database GUI
- **GitHub Issues:** [Report a bug or request a feature](https://github.com/yourusername/ocha-pos-project/issues)

---

## 🙏 Acknowledgments

- Built with ❤️ using modern web technologies
- Inspired by the need for efficient POS systems in Vietnamese cafes and restaurants
- Thanks to all open-source contributors whose libraries made this project possible

---

<div align="center">

**Made with ❤️ by [Lan Pro](mailto:lanprovn@gmail.com)**

⭐ Star this repo if you find it helpful!

</div>
