# OCHA POS

A modern, full-featured Point of Sale system built for Vietnamese cafes and restaurants. Fast, reliable, and designed with real-world operations in mind.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## What is OCHA POS?

OCHA POS is a complete point-of-sale solution that handles everything from taking orders to managing inventory. Built specifically for the Vietnamese market, it supports local payment methods, Vietnamese language throughout, and workflows that match how cafes and restaurants actually operate.

Think of it as your all-in-one restaurant management system. Staff can take orders on tablets, the kitchen sees orders instantly, managers get real-time sales reports, and everything syncs automatically.

## Features

### Core POS Operations
- **Product Management** - Full catalog with categories, variants, sizes, and toppings
- **Order Processing** - Create, modify, and track orders with real-time updates
- **Kitchen Display** - Live order board for kitchen staff
- **Payment Processing** - Cash, card, and QR code payments (VietinBank integration)
- **Receipt Printing** - Generate and print receipts instantly

### Business Intelligence
- **Dashboard Analytics** - Real-time sales, revenue, and performance metrics
- **Revenue Reports** - Daily, weekly, monthly summaries with export to Excel
- **Order History** - Complete order tracking with search and filters
- **Product Performance** - Track bestsellers and slow movers

### Inventory & Operations
- **Stock Management** - Track product and ingredient inventory
- **Low Stock Alerts** - Automatic notifications when items run low
- **Recipe Management** - Link products to ingredients for cost tracking
- **User Management** - Role-based access (Admin, Staff, Customer)

### Technical Features
- **Real-time Updates** - Socket.io powered live synchronization
- **Offline Support** - Works even when connection is spotty
- **Multi-device** - Use on tablets, phones, or desktop
- **API Documentation** - Complete Swagger/OpenAPI docs
- **Type Safety** - Full TypeScript coverage

## Tech Stack

### Frontend
- **React 19** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Lightning-fast build tool
- **Socket.io Client** - Real-time communication
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe backend code
- **PostgreSQL** - Relational database
- **Prisma** - Modern ORM with type generation
- **Socket.io** - Real-time server
- **JWT** - Authentication
- **Swagger** - API documentation

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lanprovn/Ocha-Pos-Project.git
   cd Ocha-Pos-Project
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file (or use create-env.ps1 script)
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Generate Prisma Client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   
   # Seed database (optional)
   npm run prisma:seed
   
   # Start backend server
   npm run dev
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   
   # Start development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080
   - API Docs: http://localhost:8080/api-docs

### Default Credentials
- **Admin**: `admin@ocha.com` / `admin123`
- **Staff**: `staff@ocha.com` / `staff123`

## Project Structure

```
Ocha-Pos-Project/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, validation
│   │   └── config/         # Database, env
│   ├── prisma/             # Database schema & migrations
│   └── tests/              # Unit & integration tests
│
├── frontend/               # React application
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── services/       # API clients
│   │   ├── context/        # State management
│   │   └── hooks/          # Custom React hooks
│   └── public/             # Static assets
│
└── docs/                   # Documentation
```

## API Overview

The backend exposes a RESTful API organized into logical modules:

- **`/api/auth`** - Authentication (login, current user)
- **`/api/users`** - User management (Admin only)
- **`/api/products`** - Product catalog
- **`/api/categories`** - Product categories
- **`/api/orders`** - Order management
- **`/api/dashboard`** - Analytics and stats
- **`/api/reports`** - Revenue reports and exports
- **`/api/stock`** - Inventory management
- **`/api/payment`** - Payment processing
- **`/api/recipes`** - Recipe management
- **`/api/upload`** - File uploads

Full API documentation is available at `/api-docs` when the backend is running.

## Development

### Backend Scripts
```bash
npm run dev          # Start development server with hot reload
npm run dev:clean    # Kill port conflicts and start server
npm run build        # Build for production
npm run start        # Run production build
npm test             # Run tests
npm run prisma:studio # Open Prisma Studio (database GUI)
```

### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run tests
```

## Architecture

The system follows a clean architecture pattern:

- **Controllers** handle HTTP requests and responses
- **Services** contain business logic
- **Routes** define API endpoints
- **Middleware** handles cross-cutting concerns (auth, validation)
- **Prisma** manages database access with type safety

Real-time features use Socket.io for instant updates across all connected clients. The frontend uses React Context for state management, keeping components simple and maintainable.

## Security

- JWT-based authentication with secure token storage
- Role-based access control (Admin, Staff, Customer)
- Password hashing with bcrypt
- Input sanitization to prevent XSS attacks
- CORS protection
- Rate limiting on API endpoints
- Helmet.js for secure HTTP headers

## Database

The system uses PostgreSQL with Prisma ORM. The schema includes:

- Users and authentication
- Products and categories
- Orders and order items
- Stock and inventory
- Recipes and ingredients
- Payment records

Migrations are included in the repository for easy setup. Use `npm run prisma:migrate` to apply them.

## Contributing

This is a private project, but if you have access and want to contribute:

1. Create a feature branch
2. Make your changes
3. Write or update tests
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

Built with ❤️ for Vietnamese businesses

