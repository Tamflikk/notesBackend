export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Notes Management API',
      version: '1.0.0',
      description: 'API for managing notes and tags',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',  // Esto indica que es un token JWT
        },
      },
    },
    security: [
      {
        BearerAuth: [],  // Esta es la parte que dice que todos los endpoints requieren un Bearer Token
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};
