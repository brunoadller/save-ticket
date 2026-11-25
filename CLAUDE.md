# save-ticket — Plataforma de chamados dos polos Pelotas/RS

Monorepo com duas apps independentes (sem workspace na raiz; cada pasta tem seu `package.json`):

- `server/` — Node 20 + Express + TypeScript + Prisma (Postgres no Neon). Módulos: `controllers`, `routes`, `middleware`, `lib`, `utils`.
- `client/` — React 18 + Vite + TypeScript + Tailwind 3. Páginas em `src/pages`, componentes em `src/components`, hooks em `src/hooks`.

Detalhes de deploy e variáveis de ambiente: `README.md`.

## Comandos

```bash
# server (porta 3333)
cd server && npm install && npm run dev
npx tsc --noEmit          # checagem de tipos
npm run build             # tsc -> dist/
npx prisma generate

# client (porta 5173)
cd client && npm install && npm run dev
npx tsc --noEmit
npm run build             # tsc -b && vite build
```

Não há suíte de testes automatizados ainda; a verificação mínima é `tsc --noEmit` + `build` nas duas pastas.

## Convenções

- Código, arquivos, variáveis, funções e componentes em **inglês**; textos da interface em **português**.
- Datas de calendário são strings `AAAA-MM-DD` (`client/src/lib/dates.ts`, `server/src/utils/date.ts`). Não converter com `new Date()` para exibir.
- Validação de entrada no backend com Zod.
- Sem novas dependências para o visual: usar Tailwind.

## Banco de dados (Neon) — cuidado

- Migrations **somente na branch `dev` do Neon**. Nunca rodar `prisma migrate dev` apontando para produção.
- Antes de migrar, conferir que `DATABASE_URL` e `DIRECT_URL` do `server/.env` são os da `dev`.
- Fazer commit da pasta `server/prisma/migrations`. Em produção o Render roda `prisma migrate deploy` no start.
- **Nunca ler, imprimir ou commitar `.env`.** Use apenas os `.env.example`.
- Dados de teste: fictícios, nunca alunos reais.

## Deploy

`git push` na `main` publica sozinho (Render = API, Vercel = painel). Só fazer push/deploy quando o usuário pedir.

## Tarefa em andamento

Requisitos de filtros, responsável, exclusão em lote, novo visual e tema claro/escuro: `docs/filtros-chamados.md`. Trabalhar em etapas, mostrando um plano curto antes de alterar arquivos, com `tsc` e `build` passando ao fim de cada etapa.
