import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Expense Tracker API',
      version: '1.0.0',
      description: 'API Documentation cho ứng dụng Theo dõi Chi tiêu & Ngân sách',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Chỉnh lại đường dẫn quét docs theo cấu trúc routers và swagger/schemas
  apis: ['./src/routers/*.ts', './src/swagger/schemas/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
