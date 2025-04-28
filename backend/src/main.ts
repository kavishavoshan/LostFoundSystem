import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import { Logger } from '@nestjs/common'; // Import Logger

async function bootstrap() {
  const logger = new Logger('Bootstrap'); // Create a logger instance
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend at http://localhost:3000
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = ['http://localhost:3000', 'http://localhost:3002'];
      logger.log(`CORS check: Request origin: ${origin}`); // Log the origin
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        logger.log(`CORS check passed for origin: ${origin}`);
        callback(null, true);
      } else {
        logger.warn(`CORS check failed for origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,  // If using cookies or authentication headers
  });

  logger.log('Attempting to listen on port 3001');
  await app.listen(3001);
  logger.log('Application is running on: http://localhost:3001'); // Log successful start
}
bootstrap();