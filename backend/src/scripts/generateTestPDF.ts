import PDFKit from 'pdfkit';
import fs from 'fs';
import path from 'path';

const generateTestPDF = async () => {
  const doc = new PDFKit();
  const outputPath = path.join(__dirname, '../../uploads/test.pdf');

  // Garantir que o diretório existe
  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }

  // Configurar stream de saída
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Nomes para cada página
  const names = ['MARCIA', 'JOSE', 'MARCOS'];

  // Gerar 3 páginas
  for (let i = 0; i < 3; i++) {
    if (i > 0) {
      doc.addPage();
    }

    // Configurar fonte e tamanho
    doc.font('Helvetica-Bold');
    doc.fontSize(20);

    // Título da página
    doc.text(`Página ${i + 1}`, { align: 'center' });
    doc.moveDown();

    // Nome do sacado
    doc.fontSize(16);
    doc.text(`Nome do Sacado: ${names[i]}`, { align: 'center' });
    doc.moveDown();

    // Dados fictícios
    doc.font('Helvetica');
    doc.fontSize(12);
    doc.text(`Valor: R$ ${(Math.random() * 1000).toFixed(2)}`);
    doc.text(`Linha Digitável: ${Math.random().toString(36).substring(2, 15)}`);
    doc.text(`Data: ${new Date().toLocaleDateString()}`);

    // Adicionar um código de barras fictício
    doc.moveDown();
    doc.rect(50, doc.y, 300, 50).stroke();
    doc.text('Código de Barras Fictício', 60, doc.y + 15);
  }

  // Finalizar PDF
  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      console.log(`PDF de teste gerado em: ${outputPath}`);
      resolve(outputPath);
    });
    stream.on('error', reject);
  });
};

// Executar se chamado diretamente
if (require.main === module) {
  generateTestPDF().catch(console.error);
}

export default generateTestPDF; 