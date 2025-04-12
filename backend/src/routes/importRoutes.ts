import { Router } from 'express';
import upload from '../middlewares/upload';
import { processCSV } from '../services/csvService';
import { processPDF } from '../services/pdfService';
import Boleto from '../models/Boleto';
import Lote from '../models/Lote';
import fs from 'fs';

const router = Router();

router.post('/import-csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        message: 'Por favor, envie um arquivo CSV'
      });
    }

    // Verifica se o arquivo é CSV
    if (!req.file.originalname.endsWith('.csv')) {
      fs.unlinkSync(req.file.path); // Remove o arquivo
      return res.status(400).json({ 
        error: 'Invalid file type',
        message: 'O arquivo deve ser um CSV'
      });
    }

    const result = await processCSV(req.file.path);
    
    // Remove o arquivo após processamento
    fs.unlinkSync(req.file.path);

    if (result.errors > 0) {
      res.status(207).json({
        message: 'Processamento concluído com erros',
        ...result
      });
    } else {
      res.json({
        message: 'CSV processado com sucesso',
        ...result
      });
    }
  } catch (error) {
    console.error('Error processing CSV:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path); // Remove o arquivo em caso de erro
    }
    res.status(500).json({ 
      error: 'Error processing CSV file',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
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
    console.log('Dados recebidos:', req.body);
    const { nome_sacado, id_lote, valor, linha_digitavel } = req.body;

    // Validate required fields
    if (!nome_sacado || !id_lote || !valor || !linha_digitavel) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['nome_sacado', 'id_lote', 'valor', 'linha_digitavel'],
        received: req.body
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

    console.log('Criando boleto com dados:', {
      nome_sacado,
      id_lote,
      valor,
      linha_digitavel
    });

    const boleto = await Boleto.create({
      nome_sacado,
      id_lote,
      valor,
      linha_digitavel,
      ativo: true
    });

    console.log('Boleto criado com sucesso:', boleto.toJSON());

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