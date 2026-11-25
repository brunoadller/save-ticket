# Filtros, responsável e nova tabela de chamados — requisitos para o Claude Code

Projeto: plataforma de chamados dos polos Pelotas/RS (`client` React + Vite + Tailwind, `server` Node/Express/Prisma/Neon).

## Como começar

1. Leia `client/src/pages/Chamados.tsx`, `client/src/components/tickets/` (`TicketFilters.tsx`, `TicketStats.tsx`, `TicketList.tsx`, `TicketRow.tsx`, `TicketDetails.tsx`, `TicketForm.tsx`), `client/src/hooks/useTickets.ts`, `client/src/pages/Calendario.tsx`, `client/src/constants.ts`, `client/src/types.ts`, `server/src/controllers/ticket.controller.ts`, `server/src/routes/` e `server/prisma/schema.prisma`.
2. Mostre um **plano curto** antes de alterar qualquer arquivo. O plano deve dizer o que muda no banco e em que ordem as etapas serão feitas.
3. Implemente conforme as decisões abaixo, **em etapas**, com `tsc` e `build` passando ao fim de cada uma:
   1. Banco e API (responsável, situação do aluno, exclusão em lote, `GET /users`).
   2. Filtros e busca.
   3. Seleção e exclusão em lote.
   4. Novo visual da tabela.

## Convenções do projeto

- Código, arquivos, variáveis, funções e componentes em **inglês**; textos da interface em **português**.
- Datas de calendário são strings `AAAA-MM-DD` (ver `client/src/lib/dates.ts` e `server/src/utils/date.ts`). Não converter com `new Date()` para exibir.
- Mudanças de banco: criar a migration **somente na branch `dev` do Neon**. Nunca rodar `prisma migrate dev` apontando para produção. Fazer commit da pasta `prisma/migrations`. Antes de migrar, conferir no `server/.env` que `DATABASE_URL` e `DIRECT_URL` são os da `dev`.
- Não ler, imprimir nem commitar `.env`.
- Sem novas dependências para o visual: usar Tailwind. As cores passam a vir de **variáveis CSS** com tema claro e escuro (ver "Tema e cores"), mantendo os nomes dos tokens já usados (`ink`, `accent`, `ok`, `warn`, `danger`) para não reescrever o projeto inteiro.

## Decisões já tomadas

### 1. Quem cadastra não é quem resolve: novo campo "Responsável"

- Criar o campo **responsável** no chamado: o usuário que está cuidando dele. Serve para o caso de outra pessoa assumir o chamado (férias, ausência).
- Banco: `assignedToId String?` com relação opcional ao `User`, mais o índice correspondente. **Não** apagar nem renomear `createdBy`/`userId`: ele continua sendo o criador.
- Ao criar um chamado, o responsável vem **preenchido com o próprio criador**, mas pode ser trocado no formulário. Qualquer usuário logado pode **trocar o responsável** de qualquer chamado (é exatamente o caso de passar o chamado para quem está de plantão).
- Chamados já existentes ficam com responsável vazio. Na interface mostrar "Sem responsável" e permitir filtrar por essa opção. Não fazer preenchimento automático dos antigos.
- Na lista e nos detalhes mostrar **os dois**: "Criado por" e "Responsável".
- A API devolve `createdBy` e `assignedTo` com apenas `id` e `name`.

### 2. Filtros por pessoa

- Dois seletores independentes: **"Criado por"** e **"Responsável"**, cada um com **uma pessoa por vez**, visíveis para **todos** os usuários logados.
- Cada seletor lista todos os usuários da equipe com a contagem de chamados (ex.: `Marina (12)`), mais a opção "Todos". O seletor de responsável tem também "Sem responsável".
- Atalho **"Meus chamados"** = chamados em que o usuário logado é o **responsável** (é o que ele precisa resolver). Também oferecer o atalho **"Criados por mim"**.
- Chamados de usuário removido ou desativado continuam aparecendo e filtráveis. Hoje o `User` não tem campo de ativo/inativo: não criar um agora; apenas garantir que o filtro não quebre.
- Criar `GET /users` autenticado que devolve só `id` e `name` (nunca e-mail nem hash de senha) para montar os seletores.

