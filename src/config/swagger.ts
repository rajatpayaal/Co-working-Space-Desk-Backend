import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swaggerSpec.js';

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
