import { PDFDocument } from 'pdf-lib';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import Boleto from '../models/Boleto';
import Lote from '../models/Lote';

interface PDFData {
  nome_sacado: string;
  unidade: string;
  valor: string;
  linha_digitavel: string;
}

async function salvarPaginaPDF(pdfDoc: PDFDocument, pageIndex: number, boleto: any): Promise<string> {
  try {
    // Cria um novo documento PDF
    const newPdfDoc = await PDFDocument.create();
    
    // Copia a página do PDF original
    const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageIndex]);
    newPdfDoc.addPage(copiedPage);
    
    // Cria o diretório de boletos se não existir
    const boletosDir = path.join(__dirname, '../../uploads/boletos');
    if (!fs.existsSync(boletosDir)) {
      fs.mkdirSync(boletosDir, { recursive: true });
    }

    // Define o nome do arquivo baseado no ID do boleto e nome do sacado
    const fileName = `${boleto.id}_${boleto.nome_sacado.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const filePath = path.join(boletosDir, fileName);

    // Salva o novo PDF
    const pdfBytes = await newPdfDoc.save();
    fs.writeFileSync(filePath, pdfBytes);

    return filePath;
  } catch (error) {
    console.error('Erro ao salvar página do PDF:', error);
    throw error;
  }
}

export const processPDF = async (filePath: string): Promise<{ success: number; errors: number; details: any }> => {
  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ page: number; error: string; data: any }> = [];
  const savedFiles: Array<{ page: number; path: string }> = [];

  try {
    // Lê o arquivo PDF
    const pdfBuffer = fs.readFileSync(filePath);
    
    // Carrega o PDF para extração de texto
    const pdfData = await pdfParse(pdfBuffer);
    
    // Carrega o PDF para informações de páginas
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    
    // Divide o texto por páginas (assumindo que cada página tem um padrão específico)
    const pageTexts = pdfData.text.split('Boleto Bancario').filter(text => text.trim());

    // Processa cada página
    for (let i = 0; i < pageTexts.length; i++) {
      try {
        // Adiciona o título de volta para manter o padrão de extração
        const pageText = 'Boleto Bancario' + pageTexts[i];
        
        // Extrai os dados do texto da página
        const data = extrairDadosDoTexto(pageText);
        console.log(`Dados extraídos da página ${i + 1}:`, data);

        if (!data.nome_sacado || !data.unidade || !data.valor || !data.linha_digitavel) {
          throw new Error('Dados incompletos na página');
        }

        // Formata a unidade para ter 4 dígitos
        const formattedUnit = String(data.unidade).padStart(4, '0');
        console.log(`Processando unidade ${data.unidade} -> ${formattedUnit}`);

        // Busca o lote no banco usando a unidade formatada
        let lote = await Lote.findOne({ where: { nome: formattedUnit } });

        // Se o lote não existe, cria um novo
        if (!lote) {
          lote = await Lote.create({
            nome: formattedUnit,
            ativo: true
          });
          console.log(`Lote criado automaticamente para unidade: ${formattedUnit}`);
        }

        // Converte o valor para número
        const valor = parseFloat(data.valor.replace('R$', '').replace(',', '.').trim());
        if (isNaN(valor)) {
          throw new Error(`Valor inválido: ${data.valor}`);
        }

        // Cria o boleto
        const boleto = await Boleto.create({
          nome_sacado: data.nome_sacado,
          id_lote: lote.id,
          valor: valor,
          linha_digitavel: data.linha_digitavel,
          ativo: true
        });

        // Salva a página como um PDF individual
        const savedPath = await salvarPaginaPDF(pdfDoc, i, boleto);
        savedFiles.push({ page: i + 1, path: savedPath });

        successCount++;
        console.log(`Boleto criado com sucesso para ${data.nome_sacado} na unidade ${formattedUnit}`);
        console.log(`PDF salvo em: ${savedPath}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error(`Erro ao processar página ${i + 1}:`, errorMessage);
        errors.push({ 
          page: i + 1, 
          error: errorMessage,
          data: { text: pageTexts[i] }
        });
        errorCount++;
      }
    }

    // Remove o arquivo original após processamento
    fs.unlinkSync(filePath);

    return { 
      success: successCount, 
      errors: errorCount,
      details: {
        processed: pageTexts.length,
        created: successCount,
        failed: errorCount,
        errors,
        saved_files: savedFiles,
        summary: {
          total_paginas_processadas: pageTexts.length,
          total_boletos_criados: successCount,
          total_erros: errorCount,
          total_pdfs_salvos: savedFiles.length
        }
      }
    };
  } catch (error) {
    console.error('Erro ao processar PDF:', error);
    throw error;
  }
};

// Função auxiliar para extrair dados do texto do PDF
function extrairDadosDoTexto(text: string): PDFData {
  const lines = text.split('\n');
  const data: PDFData = {
    nome_sacado: '',
    unidade: '',
    valor: '',
    linha_digitavel: ''
  };

  for (const line of lines) {
    if (line.includes('Nome do Sacado:')) {
      data.nome_sacado = line.split(':')[1].trim();
    } else if (line.includes('Unidade:')) {
      data.unidade = line.split(':')[1].trim();
    } else if (line.includes('Valor:')) {
      data.valor = line.split(':')[1].trim();
    } else if (line.includes('Linha Digitavel:')) {
      data.linha_digitavel = line.split(':')[1].trim();
    }
  }

  return data;
} 