### 3. Situação do aluno (campo "Situação atual")

- Hoje é texto livre. Passa a ser uma **lista fixa de opções**, escolhida em um seletor no formulário:
  - Ativo
  - Formando
  - Concluído
  - Desistente
  - Não efetuou a matrícula
- Banco: enum Prisma (ex.: `StudentStatus` com `ATIVO`, `FORMANDO`, `CONCLUIDO`, `DESISTENTE`, `SEM_MATRICULA`), campo **opcional**. Os rótulos em português ficam em `client/src/constants.ts`.
- Atenção aos dados antigos: o campo atual é texto (há valores como "FORMANDO"). Na migration, converter os valores que baterem com uma opção (ignorando maiúsculas, minúsculas e acentos) e deixar vazio o que não bater. **Antes de migrar, listar na branch `dev` os valores distintos que existem hoje** e me mostrar no plano quantos não serão convertidos.
- Na tabela, mostrar a situação como um selo colorido discreto (cores abaixo, na seção de visual).
- Validar no backend com Zod usando o enum.

### 4. Permissões

- Todos continuam **vendo todos os chamados** (comportamento atual).
- **Editar, concluir e trocar o responsável**: liberados para todos (comportamento atual).
- **Excluir**: somente o **criador** do chamado ou um **administrador**. Quem é só o responsável, mas não o criador, **não** exclui. Aplicar no backend (responder 403) e esconder ou desabilitar a ação no frontend para quem não pode.

### 5. Seleção e exclusão em lote

- Cada linha da tabela tem uma **caixa de seleção** (checkbox). O cabeçalho tem a caixa **"Selecionar todos"**, com estado intermediário quando só parte estiver marcada.
- "Selecionar todos" marca todos os chamados **do resultado filtrado** (não só os visíveis na tela) que o usuário **tem permissão de excluir**. Linhas que o usuário não pode excluir têm a caixa desabilitada, com dica explicando o motivo. Administrador pode marcar todas.
- A caixa não pode abrir/fechar o detalhe da linha nem acionar o "concluir" (usar `stopPropagation`).
- Com 1 ou mais selecionados aparece uma **barra de ações fixa na parte de baixo da tela** com: "N selecionados", "Limpar seleção" e "Excluir selecionados".
- "Excluir selecionados" abre uma **confirmação** com a quantidade e os primeiros nomes/protocolos, avisando que a ação não pode ser desfeita. Só exclui depois de confirmar.
- Backend: `DELETE /tickets/bulk` recebendo `{ ids: string[] }` (máximo de 200 por requisição), em **uma transação**. Se qualquer chamado da lista não for permitido ao usuário, responder 403 e **não excluir nenhum**. Ids inexistentes são ignorados e o retorno informa quantos foram excluídos.
- A seleção é limpa ao mudar qualquer filtro ou busca e depois de excluir.
- A exclusão individual atual continua existindo.

### 6. Outros filtros e busca

- **Período** pela **data de previsão** (`dataPrazo`), com atalhos: "Hoje", "Esta semana" e "Atrasados" (previsão anterior a hoje e chamado não concluído), além de intervalo manual (de/até).
- Filtros existentes continuam: **polo** e **status**.
- Filtro por **situação do aluno**: não pedido por enquanto (ver "Em aberto").
- **Busca por texto** em: protocolo, nome do aluno, CPF, telefone e RA. CPF e telefone devem casar **com ou sem máscara** (comparar só dígitos).

### 7. Comportamento dos filtros

