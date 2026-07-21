# VENTURA MASTER GUIDE

# Ventura System - Documentação Oficial

## Objetivo

Este documento contém toda a documentação técnica do Ventura System.

Seu objetivo é permitir que qualquer desenvolvedor consiga entender, manter e evoluir o sistema sem perder funcionalidades.

---

# Informações Gerais

Projeto:
Ventura System

Empresa:
Óticas Ventura

Desenvolvedor:
Marcelynho

Tecnologias:

- HTML5
- CSS3
- JavaScript
- Firebase
- GitHub Pages

---

# Estrutura do Sistema

dashboard.html
Painel principal.

clientes.html
Cadastro de clientes.

pedidos.html
Cadastro de pedidos.

os.html
Ordem de Serviço.

financeiro.html
Controle financeiro.

caixa.html
Controle de caixa.

historico.html
Histórico.

notafiscal.html
Recibo de Atendimento.

config.html
Configurações.

app.js
Lógica principal do sistema.

style.css
Estilos globais.

---

# Fluxo do Sistema

Cliente

↓

Pedido

↓

Ordem de Serviço

↓

Financeiro

↓

Recibo

↓

Histórico

---

# Banco de Dados

Firebase Firestore

Coleções principais:

clientes

pedidos

financeiro

historico

---

# Publicação

GitHub Pages

Firebase

---

# Melhorias Futuras

- Nota Fiscal Oficial
- WhatsApp
- Multiusuário
- Relatórios
- Backup automático
- Dashboard avançado

---

Este documento deverá ser atualizado sempre que houver alterações importantes no Ventura System.
Criar documentação master do Ventura System
# VENTURA SYSTEM - MASTER GUIDE

## Repositório Oficial

https://github.com/Marcelynho/ventura-system

## Como continuar este projeto

Se este projeto for aberto em uma nova conversa com uma IA:

1. Leia primeiro este arquivo (`VENTURA_MASTER_GUIDE.md`).
2. Leia também o README.md.
3. Analise a estrutura completa do repositório.
4. Não altere funcionalidades já prontas sem necessidade.
5. Preserve o padrão visual do Ventura System.
6. Continue exatamente do ponto onde o desenvolvimento parou.

## Informações do Projeto

- Nome: Ventura System
- Empresa: Óticas Ventura
- Banco de dados: Firebase
- Linguagens: HTML, CSS e JavaScript

## Observação

Todas as alterações devem manter a identidade visual e a organização do sistema.


---

## Preparação fiscal — Etapa 1 (2026-07-21)

- Dados fiscais da empresa adicionados em Configurações.
- Cadastro de cliente preparado para CPF/CNPJ, e-mail e endereço completo.
- Ordem de Serviço preparada para copiar e salvar esses dados.
- `notafiscal.html` agora é uma prévia fiscal sem valor fiscal.
- A emissão oficial permanece desativada até integração com emissor/SEFAZ e validação do contador.


## Preparação fiscal — Etapa 2 (21/07/2026)

A Ordem de Serviço passou a aceitar detalhamento fiscal separado de lente, armação, serviço e desconto. O total principal da OS continua no campo `valor`, preservando compatibilidade com financeiro, caixa, relatórios e registros antigos. A prévia fiscal só é aberta quando a soma dos itens, menos o desconto, coincide com o total da venda.

---

# Compartilhamento gratuito de PDF

O Ventura System possui compartilhamento de documentos pelo recurso nativo do navegador, sem integração paga com a API do WhatsApp.

Documentos disponíveis:

- Ordem de Serviço em PDF.
- Recibo de Atendimento em PDF, identificado como documento sem valor fiscal.
- Receituário em PDF.
- Prévia fiscal em PDF, identificada como documento sem valor fiscal.

Fluxo:

1. O sistema gera o PDF no navegador.
2. O usuário toca em “Compartilhar agora”.
3. O aparelho abre a folha de compartilhamento.
4. O usuário escolhe o WhatsApp e confirma o contato.

O sistema nunca envia documentos automaticamente. Em navegadores sem suporte ao compartilhamento de arquivos, é oferecido o download do PDF.

