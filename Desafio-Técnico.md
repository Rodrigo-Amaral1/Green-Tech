**Desafio técnico de backend da Green Acesso.**

Crie um projeto em Javascript ou Typescript, utilizando NodeJS e banco de dados SQL (qualquer um) para fazer a importação de um `.csv`  e um `.pdf` para o nosso sistema e por fim a exportação de um `.pdf` .

Os pontos de análise do teste serão (na seguinte ordem de importância):

1. Capacidade de analisar o problema proposto e buscar uma solução efetiva;
2. Nível, organização e padronização do código escrito;
3. Nível técnico com banco de dados e integração no Node.

Após o teste na fase de entrevistas vamos analisar:

1. Capacidade de explicar o projeto da forma que foi feito;
2. Sua situação profissional atual para ver se encaixa com as expectativas da vaga;
3. Interesse na vaga.

**Queremos ver como você trabalha com:**

- Resolução de problemas;
- Arquivos;
- sequelize (ou outro);
- NodeJS;
- Javascript ou Typescrit (não faz diferença, qualquer um dos dois).

## Entender o problema

Em um condomínio de casas do brasil, denominado Condomínio Green Park, são utilizados 2 aplicativos, sendo um para o controle de acesso da portaria e o outro para o gerenciamento das taxas condominiais do financeiro. Após um tempo, o síndico percebeu que as pessoas estavam utilizando mais o aplicativo da Portaria que o aplicativo do Financeiro, por isso ele decidiu que iria exportar os boletos do financeiro e importar no aplicativo da Portaria.

Supondo que você trabalha na empresa que cuida do aplicativo da portaria, você será responsável por fazer um endpoint que irá receber essa importação em `.csv` e `.pdf` e passar os boletos do sistema financeiro para o sistema da portaria seguindo todas as instruções abaixo:

## Banco de dados

Em relação ao banco de dados você deve iniciar com apenas duas tabelas:

`lotes: Tabela que irá armazenar os lotes do condomínio`

`boletos: Tabela que irá armazenar os boletos importados.`

Apenas para te guiar vamos anotar os campos que poderiam conter nessa tabela:

```sql
CREATE TABLE lotes (
	id INT NOT NULL ...,
	nome VARCHAR(100),
	ativo BOOLEAN,
	criado_em TIMESTAMP ...
);

CREATE TABLE boletos (
	id INT NOT NULL ...,
	nome_sacado VARCHAR(255),
	id_lote INT NOT NULL // FOREIGN KEY com a tabela lotes,
	valor DECIMAL,
	linha_digitavel VARCHAR(255)
	ativo BOOLEAN,
	criado_em TIMESTAMP...
);
```

O arquivo `.csv` que o síndico te entregou para importação está no seguinte formato:

```sql
nome;unidade;valor;linha_digitavel
JOSE DA SILVA;17;182.54;123456123456123456
MARCOS ROBERTO;18;178.20;123456123456123456
MARCIA CARVALHO;19;128.00;123456123456123456
```

Nessa arquivo você tem as informações do nome do sacado, a unidade (lote) que ele habita, o valor do boleto e a linha digitável para pagamento.

## Atividade 1

O endpoint que você deve fazer irá receber um arquivo `.csv` , que é o que o síndico te enviou, então ele deve extrair os dados e importar na tabela `boletos`.

## Atividade 2

Porém temos um problema aqui, o dado que é solicitado na tabela boletos é o id da tabela `lotes`, dado esse que não vem no arquivo `.csv`, pois o outro sistema financeiro não sabe qual é a id do nosso sistema, e vice-versa. Por isso eles enviam o nome da unidade no formato deles, e nós temos o nome do lote no nosso formato.

Você deve arrumar alguma solução para fazer esse mapeamento para descobrir qual é a id do lote no nosso banco de dados e inserir no boleto. Para te instruir vamos adicionar um exemplo aqui.

```sql
Sistema Financeiro (Externo)

nome_unidade 
17
18
19

Sistema Portaria (Interno)

nome_lote   | id
0017        | 3
0018        | 6
0019        | 7
```

Você precisa construir uma forma então para descobrir que quando aparecer o nome **17** no `.csv` significa que você deve inserir a `id_lote = 3` e quando aparecer o nome **18** significa que você deve inserir a `id_lote = 6`.

Você não pode se basear na ordem do `.csv` para inserir os lotes, precisa obrigatoriamente fazer o mapeamento para descobrir qual lote no sistema externo corresponde ao lote no sistema interno.

## Atividade 3

Ao fim das atividade você terá os dados da seguinte maneira na sua tabela

```sql
boletos

id  | nome_sacado           | id_lote | valor   | linha_digitavel  | ...
1   | JOSE DA SILVA         | 3       | 182.54  | 123456123456123456 ...
2   | MARCOS ROBERTO        | 6       | 178.20  | 123456123456123456 ...
3   | MARCIA CARVALHO       | 7       | 128.00  | 123456123456123456 ...
```

Agora o síndico quer te enviar um arquivo PDF, que contém os boletos de cada pessoa em apenas **UM ARQUIVO PDF,** ou seja, dentro desse arquivo tem várias páginas que são os boletos de cada pessoa.

No nosso exemplo vamos supor que o síndico enviou os boletos ordenados de uma forma diferente no PDF:

```sql
pdf

1 PAGINA BOLETO MARCIA
2 PAGINA BOLETO JOSE
3 PAGINA BOLETO MARCOS
```

E ele te disse que sempre vai enviar os boletos nessa ordem FIXA, então você precisa arrumar uma forma de receber esses boletos na ordem correta para mapear eles com o registro equivalente da tabela de boletos. 

**OBS:** Você que será responsável por criar um PDF fake com alguns dados fictícios (pode ser apenas o nome da pessoa em cada página) e anexe esse PDF o projeto do git.

Agora você precisa construir um endpoint que receba esse pdf, e distribui eles em uma pasta do seu computador local, sendo que o nome do pdf gerado será o mesmo nome da id da tabela boletos. No nosso exemplo, o PDF seria desmembrado em 3 arquivos e ficariam na pasta da seguinte maneira.

```sql
pasta windows/mac

1.pdf // Seria o boleto do JOSE
2.pdf // Seria o boleto do MARCOS
3.pdf // Seria o boleto da MARCIA
```

## Atividade 4

Agora você precisa construir o endpoint para retornar todos os boletos existente no sistema. Você deve construir então os seguintes endpoints.

```sql
GET /boletos

# Podendo conter os seguintes filtros
GET /boletos?nome=JOSE&valor_inicial=100&valor_final=200&id_lote=2
```

## Atividade 5

E por fim, se passar o parâmetro `relatorio=1` o endpoint deve retornar um base64 que é um PDF com o relatório dos boletos. Nesse PDF deve conter uma tabela com as listas dos boletos que foram pedidos no relatório. Para isso você pode utilizar alguma biblioteca de extração de PDF do Node.

```json
# Podendo conter o relatório
GET /boletos?relatorio=1

{
	"base64": "9fj/..."
}

# O conteúdo do PDF seria esse:
id  | nome_sacado           | id_lote | valor   | linha_digitavel  | ...
1   | JOSE DA SILVA         | 3       | 182.54  | 123456123456123456 ...
2   | MARCOS ROBERTO        | 6       | 178.20  | 123456123456123456 ...
3   | MARCIA CARVALHO       | 7       | 128.00  | 123456123456123456 ...
```

**Sugestões de funcionalidades:**

- Utilizar uma tabela para organizar o mapeamento e a ordenação dos boletos ao mesmo tempo;