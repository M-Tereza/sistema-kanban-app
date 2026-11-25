# Sistema Kanban — Frontend

Aplicação web *Single Page Application* (SPA) desenvolvida em **React** para o **Gerenciador de Projetos e Tarefas (Kanban)**. O sistema oferece uma interface responsiva para gestão ágil de fluxos de trabalho, integrando-se diretamente à API REST construída em Spring Boot.

---

## Visão Geral e Funcionalidades

* **Quadro Kanban Interativo (`/kanban`)**
  * Seleção dinâmica de projetos e exibição das fases ordenadas em colunas.
  * Reordenação horizontal das fases e movimentação fluida de tarefas entre etapas.
  * Visualização detalhada de cards com prioridade, prazo, responsáveis, etiquetas e histórico de anotações.
  * Filtragem combinada em tempo real (com *debounce*) por termo de busca (título, descrição ou etiqueta) e por membro responsável.

* **Gestão de Projetos e Fluxos**
  * **Projetos (`/listagem-projetos`, `/cadastro-projetos/:idParam?`)**: CRUD completo com vinculação opcional a áreas de negócio e atalho direto para o respectivo quadro Kanban.
  * **Fases (`/listagem-fases`, `/cadastro-fases/:idParam?`)**: Gerenciamento das etapas do fluxo, controle de fase final e exclusão segura mediante confirmação quando existem tarefas alocadas.

* **Gestão de Tarefas e Colaboração**
  * **Tarefas (`/listagem-tarefas`, `/cadastro-tarefas/:idParam?`)**: Criação e manutenção de demandas com definição de prazos, prioridades, etiquetas, responsáveis e anotações.
  * **Equipe (`/listagem-funcionarios`, `/listagem-funcionarios-projeto`)**: Cadastro de colaboradores, atribuição de cargos e vinculação de membros e responsáveis aos projetos.

* **Cadastros Auxiliares**
  * **Cargos** (`/listagem-cargos`, `/cadastro-cargos/:idParam?`)
  * **Áreas de Projeto** (`/listagem-areas-projeto`, `/cadastro-areas-projeto/:idParam?`)
  * **Prioridades** (`/listagem-prioridades`, `/cadastro-prioridades/:idParam?`)
  * **Etiquetas por Projeto** (`/listagem-etiquetas`, `/cadastro-etiquetas/:idParam?`)

---

## Stack Tecnológica

| Camada / Finalidade | Tecnologia / Biblioteca | Versão |
| :--- | :--- | :--- |
| **Core & Linguagem** | React & JavaScript (ES6+) | `^18.2.0` |
| **Roteamento SPA** | React Router DOM | `^6.6.1` |
| **Cliente HTTP** | Axios | `^1.2.2` |
| **Componentes & Ícones** | Material UI (`@mui/material`, `@mui/icons-material`) | `^5.11.x` |
| **Estilização & Grid** | Bootstrap 5 / Bootswatch (Tema *Flatly*) | `^5.2.3` |
| **Feedback & Alertas** | Toastr | `^2.1.4` |
| **Build & Tooling** | Node.js + `react-scripts` (Create React App) | `5.0.1` |

---

## Arquitetura e Estrutura de Diretórios

A aplicação adota uma arquitetura modular baseada em *Function Components* e *React Hooks*, separando responsabilidades entre configuração, componentes de interface, utilitários e telas de domínio:

```text
src/
├── components/          # Componentes de UI reutilizáveis (Navbar, Card, FormGroup, Toastr)
├── config/
│   └── axios.js         # Definição centralizada da BASE_URL da API REST
├── hooks/
│   └── useDebounce.js   # Hook customizado para otimização de buscas em tempo real
├── utils/
│   ├── datas.js         # Utilitários de formatação para LocalDate e Instant (ISO-8601)
│   └── kanban.js        # Regras auxiliares de ordenação de fases e filtragem de tarefas
├── views/               # Camada de páginas (Quadro Kanban, Listagens e Formulários CRUD)
├── App.js               # Layout raiz da aplicação (Navbar + Roteador)
├── index.js             # Ponto de entrada e renderização no DOM
└── rotas.js             # Configuração centralizada de rotas e parâmetros
```

---

## Pré-requisitos

Para executar o projeto localmente, certifique-se de que o ambiente possua:

* **Node.js** (`v16.x` ou superior) e **npm** instalados.
* **API Backend Kanban** em execução (padrão: `http://localhost:8080/api/v1`) devidamente conectada à instância **PostgreSQL**.

---

## Instalação e Execução

1. **Acesse o diretório raiz do frontend:**
   ```bash
   cd caminho/para/o/frontend
   ```

2. **Instale as dependências do projeto:**
   ```bash
   npm install
   ```

3. **Configure o endpoint da API:**
   Verifique o arquivo `src/config/axios.js` e ajuste a constante `BASE_URL` caso o backend esteja hospedado em outra porta ou domínio:
   ```javascript
   export const BASE_URL = 'http://localhost:8080/api/v1';
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm start
   ```
   A aplicação ficará disponível em `http://localhost:3000`.

---

## Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm start` | Inicia a aplicação em modo de desenvolvimento com *hot-reload*. |
| `npm run build` | Gera o pacote otimizado e minificado para produção no diretório `build/`. |
| `npm test` | Executa a suíte de testes automatizados em modo interativo. |