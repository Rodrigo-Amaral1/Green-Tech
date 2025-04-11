import { Request, Response } from 'express';
import { Boleto } from '../models/Boleto';
import { Lote } from '../models/Lote';
import { PDFDocument } from 'pdf-lib';
import { Op } from 'sequelize';
import PDFKit from 'pdfkit';

export const getBoletos = async (req: Request, res: Response) => {
  try {
    const { 
      nome, 
      valor_inicial, 
      valor_final, 
      id_lote, 
      relatorio,
      page = 1,
      limit = 10 
    } = req.query;

    const where: any = {};

    // Aplicar filtros
    if (nome) {
      where.nome_sacado = {
        [Op.iLike]: `%${nome}%`
      };
    }

    if (valor_inicial && valor_final) {
      where.valor = {
        [Op.between]: [Number(valor_inicial), Number(valor_final)]
      };
    } else if (valor_inicial) {
      where.valor = {
        [Op.gte]: Number(valor_inicial)
      };
    } else if (valor_final) {
      where.valor = {
        [Op.lte]: Number(valor_final)
      };
    }

    if (id_lote) {
      where.id_lote = id_lote;
    }

    // Se relatorio=1, retorna PDF
    if (relatorio === '1') {
      const boletos = await Boleto.findAll({
        where,
        include: [{
          model: Lote,
          as: 'lote'
        }],
        order: [['createdAt', 'DESC']]
      });

      // Criar PDF com PDFKit
      const doc = new PDFKit();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));

      // Configurar fonte e tamanho
      doc.font('Helvetica-Bold');
      doc.fontSize(20);

      // Cabeçalho
      doc.text('Relatório de Boletos', { align: 'center' });
      doc.moveDown();

      // Informações do filtro
      doc.fontSize(12);
      doc.font('Helvetica');
      doc.text(`Data: ${new Date().toLocaleDateString()}`);
      if (nome) doc.text(`Filtro por nome: ${nome}`);
      if (valor_inicial || valor_final) {
        doc.text(`Faixa de valor: ${valor_inicial || '0'} - ${valor_final || '∞'}`);
      }
      if (id_lote) doc.text(`Lote: ${id_lote}`);
      doc.moveDown();

      // Configurar tabela
      const tableTop = doc.y;
      const tableLeft = 50;
      const colWidth = 150;
      const rowHeight = 30;

      // Cabeçalho da tabela
      doc.font('Helvetica-Bold');
      doc.fontSize(10);
      doc.text('Nome do Sacado', tableLeft, tableTop);
      doc.text('Valor', tableLeft + colWidth, tableTop);
      doc.text('Lote', tableLeft + colWidth * 2, tableTop);
      doc.text('Data', tableLeft + colWidth * 3, tableTop);

      // Linha divisória
      doc.moveTo(tableLeft, tableTop + rowHeight)
         .lineTo(tableLeft + colWidth * 4, tableTop + rowHeight)
         .stroke();

      // Dados da tabela
      doc.font('Helvetica');
      let y = tableTop + rowHeight;

      boletos.forEach((boleto) => {
        // Verificar se precisa de nova página
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        doc.text(boleto.nome_sacado, tableLeft, y);
        doc.text(`R$ ${boleto.valor.toFixed(2)}`, tableLeft + colWidth, y);
        doc.text(boleto.lote?.nome || 'N/A', tableLeft + colWidth * 2, y);
        doc.text(boleto.createdAt.toLocaleDateString(), tableLeft + colWidth * 3, y);

        y += rowHeight;
      });

      // Finalizar PDF
      doc.end();

      // Converter para base64
      const pdfBuffer = Buffer.concat(chunks);
      const base64Pdf = pdfBuffer.toString('base64');

      return res.json({
        pdf: base64Pdf
      });
    }

    // Caso contrário, retorna paginação normal
    const offset = (Number(page) - 1) * Number(limit);
    
    const { count, rows } = await Boleto.findAndCountAll({
      where,
      include: [{
        model: Lote,
        as: 'lote'
      }],
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      total: count,
      page: Number(page),
      limit: Number(limit),
      boletos: rows
    });
  } catch (error) {
    console.error('Error fetching boletos:', error);
    res.status(500).json({ error: 'Error fetching boletos' });
  }
};

// ... rest of the controller code ... 