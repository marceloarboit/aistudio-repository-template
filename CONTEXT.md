# CONTEXT.md

## 1. Visão Geral do Sistema
O sistema **ConcreteTrack Pro** tem como objetivo o gerenciamento e controle de concretagens em obras de construção civil. Ele permite o registro detalhado de entregas de concreto, monitoramento de volumes, fornecedores e custos, além da geração de relatórios para análise de produtividade e desperdícios.
Ele resolve o problema de falta de rastreabilidade e controle manual (papel/planilhas) no recebimento de concreto nas obras.

## 2. Stack Tecnológica
- **Backend**: Firebase (Authentication e Firestore como Banco de Dados NoSQL service-less).
- **Frontend**: React 19 (com Vite), TypeScript.
- **Estilização**: TailwindCSS.
- **Ícones**: Lucide React.
- **Gráficos**: Recharts.
- **IA**: Google Gemini SDK (@google/genai) para análise de dados.
- **Relatórios**: jsPDF (PDF), SheetJS/xlsx (Excel).

## 3. Arquitetura e Padrões
- **Estrutura de Pastas**:
  - `components/`: Contém os componentes de UI e lógica de telas (Login, Dashboard, Registry, Reports).
  - `services/`: Camada de abstração para serviços externos (Firebase, Database, AI).
  - `App.tsx`: Controlador principal que gerencia o estado global, autenticação e roteamento (navegação por abas manuais).
- **Padrões**:
  - **Service Pattern**: Acesso ao banco de dados centralizado em `services/db.ts` (objeto `dbService`).
  - **Single Page Application (SPA)**: Navegação interna via estado (`currentTab`) sem uso de roteador externo (React Router).
  - **Componentização Funcional**: Uso de React Hooks para lógica e estado.

## 4. Funcionalidades Implementadas
- **Autenticação**: Login via Firebase Auth.
- **Dashboard**: Visualização de métricas (Volume Total, Entregas) e gráficos de desempenho.
- **Gestão de Lançamentos (Concretagens)**: Cadastro, Edição e Exclusão de registros de concretagem (Data, NF, Volume, Fornecedor, Local, etc.).
- **Cadastros (Registry)**: CRUD completo para:
  - Fornecedores
  - Locais de aplicação
  - Locais de aplicação
  - Tipos de Concreto (Traços com composição de insumos)
  - Dispositivos de monitoramento
  - Dispositivos de monitoramento
  - Insumos/Materiais (com código auto-incrementável)
- **Relatórios**:
  - Filtragem por período.
  - Exportação para PDF (listagem formal).
  - Exportação para Excel (.xlsx).

## 5. Funcionalidades em Andamento
- **Análise com IA**: O componente `AIReport.tsx` existe no código fonte com integração ao Google Gemini, mas **não está importado nem utilizado** na aplicação principal (`App.tsx` ou `Reports.tsx`).
- **Tipagem Estrita**: O código possui uso de `@ts-ignore` em pontos críticos (imports de bibliotecas e callbacks do Firebase).

## 6. Regras e Decisões Importantes
- **Banco de Dados**: O sistema opera em modo "Online-Only" acessando diretamente o Firestore. As coleções são mapeadas no frontend (`suppliers` -> `fornecedores`, etc.).
- **Navegação**: A aplicação não utiliza URL routing; a navegação é controlada por estado local (`currentTab`), o que significa que recarregar a página reseta a navegação para o Dashboard.
- **Interface**: Interface responsiva construída com utilitários TailwindCSS.

## 7. Pontos de Atenção
- **Componente Órfão**: O arquivo `components/AIReport.tsx` está isolado e não acessível pelo usuário final.
- **Configuração de Ambiente**: O uso de `process.env.API_KEY` no front-end (Vite) provavelmente causará erro em produção (deveria ser `import.meta.env`).
- **App.tsx Monolítico**: O componente raiz concentra muita lógica de estado, handlers de CRUD e regras de ordenação, dificultando a manutenção.
- **Tratamento de Erros**: O feedback ao usuário é feito via `window.alert` e `window.confirm`, o que não é ideal para UX.

## 8. Próximo Passo Recomendado
Integrar o componente `AIReport.tsx` na tela de Relatórios (`components/Reports.tsx`) para habilitar a funcionalidade de "IA Engenheiro", corrigindo a chamada da variável de ambiente para o padrão Vite (`import.meta.env`).
