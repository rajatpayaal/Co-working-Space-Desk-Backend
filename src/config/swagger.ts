import { Express } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Co-working Space Desk Reservation API',
      version: '1.0.0',
      description:
        'RESTful API documentation for managing co-working spaces, user registrations, desk/space bookings, and admin workflows.',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url:
          process.env.BACKEND_URL ||
          process.env.API_BASE_URL ||
          'https://co-working-space-desk-backend.vercel.app',
        description: 'Production Server (Vercel)',
      },
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT Bearer token in the format: Bearer <token>',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/app.ts',
    './src/modules/**/*.ts',
    './src/modules/**/*.routes.ts',
    './dist/app.js',
    './dist/modules/**/*.js',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerUiOptions = {
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css',
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js',
  ],
  customSiteTitle: 'Co-working Space Desk Reservation API Docs',
};

export const setupSwagger = (app: Express): void => {
  // Swagger Page
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

  // Docs in JSON format
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};
