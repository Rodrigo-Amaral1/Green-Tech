import { Router } from 'express';
import { 
  getBoletos, 
  getBoletoById, 
  createBoleto, 
  updateBoleto, 
  deleteBoleto 
} from '../controllers/boletoController';

const router = Router();

