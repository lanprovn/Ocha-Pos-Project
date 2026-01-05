import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OCHA POS Backend API',
      version: '1.0.0',
      description: 'API documentation for OCHA POS System - A Point of Sale system for restaurants/cafes',
      contact: {
        name: 'API Support',
        email: 'lanprovn@gmail.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:8080/api',
        description: 'Development server',
      },
      {
        url: 'https://api.ocha-pos.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"',
        },
      },
      schemas: {
        // Error Schemas
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
              },
              description: 'Validation error details',
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Validation error',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },

        // User Schemas
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'STAFF'],
              description: 'User role',
            },
            isActive: {
              type: 'boolean',
              description: 'Whether user is active',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'staff@ocha.com',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'staff123',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'JWT token for authentication',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },

        // Product Schemas
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
              example: 'Trà sữa truyền thống',
            },
            price: {
              type: 'number',
              format: 'decimal',
              example: 38000,
            },
            description: {
              type: 'string',
              nullable: true,
            },
            image: {
              type: 'string',
              format: 'uri',
              nullable: true,
            },
            categoryId: {
              type: 'string',
              format: 'uuid',
            },
            category: {
              $ref: '#/components/schemas/Category',
            },
            isActive: {
              type: 'boolean',
              default: true,
            },
            sizes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  extraPrice: { type: 'number' },
                },
              },
            },
            toppings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  extraPrice: { type: 'number' },
                },
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        CreateProductRequest: {
          type: 'object',
          required: ['name', 'price', 'categoryId'],
          properties: {
            name: { type: 'string' },
            price: { type: 'number' },
            description: { type: 'string', nullable: true },
            image: { type: 'string', nullable: true },
            categoryId: { type: 'string', format: 'uuid' },
            isActive: { type: 'boolean', default: true },
            sizes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  extraPrice: { type: 'number' },
                },
              },
            },
            toppings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  extraPrice: { type: 'number' },
                },
              },
            },
          },
        },

        // Category Schemas
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
              example: 'Trà sữa',
            },
            description: {
              type: 'string',
              nullable: true,
            },
            image: {
              type: 'string',
              format: 'uri',
              nullable: true,
            },
            productCount: {
              type: 'number',
              description: 'Number of products in this category',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        CreateCategoryRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            image: { type: 'string', nullable: true },
          },
        },

        // Order Schemas
        OrderItem: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            productId: {
              type: 'string',
              format: 'uuid',
            },
            quantity: {
              type: 'number',
              minimum: 1,
            },
            price: {
              type: 'string',
              format: 'decimal',
            },
            subtotal: {
              type: 'string',
              format: 'decimal',
            },
            selectedSize: {
              type: 'string',
              nullable: true,
            },
            selectedToppings: {
              type: 'array',
              items: { type: 'string' },
            },
            note: {
              type: 'string',
              nullable: true,
            },
            product: {
              $ref: '#/components/schemas/Product',
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            orderNumber: {
              type: 'string',
              example: 'ORD-123456',
            },
            status: {
              type: 'string',
              enum: ['CREATING', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'],
            },
            totalAmount: {
              type: 'string',
              format: 'decimal',
            },
            customerName: {
              type: 'string',
              nullable: true,
            },
            customerPhone: {
              type: 'string',
              nullable: true,
            },
            customerTable: {
              type: 'string',
              nullable: true,
            },
            notes: {
              type: 'string',
              nullable: true,
            },
            paymentMethod: {
              type: 'string',
              enum: ['CASH', 'CARD', 'QR'],
              nullable: true,
            },
            paymentStatus: {
              type: 'string',
              enum: ['PENDING', 'SUCCESS', 'FAILED'],
            },
            orderCreator: {
              type: 'string',
              enum: ['STAFF', 'CUSTOMER'],
            },
            orderCreatorName: {
              type: 'string',
              nullable: true,
            },
            paidAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/OrderItem',
              },
            },
          },
        },
        CreateOrderRequest: {
          type: 'object',
          required: ['items'],
          properties: {
            customerName: { type: 'string', nullable: true },
            customerPhone: { type: 'string', nullable: true },
            customerTable: { type: 'string', nullable: true },
            notes: { type: 'string', nullable: true },
            paymentMethod: {
              type: 'string',
              enum: ['CASH', 'CARD', 'QR'],
            },
            paymentStatus: {
              type: 'string',
              enum: ['PENDING', 'SUCCESS', 'FAILED'],
            },
            orderCreator: {
              type: 'string',
              enum: ['STAFF', 'CUSTOMER'],
            },
            orderCreatorName: { type: 'string', nullable: true },
            items: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['productId', 'quantity', 'price', 'subtotal'],
                properties: {
                  productId: { type: 'string', format: 'uuid' },
                  quantity: { type: 'number', minimum: 1 },
                  price: { type: 'number', minimum: 0 },
                  subtotal: { type: 'number', minimum: 0 },
                  selectedSize: { type: 'string', nullable: true },
                  selectedToppings: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  note: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        UpdateOrderStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'],
            },
          },
        },

        // Stock Schemas
        ProductStock: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            productId: { type: 'string', format: 'uuid' },
            quantity: { type: 'number', minimum: 0 },
            minStock: { type: 'number', minimum: 0 },
            product: { $ref: '#/components/schemas/Product' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        IngredientStock: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            ingredientId: { type: 'string', format: 'uuid' },
            quantity: { type: 'number', minimum: 0 },
            minStock: { type: 'number', minimum: 0 },
            unit: { type: 'string' },
            ingredient: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        StockTransaction: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            type: {
              type: 'string',
              enum: ['IN', 'OUT', 'ADJUSTMENT'],
            },
            productId: { type: 'string', format: 'uuid', nullable: true },
            ingredientId: { type: 'string', format: 'uuid', nullable: true },
            quantity: { type: 'number' },
            reason: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        // Dashboard Schemas
        DashboardStats: {
          type: 'object',
          properties: {
            overview: {
              type: 'object',
              properties: {
                totalProducts: { type: 'number' },
                totalIngredients: { type: 'number' },
                totalOrders: { type: 'number' },
                todayOrders: { type: 'number' },
                todayRevenue: { type: 'string' },
                totalRevenue: { type: 'string' },
                averageOrderValue: { type: 'string' },
              },
            },
            ordersByStatus: {
              type: 'object',
            },
            paymentStats: {
              type: 'object',
            },
            topProducts: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
            hourlyRevenue: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
            lowStock: {
              type: 'object',
              properties: {
                products: { type: 'array' },
                ingredients: { type: 'array' },
              },
            },
            recentOrders: {
              type: 'array',
              items: { $ref: '#/components/schemas/Order' },
            },
          },
        },

        // Health Check Schema
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['ok', 'error'],
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
            uptime: {
              type: 'number',
              description: 'Server uptime in seconds',
            },
            memory: {
              type: 'object',
            },
            database: {
              type: 'string',
              enum: ['connected', 'disconnected'],
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints',
      },
      {
        name: 'Users',
        description: 'User management endpoints',
      },
      {
        name: 'Products',
        description: 'Product management endpoints',
      },
      {
        name: 'Categories',
        description: 'Category management endpoints',
      },
      {
        name: 'Orders',
        description: 'Order management endpoints',
      },
      {
        name: 'Stock',
        description: 'Stock management endpoints',
      },
      {
        name: 'Dashboard',
        description: 'Dashboard statistics endpoints',
      },
      {
        name: 'Payment',
        description: 'Payment gateway integration endpoints',
      },
      {
        name: 'Recipes',
        description: 'Recipe management endpoints',
      },
      {
        name: 'Upload',
        description: 'File upload endpoints',
      },
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
    ],
  },
  apis: [
    './src/api/routes/v1/*.ts',
    './src/api/controllers/*.ts',
    './src/core/app.ts',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