- Todos os filtros **se combinam** (criador + responsável + polo + status + período + busca).
- Botão **"Limpar filtros"** e indicação de quantos filtros estão ativos.
- Os filtros ficam **na URL** (query string, ex.: `/?criador=<id>&responsavel=<id>&polo=PELOTAS_II&status=EXPIRADO&de=2026-11-01&ate=2026-11-30&q=maria`) usando `useSearchParams` do `react-router-dom`, para atualizar a página sem perder o estado e compartilhar o link.
- **Cartões de contagem** (em andamento, expirado, concluído) seguem os filtros de criador, responsável, polo, período e busca, mas **não** o filtro de status (o clique no cartão é que define o status).
- **Ordenação**: padrão por previsão mais próxima. Permitir ordenar também por data de realização e por nome do aluno, clicando no cabeçalho da coluna, com indicação de crescente/decrescente.

### 8. Volume e outras telas

- Manter a filtragem **no navegador** (até cerca de 1.000 chamados). Isolar a lógica em uma função pura (ex.: `filterTickets(tickets, filters)` em `client/src/lib/ticketFilters.ts`) para poder migrar para o servidor depois, com paginação.
- O **calendário** (`Calendario.tsx`) também deve ter os filtros por criador e por responsável, aplicados aos chamados que aparecem no dia da previsão. Reaproveitar o mesmo componente de seletor e a mesma função de filtro.

## Novo visual da tabela

Objetivo pedido: **minimalista, mas robusto e agradável de olhar, sem ficar seco**. Hoje a tabela é só texto em linhas com borda. A direção é uma lista de "linhas-cartão" bem organizadas, mantendo a paleta atual.

- **Contêiner**: cantos arredondados maiores, sombra bem suave, fundo branco sobre o fundo cinza claro da página. Cabeçalho da tabela fixo (sticky) ao rolar, com fundo levemente diferente e rótulos pequenos em caixa alta.
- **Linhas**: mais altas (respiro vertical), com **faixa colorida na borda esquerda** conforme o estado: vermelho para expirado, verde para concluído, destaque (accent) para em andamento. Ao passar o mouse, fundo suave e leve realce. Linha selecionada com fundo de destaque claro.
- **Aluno**: avatar circular com as **iniciais** do nome, em cor derivada do nome (paleta curta e discreta, sempre com contraste legível), nome em negrito, e abaixo CPF e telefone em tom secundário.
- **Protocolo**: em um "chip" com fonte monoespaçada, com o polo abaixo em selo pequeno (cada polo pode ter uma cor própria suave).
- **Status e prazo**: selo com um ponto colorido (ex.: ● Em andamento, ● Prazo expirado, ● Concluído) e abaixo o texto relativo já existente ("Atrasado há 3 dias", "Vence hoje", "Faltam 5 dias"), com ícone. Em chamados em andamento, uma **barra de progresso fininha** entre a data de realização e a de previsão ajuda a ver o quanto do prazo já passou.
- **Situação do aluno**: selo pequeno com cor própria para cada opção (ex.: Ativo em azul, Formando em roxo, Concluído em verde, Desistente em cinza, Não efetuou a matrícula em âmbar). Escolher tons suaves e com contraste suficiente.
- **Pessoas**: criador e responsável como **mini avatares com iniciais** e o nome ao lado (ou em dica ao passar o mouse). Se o responsável for diferente do criador, deixar isso visível; se não houver responsável, mostrar "Sem responsável" em tom discreto.
- **Cabeçalhos ordenáveis** com setinha de direção. Colunas de seleção e de ações com largura fixa.
- **Detalhes ao expandir**: painel organizado em seções (Aluno, Chamado, Pessoas, Justificativa) com leve fundo e linha do tempo curta (realização → previsão → conclusão), mantendo as ações Editar, Concluir/Reabrir e Excluir.
- **Estados vazios e de carregamento**: carregando com linhas "esqueleto" (skeleton), vazio com ícone, uma frase e um botão ("Novo chamado" ou "Limpar filtros").
- **Barra de ferramentas** acima da tabela: busca com ícone, filtros em chips removíveis, e contador "N de M chamados".
- **Responsivo**: em telas pequenas cada linha vira um **cartão** empilhado, com as mesmas informações principais e os selos no topo.
- **Acessibilidade**: foco visível em todos os controles, `aria-label` nas caixas de seleção e nos botões de ícone, contraste adequado, e não depender só da cor para indicar estado (sempre acompanhar com texto ou ícone).
- Manter o estilo geral do projeto (cantos arredondados, uso contido de cor) e seguir a paleta da seção abaixo. Se houver uma skill de design de frontend disponível, usá-la para refinar a aparência.

