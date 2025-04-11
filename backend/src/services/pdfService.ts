import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import Boleto from '../models/Boleto';

// Ordem de processamento dos nomes
const NOME_ORDEM = ['MARCIA', 'JOSE', 'MARCOS'];

export const processPDF = async (filePath: string): Promise<{ success: number; errors: number }> => {
  let successCount = 0;
  let errorCount = 0;

  try {
    // Lê o arquivo PDF
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    // Cria um array para armazenar as páginas e seus nomes
    const paginasComNomes = pages.map((page, index) => {
      // Aqui você precisaria implementar a lógica para extrair o nome do sacado da página
      // Por enquanto, vamos simular com um nome baseado no índice
      const nome = NOME_ORDEM[index % NOME_ORDEM.length];
      return { page, nome };
    });

    // Ordena as páginas conforme a ordem definida
    paginasComNomes.sort((a, b) => {
      const indexA = NOME_ORDEM.indexOf(a.nome);
      const indexB = NOME_ORDEM.indexOf(b.nome);
      return indexA - indexB;
    });

    // Processa cada página
    for (const { page, nome } of paginasComNomes) {
      try {
        // Busca o boleto correspondente no banco
        const boleto = await Boleto.findOne({ where: { nome_sacado: nome } });
        
        if (!boleto) {
          console.error(`Boleto não encontrado para o nome: ${nome}`);
          errorCount++;
          continue;
        }

        // Cria um novo PDF com apenas esta página
        const newPdfDoc = await PDFDocument.create();
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pages.indexOf(page)]);
        newPdfDoc.addPage(copiedPage);

        // Salva o PDF
        const pdfBytes = await newPdfDoc.save();
        const outputPath = path.join(__dirname, '..', 'uploads', `${boleto.id}.pdf`);
        fs.writeFileSync(outputPath, pdfBytes);

        successCount++;
      } catch (error) {
        console.error(`Erro ao processar página para ${nome}:`, error);
        errorCount++;
      }
    }

    // Remove o arquivo original após processamento
    fs.unlinkSync(filePath);

    return { success: successCount, errors: errorCount };
  } catch (error) {
    console.error('Erro ao processar PDF:', error);
    throw error;
  }
}; 