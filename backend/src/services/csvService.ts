import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import Lote from '../models/Lote';
import Boleto from '../models/Boleto';

interface CSVRow {
  nome_sacado: string;
  id_lote: string;
  valor: string;
  linha_digitavel: string;
}

export const processCSV = async (filePath: string): Promise<{ success: number; errors: number }> => {
  let successCount = 0;
  let errorCount = 0;

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', async (row: CSVRow) => {
        try {
          // Formata o id_lote para ter 4 dígitos
          const formattedIdLote = row.id_lote.padStart(4, '0');
          
          // Busca o lote no banco
          const lote = await Lote.findOne({ where: { nome: formattedIdLote } });
          
          if (!lote) {
            console.error(`Lote não encontrado: ${formattedIdLote}`);
            errorCount++;
            return;
          }

          // Cria o boleto
          await Boleto.create({
            nome_sacado: row.nome_sacado,
            id_lote: lote.id,
            valor: parseFloat(row.valor),
            linha_digitavel: row.linha_digitavel,
            ativo: true
          });

          successCount++;
        } catch (error) {
          console.error('Erro ao processar linha:', error);
          errorCount++;
        }
      })
      .on('end', () => {
        // Remove o arquivo após processamento
        fs.unlinkSync(filePath);
        resolve({ success: successCount, errors: errorCount });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}; 