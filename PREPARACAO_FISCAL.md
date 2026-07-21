# Preparação Fiscal — Etapa 1

Esta etapa prepara o Ventura System para uma futura integração de NF-e/NFC-e, sem emitir documento fiscal oficial.

## Alterações realizadas

- Dados fiscais da empresa em `config.html`.
- CPF/CNPJ, e-mail e endereço completo do cliente.
- Cópia dos dados completos do cliente para a Ordem de Serviço.
- Armazenamento dos novos campos no Firestore, mantendo compatibilidade com clientes antigos.
- Prévia fiscal da venda em `notafiscal.html` com aviso explícito de documento sem valor fiscal.
- Impressão da via da loja com documento e endereço completo do cliente.

## Campos que dependem do contador

- Regime tributário.
- CRT.
- Inscrição estadual e municipal.
- CNAE.
- NCM, CFOP, CST/CSOSN e demais regras de tributação dos itens.

## Próxima etapa sugerida

Criar o cadastro fiscal de produtos/serviços e separar os valores de armação, lentes e serviços por item, com quantidade, valor unitário, desconto e total.


## Etapa 2 — Detalhamento dos itens da venda

Adicionado à Ordem de Serviço:

- quantidade e valor unitário da lente;
- quantidade e valor unitário da armação;
- serviço adicional opcional, com quantidade e valor;
- desconto total;
- conferência automática entre os itens e o valor total da venda;
- bloqueio da prévia fiscal quando os valores não fecharem;
- prévia fiscal com cada item em sua própria linha.

Compatibilidade: o campo `valor` continua sendo o total oficial usado pelo sistema. Os novos campos são complementares e não removem dados antigos.