## Tema e cores (claro e escuro, inspirado no site da Neon)

Referência de estilo: o site da Neon (neon.com). Fundo escuro quase preto, superfícies em cinza-grafite, bordas finas e sutis, texto claro, e **um único verde neon** como cor de destaque. Visual limpo, técnico e com bastante respiro. O sistema deve ter **modo escuro e modo claro**, com um botão para alternar.

### Como implementar
- Tailwind com `darkMode: "class"` em `client/tailwind.config.js`. Definir as cores como **variáveis CSS** em `client/src/index.css` (`:root` para o claro e `.dark` para o escuro) e apontar os tokens do Tailwind para elas (ex.: `bg-surface`, `text-fg`, `border-line`, `accent`). Assim os componentes não precisam de `dark:` em todo lugar.
- Botão de alternar tema (sol/lua) **na sidebar** e também na tela de login. Três opções: Claro, Escuro e **Sistema** (segue o `prefers-color-scheme`). O padrão é **Sistema**.
- Guardar a escolha em `localStorage`, **sempre dentro de `try/catch`** (pode lançar erro em janela privada). Aplicar a classe `dark` no `<html>` com um pequeno script inline no `client/index.html`, **antes** do React carregar, para não piscar branco ao abrir no escuro.
- Criar um hook/contexto de tema (ex.: `ThemeContext`) com `theme` e `setTheme`, no mesmo padrão do `AuthContext`.
- Transição suave de cor ao trocar o tema (cerca de 150 ms), sem animar o carregamento inicial.

### Paleta sugerida (valores aproximados: ajustar a olho, mantendo o contraste)

| Token | Escuro | Claro |
| --- | --- | --- |
| Fundo da página | `#0B0C0E` | `#F6F7F9` |
| Superfície (cartões, tabela) | `#131518` | `#FFFFFF` |
| Superfície elevada (menus, modais, barra de ações) | `#1A1D21` | `#FFFFFF` com sombra |
| Borda | `#25282D` | `#E3E6EA` |
| Texto principal | `#EDEEF0` | `#14171A` |
| Texto secundário | `#9BA1A8` | `#5B636B` |
| Destaque (accent) | verde neon próximo de `#00E599` | verde mais escuro, próximo de `#0A7F57` (texto/ícone) |
| Sucesso / concluído | `#34D399` | `#0A7F57` |
| Atenção / vence logo | `#FBBF24` | `#B45309` |
| Perigo / expirado | `#F87171` | `#C62828` |

