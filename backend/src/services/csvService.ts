import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import Lote from '../models/Lote';
import Boleto from '../models/Boleto';

interface CSVRow {
  nome_sacado: string;
  unidade: string;  // Changed from id_lote to unidade
  valor: string;
  linha_digitavel: string;
}

interface ProcessResult {
  success: number;
  errors: number;
  details: {
    processed: number;
    created: number;
    failed: number;
    errors: Array<{
      row: number;
      unit: string;
      error: string;
      data: {
        nome_sacado: string;
        valor: string;
        linha_digitavel: string;
      };
    }>;
    lotes_criados: Array<{
      unit: string;
      id: number;
    }>;
    summary: {
      total_boletos_processados: number;
      total_boletos_criados: number;
      total_erros: number;
      total_lotes_criados: number;
    };
  };
}

export const processCSV = async (filePath: string): Promise<ProcessResult> => {
  let rowCount = 0;
  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ row: number; unit: string; error: string; data: any }> = [];
  const createdLotes: { [key: string]: number } = {}; // Armazena os IDs dos lotes criados

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', async (row: CSVRow) => {
        rowCount++;
        try {
          // Formata a unidade para ter 4 dígitos
          const formattedUnit = row.unidade.padStart(4, '0');
          
          // Busca o lote no banco usando a unidade formatada
          let lote = await Lote.findOne({ where: { nome: formattedUnit } });
          
          // Se o lote não existe, cria um novo
          if (!lote) {
            try {
              lote = await Lote.create({
                nome: formattedUnit,
                ativo: true
              });
              createdLotes[formattedUnit] = lote.id;
              console.log(`Lote criado automaticamente para unidade: ${formattedUnit}`);
            } catch (error) {
              const errorMessage = `Erro ao criar lote para unidade ${formattedUnit}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
              console.error(errorMessage);
              errors.push({ 
                row: rowCount, 
                unit: formattedUnit, 
                error: errorMessage,
                data: {
                  nome_sacado: row.nome_sacado,
                  valor: row.valor,
                  linha_digitavel: row.linha_digitavel
                }
              });
              errorCount++;
              return;
            }
          }

          // Valida os dados
          if (!row.nome_sacado || !row.valor || !row.linha_digitavel) {
            const error = 'Dados incompletos na linha';
            console.error(error);
            errors.push({ 
              row: rowCount, 
              unit: formattedUnit, 
              error,
              data: {
                nome_sacado: row.nome_sacado,
                valor: row.valor,
                linha_digitavel: row.linha_digitavel
              }
            });
            errorCount++;
            return;
          }

          // Converte o valor para número
          const valor = parseFloat(row.valor);
          if (isNaN(valor)) {
            const error = `Valor inválido: ${row.valor}`;
            console.error(error);
            errors.push({ 
              row: rowCount, 
              unit: formattedUnit, 
              error,
              data: {
                nome_sacado: row.nome_sacado,
                valor: row.valor,
                linha_digitavel: row.linha_digitavel
              }
            });
            errorCount++;
            return;
          }

          // Cria o boleto
          await Boleto.create({
            nome_sacado: row.nome_sacado,
            id_lote: lote.id,
            valor: valor,
            linha_digitavel: row.linha_digitavel,
            ativo: true
          });

          successCount++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          console.error('Erro ao processar linha:', errorMessage);
          errors.push({ 
            row: rowCount, 
            unit: row.unidade || 'N/A', 
            error: errorMessage,
            data: {
              nome_sacado: row.nome_sacado,
              valor: row.valor,
              linha_digitavel: row.linha_digitavel
            }
          });
          errorCount++;
        }
      })
      .on('end', () => {
        resolve({
          success: successCount,
          errors: errorCount,
          details: {
            processed: rowCount,
            created: successCount,
            failed: errorCount,
            errors,
            lotes_criados: Object.entries(createdLotes).map(([unit, id]) => ({
              unit,
              id
            })),
            summary: {
              total_boletos_processados: rowCount,
              total_boletos_criados: successCount,
              total_erros: errorCount,
              total_lotes_criados: Object.keys(createdLotes).length
            }
          }
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}; 