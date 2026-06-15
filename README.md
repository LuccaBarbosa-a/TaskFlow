# 📋 TaskFlow — Gerenciador de Tarefas

Aplicação **fullstack** de gerenciamento de tarefas pessoais, com **API**, **app web** e **app mobile**.
Todo o código é escrito em **TypeScript** e o banco de dados é **PostgreSQL** acessado via **Prisma ORM**.

---

## 🧰 Tecnologias

| Camada          | Tecnologias                                                        |
| --------------- | ------------------------------------------------------------------ |
| **Backend**     | Node.js, Express, TypeScript, Prisma ORM, PostgreSQL               |
| **Frontend web**| React 18, Vite, TypeScript, React Router v6, CSS Modules           |
| **Mobile**      | React Native, Expo (SDK 54), TypeScript, Expo Router               |
| **Autenticação**| JWT + bcrypt                                                       |
| **Validação**   | Zod                                                                |
| **Segurança**   | Helmet, CORS configurável, rate limiting                           |
| **Qualidade**   | ESLint + Prettier nos três módulos                                 |

---

## ✨ Funcionalidades

- Cadastro e login de usuários com autenticação JWT
- Criar, editar e excluir tarefas
- Status: Pendente / Em andamento / Concluída
- Prioridade, categoria e prazo (com destaque de tarefas atrasadas)
- Filtros por status, prioridade e categoria
- Busca por título (com debounce)
- Dashboard com estatísticas e barra de progresso
- Dados isolados por usuário — cada um vê apenas as próprias tarefas

---

## 📦 Pré-requisitos

- **Node.js** 20 ou superior
- **PostgreSQL** 14 ou superior, rodando localmente
- **npm** 9 ou superior
- (Para o mobile) o app **Expo Go** no celular

---

## 🚀 Como rodar

### 1. Banco de dados

Tenha o PostgreSQL instalado e rodando. O banco `taskflow` é criado automaticamente
pela migration do Prisma.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # ajuste DATABASE_URL e JWT_SECRET
npm run prisma:migrate    # cria as tabelas no PostgreSQL
npm run dev
```

API em **http://localhost:3001** · Health check: `GET /api/health`

> Visualize os dados no banco com `npm run prisma:studio`.

### 3. Frontend web (novo terminal)

```bash
cd frontend
npm install
cp .env.example .env      # opcional — ajuste VITE_API_URL
npm run dev
```

App web em **http://localhost:5173**

### 4. Mobile (novo terminal)

```bash
cd mobile
npm install
cp .env.example .env      # defina EXPO_PUBLIC_API_URL com o IP do seu PC
npx expo start
```

Escaneie o QR Code com o app **Expo Go**. O celular e o computador precisam estar
na mesma rede Wi-Fi.

---

## 🔑 Variáveis de ambiente

**backend/.env**

```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://postgres:SENHA@localhost:5432/taskflow?schema=public"
JWT_SECRET=um_segredo_aleatorio_longo
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

**frontend/.env**

```env
VITE_API_URL=http://localhost:3001
```

**mobile/.env**

```env
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3001/api
```

---

## 🌐 Endpoints da API

| Método | Rota                    | Descrição                       | Auth |
| ------ | ----------------------- | ------------------------------- | ---- |
| POST   | `/api/auth/register`    | Cadastrar usuário               | ❌   |
| POST   | `/api/auth/login`       | Login                           | ❌   |
| GET    | `/api/auth/me`          | Dados do usuário logado         | ✅   |
| GET    | `/api/tasks`            | Listar tarefas (com filtros)    | ✅   |
| POST   | `/api/tasks`            | Criar tarefa                    | ✅   |
| PUT    | `/api/tasks/:id`        | Editar tarefa                   | ✅   |
| PATCH  | `/api/tasks/:id/status` | Atualizar apenas o status       | ✅   |
| DELETE | `/api/tasks/:id`        | Deletar tarefa                  | ✅   |
| DELETE | `/api/tasks/concluidas` | Remover todas as concluídas     | ✅   |

---

## 📁 Estrutura do projeto

```
taskflow/
├── backend/                # API REST (Node + Express + TypeScript)
│   ├── prisma/
│   │   └── schema.prisma   # Modelos do banco de dados
│   └── src/
│       ├── db/             # Cliente Prisma
│       ├── middleware/     # Autenticação JWT
│       ├── routes/         # auth.ts e tasks.ts
│       ├── validation/     # Schemas Zod
│       └── server.ts       # Entry point
├── frontend/               # App web (React + Vite + TypeScript)
│   └── src/
│       ├── components/     # TaskCard, TaskModal
│       ├── context/        # AuthContext, ToastContext
│       ├── pages/          # Login, Register, Dashboard
│       ├── services/       # Cliente axios
│       └── types.ts        # Tipos compartilhados
└── mobile/                 # App mobile (React Native + Expo)
    ├── app/                # Telas (Expo Router)
    └── src/                # Componentes, contexto, serviços
```

---

## 🛠️ Scripts úteis

Cada módulo possui:

| Script             | O que faz                          |
| ------------------ | ---------------------------------- |
| `npm run dev`      | Inicia em modo desenvolvimento     |
| `npm run lint`     | Verifica o código com o ESLint     |
| `npm run format`   | Formata o código com o Prettier    |
| `npm run typecheck`| Checa os tipos do TypeScript       |

---

Projeto desenvolvido para fins acadêmicos / de portfólio.
