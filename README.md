# Green Tech - Backend

Backend para sistema de gerenciamento de boletos e lotes, desenvolvido em Node.js com TypeScript.

## 🚀 Como rodar o projeto

### Pré-requisitos
- Node.js (versão 14 ou superior)
- PostgreSQL
- npm ou yarn

### Configuração do ambiente

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd green-tech/backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o arquivo `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=green_tech
DB_USER=seu_usuario
DB_PASS=sua_senha
PORT=3000
```

4. Inicie o servidor em modo desenvolvimento:
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

## 📝 Endpoints disponíveis

### Boletos
- `GET /boletos` - Lista todos os boletos (com filtros)
- `GET /boletos/:id` - Busca um boleto específico
- `POST /boletos` - Cria um novo boleto
- `PUT /boletos/:id` - Atualiza um boleto
- `DELETE /boletos/:id` - Remove um boleto

### Lotes
- `GET /lotes` - Lista todos os lotes
- `GET /lotes/:id` - Busca um lote específico
- `POST /lotes` - Cria um novo lote
- `PUT /lotes/:id` - Atualiza um lote
- `DELETE /lotes/:id` - Remove um lote

### Importação
- `POST /import-csv` - Importa boletos via CSV
- `POST /import-pdf` - Importa e processa PDFs de boletos

## 🧪 Como testar os endpoints

### Usando Postman/Insomnia

1. Importe o arquivo de coleção disponível em `docs/postman_collection.json`

2. Para testar a importação de CSV, use o arquivo de exemplo:
```csv
nome_sacado,id_lote,valor,linha_digitavel
MARCIA,1,100.00,12345678901234567890
JOSE,2,200.00,09876543210987654321
MARCOS,3,300.00,11112222333344445555
```

3. Para testar a importação de PDF:
```bash
# Gere um PDF de teste
npm run generate-test-pdf
```
O PDF será gerado em `backend/uploads/test.pdf`

### Exemplos de requisições

1. Listar boletos com filtros:
```
GET http://localhost:3000/boletos?nome=João&valor_inicial=100&valor_final=500
```

2. Gerar relatório PDF:
```
GET http://localhost:3000/boletos?relatorio=1&nome=João
```

3. Importar CSV:
```
POST http://localhost:3000/import-csv
Content-Type: multipart/form-data
file: [arquivo.csv]
```

4. Importar PDF:
```
POST http://localhost:3000/import-pdf
Content-Type: multipart/form-data
file: [arquivo.pdf]
```

## 💡 Decisões técnicas

### Arquitetura
- **MVC**: Adotamos o padrão Model-View-Controller para organização do código
- **Sequelize**: ORM escolhido para interação com o banco PostgreSQL
- **TypeScript**: Para tipagem estática e melhor manutenibilidade

### Upload de arquivos
- **Multer**: Middleware para processamento de uploads
- **Validações**: 
  - Tamanho máximo: 10MB
  - Tipos permitidos: CSV e PDF
  - Um arquivo por requisição

### Processamento de PDFs
- **PDFKit**: Biblioteca para geração de PDFs
- **Ordenação**: Páginas são ordenadas conforme a regra MARCIA, JOSE, MARCOS
- **Base64**: PDFs são codificados em base64 para transferência

### Banco de dados
- **PostgreSQL**: Escolhido por sua robustez e suporte a JSON
- **Migrations**: Estrutura do banco versionada
- **Associações**: Relacionamentos entre boletos e lotes

## 📌 Observações finais

### Mapeamento de dados
- **CSV para Banco**: Dados são validados e convertidos antes da inserção
- **PDF para Arquivos**: Cada página é salva como PDF individual
- **Nomes de arquivos**: Usam timestamp para evitar conflitos

### Segurança
- Validação de tipos de arquivo
- Limites de tamanho
- Sanitização de inputs

### Performance
- Paginação em consultas
- Processamento assíncrono de arquivos
- Deleção automática de arquivos temporários

### Melhorias futuras
- Implementar autenticação
- Adicionar cache para consultas frequentes
- Melhorar tratamento de erros
- Implementar filas para processamento pesado

## 📚 Documentação

A documentação completa da API está disponível em:
```
http://localhost:3000/api-docs
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request 