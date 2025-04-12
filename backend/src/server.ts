import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { sequelize } from './config/database';
import syncDatabase from './config/sync';
import Lote from './models/Lote';
import Boleto from './models/Boleto';
import importRoutes from './routes/importRoutes';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Test database connection and sync
sequelize.authenticate()
  .then(async () => {
    console.log('Database connection has been established successfully.');
    await syncDatabase();
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Mount all routes under /api prefix
app.use('/api', importRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Green-Tech API' });
});

// Test endpoint for Lotes
app.get('/lotes', async (req, res) => {
  try {
    const lotes = await Lote.findAll();
    res.json(lotes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching lotes' });
  }
});

// Test endpoint for Boletos
app.get('/boletos', async (req, res) => {
  try {
    const boletos = await Boleto.findAll();
    res.json(boletos);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching boletos' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 