import { Router } from 'express';
import upload from '../middlewares/upload';
import { processCSV } from '../services/csvService';
import { processPDF } from '../services/pdfService';
import Boleto from '../models/Boleto';
import Lote from '../models/Lote';

const router = Router();

router.post('/import-csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await processCSV(req.file.path);
    
    res.json({
      message: 'CSV processed successfully',
      details: result
    });
  } catch (error) {
    console.error('Error processing CSV:', error);
    res.status(500).json({ error: 'Error processing CSV file' });
  }
});

router.post('/import-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'File must be a PDF' });
    }

    const result = await processPDF(req.file.path);
    
    res.json({
      message: 'PDF processed successfully',
      details: result
    });
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: 'Error processing PDF file' });
  }
});

router.post('/boletos', async (req, res) => {
  try {
    const { nome_sacado, id_lote, valor, linha_digitavel } = req.body;

    // Validate required fields
    if (!nome_sacado || !id_lote || !valor || !linha_digitavel) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['nome_sacado', 'id_lote', 'valor', 'linha_digitavel']
      });
    }

    // Validate data types
    if (typeof nome_sacado !== 'string') {
      return res.status(400).json({ error: 'nome_sacado must be a string' });
    }
    if (typeof id_lote !== 'number') {
      return res.status(400).json({ error: 'id_lote must be a number' });
    }
    if (typeof valor !== 'number') {
      return res.status(400).json({ error: 'valor must be a number' });
    }
    if (typeof linha_digitavel !== 'string') {
      return res.status(400).json({ error: 'linha_digitavel must be a string' });
    }

    // Check if Lote exists
    const lote = await Lote.findByPk(id_lote);
    if (!lote) {
      return res.status(404).json({ 
        error: 'Lote not found',
        message: `No Lote found with id ${id_lote}`
      });
    }

    const boleto = await Boleto.create({
      nome_sacado,
      id_lote,
      valor,
      linha_digitavel,
      ativo: true
    });

    res.status(201).json(boleto);
  } catch (error) {
    console.error('Error creating boleto:', error);
    if (error instanceof Error) {
      res.status(500).json({ 
        error: 'Error creating boleto',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } else {
      res.status(500).json({ 
        error: 'Error creating boleto',
        details: 'Unknown error occurred'
      });
    }
  }
});

router.post('/lotes', async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'Nome do lote é obrigatório' });
    }

    const lote = await Lote.create({
      nome,
      ativo: true
    });

    res.status(201).json(lote);
  } catch (error) {
    console.error('Error creating lote:', error);
    if (error instanceof Error) {
      res.status(500).json({ 
        error: 'Error creating lote',
        details: error.message
      });
    } else {
      res.status(500).json({ error: 'Error creating lote' });
    }
  }
});

router.get('/lotes', async (req, res) => {
  try {
    const lotes = await Lote.findAll();
    res.json(lotes);
  } catch (error) {
    console.error('Error fetching lotes:', error);
    res.status(500).json({ error: 'Error fetching lotes' });
  }
});

router.get('/boletos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const boleto = await Boleto.findByPk(id);

    if (!boleto) {
      return res.status(404).json({ 
        error: 'Boleto not found',
        message: `No boleto found with id ${id}`
      });
    }

    res.json(boleto);
  } catch (error) {
    console.error('Error fetching boleto:', error);
    if (error instanceof Error) {
      res.status(500).json({ 
        error: 'Error fetching boleto',
        details: error.message
      });
    } else {
      res.status(500).json({ error: 'Error fetching boleto' });
    }
  }
});

router.get('/boletos', async (req, res) => {
  try {
    const boletos = await Boleto.findAll();
    res.json(boletos);
  } catch (error) {
    console.error('Error fetching boletos:', error);
    if (error instanceof Error) {
      res.status(500).json({ 
        error: 'Error fetching boletos',
        details: error.message
      });
    } else {
      res.status(500).json({ error: 'Error fetching boletos' });
    }
  }
});

router.get('/lotes/with-boletos', async (req, res) => {
  try {
    const lotes = await Lote.findAll({
      include: [{
        model: Boleto,
        as: 'boletos'
      }]
    });
    res.json(lotes);
  } catch (error) {
    console.error('Error fetching lotes with boletos:', error);
    if (error instanceof Error) {
      res.status(500).json({ 
        error: 'Error fetching lotes with boletos',
        details: error.message
      });
    } else {
      res.status(500).json({ error: 'Error fetching lotes with boletos' });
    }
  }
});

export default router; 