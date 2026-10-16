# Gestão de Chamados — Polos Pelotas/RS

Sistema para registrar e acompanhar os chamados abertos junto aos polos (aproveitamento de estudos, regularização de matrícula etc.), em formato de lista de tarefas com prazo e status automático (em andamento / concluído / expirado).

## Estrutura do projeto

```
chamados-app/
├── server/    → API (Node.js + Express + TypeScript + Prisma)
└── client/    → Painel (React + Vite + TypeScript + Tailwind CSS)
```

- **Banco de dados**: PostgreSQL hospedado gratuitamente no [Neon](https://neon.tech).
- **Autenticação**: login com e-mail/senha, senha com hash **bcrypt** (12 rounds) e sessão via **JWT**.
- **Usuários**: só um administrador pode cadastrar novas contas (rota `/api/auth/users`), então você controla quem entra na equipe.
- **Chamados**: protocolo, polo (3 opções fixas), aluno, CPF, RA, curso, situação atual, justificativa, data de criação, prazo e status. O status "expirado" é calculado automaticamente comparando o prazo com a data atual (a não ser que o chamado já tenha sido marcado como concluído).

### Novidades (sidebar, calendário e chamados modulares)
- **Sidebar** com Chamados, Calendário e Equipe (admin), com selo vermelho de chamados expirados / tarefas atrasadas.
- **Calendário**: visão do ano em blocos por mês → clique no mês → grade de dias → clique no dia para adicionar/editar/concluir tarefas. Tarefas vencidas e não concluídas ficam em vermelho. Os chamados também aparecem no dia da previsão.
- **Chamados**: código (protocolo), aluno, CPF, data de realização, data de previsão, marcar concluído (e reabrir) e aviso de atraso/dias restantes. RA, curso, situação e justificativa agora são opcionais.
- Depois de atualizar o código, rode no `server/`: `npx prisma migrate deploy && npx prisma generate`.

Os 3 polos ficam fixos no sistema (enum no banco), exatamente como no seu print:
- Pelotas/RS – I (4306)
- Pelotas/RS – II (14630166)
- Pelotas/RS – III (15121831)

---

## 1. Rodando localmente

### Pré-requisitos
- Node.js 20+
- Uma conta gratuita no [neon.tech](https://neon.tech)

### 1.1 Criar o banco no Neon
1. Crie uma conta e um projeto no Neon (plano gratuito).
2. No painel do projeto, copie duas strings de conexão:
   - **Pooled connection** → vai em `DATABASE_URL`
   - **Direct connection** (sem `-pooler` na URL) → vai em `DIRECT_URL`

### 1.2 Configurar e rodar o backend
```bash
cd server
cp .env.example .env
# edite o .env com as duas URLs do Neon, um JWT_SECRET forte
# e os dados do usuário admin (SEED_ADMIN_*)

npm install
npx prisma migrate dev --name init   # cria as tabelas no Neon
npm run seed                          # cria o primeiro usuário administrador
npm run dev                           # sobe a API em http://localhost:3333
```

### 1.3 Configurar e rodar o frontend
```bash
cd client
cp .env.example .env   # confira se VITE_API_URL aponta para http://localhost:3333/api
npm install
npm run dev             # abre em http://localhost:5173
```

Entre com o e-mail/senha definidos em `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`. Depois, use "Adicionar colega" (menu do administrador) para criar contas para o restante da equipe — cada nova conta já sai com senha em hash bcrypt.

---

## 2. Colocando em produção — tudo gratuito

A combinação sugerida, sem custo:
- **Neon** → banco Postgres (já configurado acima)
- **Render** (plano free) → hospeda a API (backend)
- **Vercel** (plano free) → hospeda o painel (frontend)

### 2.1 Suba o projeto para o GitHub
Crie um repositório e envie as pastas `server/` e `client/` (pode ser um monorepo, como está aqui).

### 2.2 Backend no Render
1. Crie uma conta em [render.com](https://render.com) e clique em **New → Web Service**, apontando para o repositório.
2. Configurações do serviço:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm start`
3. Em **Environment**, adicione as mesmas variáveis do `.env` (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN` — depois de criar o site no Vercel, volte aqui e coloque a URL dele).
4. Depois do primeiro deploy, rode o seed uma única vez (Render → aba **Shell** do serviço): `npm run seed`.
5. Anote a URL pública gerada (algo como `https://chamados-api.onrender.com`).

> No plano gratuito do Render, o serviço "dorme" após um tempo sem uso e demora alguns segundos para acordar na primeira requisição — normal e sem custo.

### 2.3 Frontend no Vercel
1. Crie uma conta em [vercel.com](https://vercel.com) e importe o mesmo repositório.
2. **Root Directory**: `client`
3. Vercel detecta Vite automaticamente (`npm run build`, saída em `dist`).
4. Em **Environment Variables**, adicione `VITE_API_URL` apontando para a URL do backend no Render + `/api` (ex.: `https://chamados-api.onrender.com/api`).
5. Faça o deploy. Depois, volte no Render e atualize `CORS_ORIGIN` com a URL final do Vercel (ex.: `https://chamados-app.vercel.app`), e reinicie o serviço.

Pronto: painel público no Vercel, API no Render, banco no Neon — tudo nos planos gratuitos.

---

## 3. Próximos ajustes possíveis
- Notificações por e-mail quando um chamado está perto do prazo.
- Histórico de alterações por chamado (quem editou e quando).
- Exportação da lista de chamados em PDF/Excel.
- Anexar os documentos comprobatórios (upload de arquivos) diretamente no chamado.

Este backend já está organizado em módulos (`controllers`, `routes`, `middleware`, `lib`) e com Prisma, então esses ajustes futuros entram como novas rotas/campos sem precisar reestruturar o projeto.
