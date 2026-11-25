-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ATIVO', 'FORMANDO', 'CONCLUIDO', 'DESISTENTE', 'SEM_MATRICULA');

-- Preserva o texto livre antigo (nenhum dado existente é perdido)
ALTER TABLE "tickets" RENAME COLUMN "situacaoAtual" TO "situacaoAtualLegado";

-- Novo campo em enum: só converte o que bate exatamente com uma opção
-- (ignorando maiúsculas/minúsculas e acentos); o restante fica vazio.
ALTER TABLE "tickets" ADD COLUMN "situacaoAtual" "StudentStatus";
UPDATE "tickets" SET "situacaoAtual" = CASE
  WHEN translate(lower(trim("situacaoAtualLegado")), 'áàâãäéèêëíìîïóòôõöúùûüç', 'aaaaaeeeeiiiiooooouuuuc') = 'ativo' THEN 'ATIVO'::"StudentStatus"
  WHEN translate(lower(trim("situacaoAtualLegado")), 'áàâãäéèêëíìîïóòôõöúùûüç', 'aaaaaeeeeiiiiooooouuuuc') = 'formando' THEN 'FORMANDO'::"StudentStatus"
  WHEN translate(lower(trim("situacaoAtualLegado")), 'áàâãäéèêëíìîïóòôõöúùûüç', 'aaaaaeeeeiiiiooooouuuuc') = 'concluido' THEN 'CONCLUIDO'::"StudentStatus"
  WHEN translate(lower(trim("situacaoAtualLegado")), 'áàâãäéèêëíìîïóòôõöúùûüç', 'aaaaaeeeeiiiiooooouuuuc') = 'desistente' THEN 'DESISTENTE'::"StudentStatus"
  WHEN translate(lower(trim("situacaoAtualLegado")), 'áàâãäéèêëíìîïóòôõöúùûüç', 'aaaaaeeeeiiiiooooouuuuc') IN ('nao efetuou a matricula', 'sem matricula') THEN 'SEM_MATRICULA'::"StudentStatus"
  ELSE NULL
END;

-- Telefone e responsável (chamados antigos ficam sem responsável)
ALTER TABLE "tickets" ADD COLUMN "telefone" TEXT NOT NULL DEFAULT '';
ALTER TABLE "tickets" ADD COLUMN "assignedToId" TEXT;

-- CreateIndex
CREATE INDEX "tickets_assignedToId_idx" ON "tickets"("assignedToId");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
