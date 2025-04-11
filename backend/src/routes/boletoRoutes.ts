import { Router } from 'express';
import { 
  getBoletos, 
  getBoletoById, 
  createBoleto, 
  updateBoleto, 
  deleteBoleto 
} from '../controllers/boletoController';

const router = Router();

/**
 * @swagger
 * /boletos:
 *   get:
 *     summary: Lista todos os boletos com filtros opcionais
 *     tags: [Boletos]
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         description: Nome do sacado (busca parcial)
 *       - in: query
 *         name: valor_inicial
 *         schema:
 *           type: number
 *         description: Valor mínimo do boleto
 *       - in: query
 *         name: valor_final
 *         schema:
 *           type: number
 *         description: Valor máximo do boleto
 *       - in: query
 *         name: id_lote
 *         schema:
 *           type: integer
 *         description: ID do lote
 *       - in: query
 *         name: relatorio
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: Se 1, retorna PDF em base64 com os boletos filtrados
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Quantidade de itens por página
 *     responses:
 *       200:
 *         description: Lista de boletos ou PDF em base64
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     boletos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Boleto'
 *                 - type: object
 *                   properties:
 *                     pdf:
 *                       type: string
 *                       description: PDF em base64 (quando relatorio=1)
 *       500:
 *         description: Erro ao buscar boletos
 */

// ... rest of the routes code ... 