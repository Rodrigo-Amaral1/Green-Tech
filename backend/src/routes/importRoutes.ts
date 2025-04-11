import { Router } from 'express';
import upload from '../middlewares/upload';
import { processCSV } from '../services/csvService';
import { processPDF } from '../services/pdfService';

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

export default router; 