# Sistema de Importação de Boletos - Guia de Avaliação

## 💻 Configuração Rápida

1. **Instale as dependências globais**
```bash
npm install -g sequelize-cli
```

2. **Instale as dependências do projeto**
```bash
cd backend
npm install
npm install sequelize
```

3. **Configure o banco de dados**
Crie um arquivo `.env`:
```env
# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=greentech
DB_USER=postgres
DB_PASSWORD=sua_senha

# Configurações do Servidor
PORT=3000

# Configurações de Upload
MAX_FILE_SIZE=10485760 # 10MB em bytes
```

4. **Execute as migrações**
```bash
sequelize-cli db:migrate
```

5. **Inicie o sistema**
```bash
npm run dev
```

## 🔄 Comandos de Migração

- **Criar tabelas**: `npm run migrate`
- **Desfazer última migração**: `npm run migrate:undo`
- **Desfazer todas as migrações**: `npm run migrate:undo:all`

## 🧪 Roteiro de Testes

### 1. Importação de CSV
1. Use o arquivo de exemplo em `backend/docs/boletos.csv`
2. Faça POST para `http://localhost:3000/api/import-csv`
3. Resultado esperado: Lista de boletos importados com sucesso

### 2. Importação de PDF
1. Use o arquivo de exemplo em `backend/docs/boletos.pdf`
2. Faça POST para `http://localhost:3000/api/import-pdf`
3. Resultado esperado: PDFs individuais gerados em `uploads/boletos/`

### 3. Consulta de Boletos
1. Acesse `http://localhost:3000/boletos`
2. Teste os filtros:
   - Por nome: `?nome=João`
   - Por valor: `?valor_inicial=100&valor_final=200`
   - Por lote: `?id_lote=3`
3. Gere relatório: `?relatorio=1`

## 🎯 Principais Funcionalidades

1. **Importação de Arquivos**
   - Suporte a CSV e PDF
   - Validação automática de dados
   - Mapeamento inteligente de unidades

2. **Gerenciamento de Boletos**
   - Consulta com filtros
   - Geração de relatórios
   - Armazenamento organizado

3. **Integração**
   - API RESTful documentada
   - Coleção Postman em `docs/postman_collection.json`
   - Logs detalhados de operações

## 📋 Validação do Sistema

1. **Mapeamento de Unidades**
   - Unidade "17" → ID_LOTE = 3
   - Unidade "18" → ID_LOTE = 6

2. **Formato dos Dados**
   - Nome do Sacado: Texto (máx 255 caracteres)
   - Valor: Decimal (10,2)
   - Linha Digitável: 47 dígitos

3. **Verificações de Sucesso**
   - Boletos salvos no banco
   - PDFs gerados corretamente
   - Consultas retornando dados esperados

## 🆘 Suporte

Para dúvidas ou problemas durante a avaliação:
1. Verifique os logs no console
2. Consulte a [documentação técnica](DOCUMENTATION.md) para detalhes sobre:
   - Arquitetura do sistema
   - Estrutura do banco de dados
   - Endpoints da API
   - Processamento de arquivos
   - Mapeamento de unidades
   - Logs e monitoramento
   - Configuração do ambiente
3. Contate o desenvolvedor responsável 