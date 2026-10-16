-- AlterTable: campos opcionais do chamado + data de conclusão
ALTER TABLE "tickets" ALTER COLUMN "ra" SET DEFAULT '';
ALTER TABLE "tickets" ALTER COLUMN "curso" SET DEFAULT '';
ALTER TABLE "tickets" ALTER COLUMN "situacaoAtual" SET DEFAULT '';
ALTER TABLE "tickets" ALTER COLUMN "justificativa" SET DEFAULT '';
ALTER TABLE "tickets" ADD COLUMN "dataConclusao" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "data" DATE NOT NULL,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "concluidaEm" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tasks_data_idx" ON "tasks"("data");

-- CreateIndex
CREATE INDEX "tasks_userId_idx" ON "tasks"("userId");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
