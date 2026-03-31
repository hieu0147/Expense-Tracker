import express, { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger/swagger';
import { errorHandler } from './middlewares/error.middleware';
import authRoutes from './routers/auth.route';
import userRoutes from './routers/user.route';
import categoryRoutes from './routers/category.route';
import transactionRoutes from './routers/transaction.route';

const app: Express = express();

// Middleware: Parse JSON & URL-encoded request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'Expense Tracker API is running' });
});

// TODO: Import and use routers
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/categories', categoryRoutes);
app.use('/transactions', transactionRoutes);
// app.use('/api/budgets', budgetRoutes);
// app.use('/api/reports', reportRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