- A cor do destaque no escuro é o **verde neon**. No claro, o verde neon puro **não tem contraste** para texto sobre fundo branco: usar a versão mais escura para texto e ícones e o verde neon apenas como **preenchimento** (botão principal, ponto do status, barra de progresso), com **texto escuro** por cima.
- Botão principal: fundo no verde de destaque, texto escuro, cantos arredondados; ao passar o mouse, um pouco mais claro no escuro e um pouco mais escuro no claro. Botões secundários: fundo transparente com borda fina.
- Sidebar: no escuro, mesma cor do fundo ou um pouco mais escura, com o item ativo destacado por uma barrinha lateral verde e fundo sutil. No claro, branca com borda.
- Selos de status e de situação do aluno: usar fundo **translúcido** da própria cor (ex.: 12–15% de opacidade) com texto na cor cheia, nos dois temas. Verificar a legibilidade de cada um em ambos.
- Faixa lateral da linha da tabela, ponto do status e barra de prazo usam as cores de sucesso, atenção, perigo e destaque da tabela acima.
- Avatares de iniciais: paleta curta de tons suaves que funcione nos dois temas (fundo translúcido, letra na cor cheia).
- Foco visível em todos os controles com anel na cor de destaque. Contraste mínimo de 4,5:1 para texto normal nos dois temas.
- Gráficos, selos e a barra de progresso devem ler as mesmas variáveis; **nenhuma cor fixa em hexadecimal dentro dos componentes**.
- Telas a revisar nos dois temas: login, sidebar, chamados (lista, filtros, detalhes, formulário, barra de ações, confirmações), calendário (visão do ano, do mês e painel do dia) e novo usuário.

## Critérios de aceite

- [ ] É possível definir o **responsável** ao criar e ao editar um chamado; por padrão vem o criador; chamados antigos aparecem como "Sem responsável".
- [ ] Selecionar "Marina" em "Criado por" mostra só os chamados criados por ela; em "Responsável" mostra só os que estão com ela. "Meus chamados" mostra os do usuário logado como responsável.
- [ ] Combinar criador + responsável + polo + status + período funciona, e "Limpar filtros" volta ao estado inicial.
- [ ] Recarregar a página com filtros na URL mantém o mesmo resultado; link copiado abre igual.
- [ ] Buscar `123.456.789-00` e `12345678900` retorna o mesmo chamado; idem para telefone.
- [ ] A situação do aluno é escolhida em lista (Ativo, Formando, Concluído, Desistente, Não efetuou a matrícula), e os dados antigos convertíveis foram migrados.
- [ ] Os cartões de contagem respeitam criador, responsável, polo, período e busca, e ignoram o status.
- [ ] Excluir (individual ou em lote) só funciona para o criador ou administrador; a API responde 403 caso contrário e, no lote, não exclui nada.
- [ ] "Selecionar todos" marca todos os chamados excluíveis do resultado filtrado; a barra de ações mostra a quantidade; a confirmação aparece antes de excluir; a seleção some depois.
- [ ] Marcar a caixa de seleção não abre o detalhe nem altera o status do chamado.
- [ ] `GET /users` não devolve e-mail nem hash de senha.
- [ ] Os filtros por criador e responsável também funcionam no calendário.
- [ ] A nova tabela funciona em tela de computador e de celular, com faixa de estado, avatares, selos, estados vazio e de carregamento.
- [ ] Existe botão de tema (Claro, Escuro, Sistema) na sidebar e no login; a escolha é lembrada ao recarregar e a página não pisca branco ao abrir no escuro.
- [ ] Todas as telas listadas acima ficam legíveis nos dois temas, com contraste mínimo de 4,5:1 para texto, e sem cores fixas em hexadecimal nos componentes.
- [ ] `npx tsc --noEmit` e `npm run build` passam em `client` e `server`.

## Em aberto (não implementar sem confirmar)

- Filtro por **situação do aluno** (agora é uma lista fixa, então é simples de fazer): confirmar se querem.
- **Exportar a lista filtrada em CSV**: deixar para depois do filtro estável.
- Migração da filtragem para o **servidor** com paginação, se o volume passar de ~1.000 chamados.
- Histórico de quem trocou o responsável e quando: não pedido; só registrar se a equipe quiser.

## Dados de teste

Usar a branch `dev` do Neon com 3 usuários (um administrador e dois membros, por exemplo Marina e outro) e chamados **fictícios** distribuídos entre eles, polos, status e situações do aluno, incluindo alguns com responsável diferente do criador e alguns sem responsável, para validar os critérios acima. Não usar dados reais de alunos.
